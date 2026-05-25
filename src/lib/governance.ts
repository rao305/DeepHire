import type { AgentType, EvidencePacket } from "@/types"

/**
 * Custom error for rate limit violations
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public agentType: AgentType,
    public targetDomain: string,
    public limit: number,
    public resetTime: Date
  ) {
    super(message)
    this.name = "RateLimitError"
  }
}

/**
 * Allowlisted domains by category
 */
export const ALLOWLISTED_DOMAINS: Record<string, string[]> = {
  github: ["github.com", "raw.githubusercontent.com", "gist.github.com"],
  portfolio: [
    "vercel.app",
    "netlify.app",
    "github.io",
    "herokuapp.com",
    "web.app",
    "render.com",
  ],
  linkedin: ["linkedin.com"],
  documentation: ["docs.google.com", "notion.so", "gitbook.io"],
}

/**
 * PII fields that agents must NEVER extract
 */
export const FORBIDDEN_EXTRACTIONS: string[] = [
  "date_of_birth",
  "home_address",
  "phone_number",
  "social_security_number",
  "race",
  "ethnicity",
  "religion",
  "gender",
  "sexual_orientation",
  "disability_status",
  "pregnancy_status",
  "profile_photo",
  "physical_appearance",
]

/**
 * Governance policy descriptions for UI display
 */
export const GOVERNANCE_RULES: Record<string, string> = {
  linkedin_data_minimization:
    "Only employment title, company, and dates extracted from LinkedIn",
  public_sources_only:
    "DeepHire only accesses publicly available information",
  human_review_required:
    "Contradiction findings require human recruiter review before action",
  no_pii_extraction:
    "Personal identifiable information (PII) is never extracted or stored",
  rate_limiting: "Strict rate limits prevent excessive profile scraping",
  audit_trail: "All agent access is logged for compliance and transparency",
  https_only: "All web requests use encrypted HTTPS connections",
  no_tracking: "Tracking parameters and cookies are removed from stored data",
  domain_allowlist: "Agents can only access pre-approved, trusted domains",
  safe_url_validation: "URLs are validated to prevent injection attacks",
}

/**
 * In-memory rate limit tracker
 * Map<agentType:domain, { count: number, resetAt: Date }>
 */
const rateLimitTracker = new Map<
  string,
  { count: number; resetAt: Date; requests: Date[] }
>()

/**
 * Rate limits per agent type (requests per hour)
 */
const RATE_LIMITS: Record<AgentType, number> = {
  linkedin: 10,
  github_api: 50,
  github_browser: 30,
  portfolio_browser: 30,
}

/**
 * Validates a navigation target URL for an agent
 */
export function validateNavigationTarget(
  url: string,
  agentType: AgentType
): { allowed: boolean; reason?: string } {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return {
      allowed: false,
      reason: "Invalid URL format",
    }
  }

  const protocol = parsed.protocol as string

  // Block dangerous protocols first
  if (
    protocol === "data:" ||
    protocol === "javascript:" ||
    protocol === "file:"
  ) {
    return {
      allowed: false,
      reason: `Protocol ${protocol} is not allowed`,
    }
  }

  // Require HTTPS
  if (protocol !== "https:") {
    return {
      allowed: false,
      reason: "Only HTTPS URLs are allowed for security",
    }
  }

  // Block localhost and internal IPs
  const hostname = parsed.hostname.toLowerCase()
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    return {
      allowed: false,
      reason: "Localhost and internal IP addresses are not allowed",
    }
  }

  // Check domain allowlist
  const allowedDomains = getAllowedDomainsForAgent(agentType)
  const isAllowed = allowedDomains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  )

  if (!isAllowed) {
    return {
      allowed: false,
      reason: `Domain ${hostname} is not on the allowlist for ${agentType} agents`,
    }
  }

  return { allowed: true }
}

/**
 * Get allowed domains for a specific agent type
 */
function getAllowedDomainsForAgent(agentType: AgentType): string[] {
  switch (agentType) {
    case "linkedin":
      return [...ALLOWLISTED_DOMAINS.linkedin]
    case "github_api":
    case "github_browser":
      return [...ALLOWLISTED_DOMAINS.github]
    case "portfolio_browser":
      return [
        ...ALLOWLISTED_DOMAINS.portfolio,
        ...ALLOWLISTED_DOMAINS.documentation,
      ]
    default:
      return []
  }
}

/**
 * Recursively filters forbidden content from extracted data
 */
export function filterForbiddenContent<T = unknown>(extractedData: T): T {
  if (extractedData === null || extractedData === undefined) {
    return extractedData
  }

  if (Array.isArray(extractedData)) {
    return extractedData.map((item) => filterForbiddenContent(item)) as unknown as T
  }

  if (typeof extractedData === "object") {
    const filtered: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(extractedData as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase()

      const isForbidden = FORBIDDEN_EXTRACTIONS.some((forbidden) =>
        lowerKey.includes(forbidden.toLowerCase())
      )

      if (isForbidden) {
        console.warn(
          `[GOVERNANCE] Filtered forbidden field: ${key} (matches PII policy)`
        )
        filtered[key] = "[REDACTED - PII]"
      } else {
        filtered[key] = filterForbiddenContent(value)
      }
    }
    return filtered as unknown as T
  }

  return extractedData
}

/**
 * Logs agent access for audit trail
 *
 * NOTE: There is no governance_logs database table yet, so we log to console only.
 * When a governance_logs table is added to the schema, swap this for a Drizzle insert.
 */
export async function logAgentAccess(entry: {
  agentType: AgentType
  candidateId?: string
  targetUrl: string
  purpose: string
  dataExtracted: string[]
  recruiterId?: string
}): Promise<void> {
  console.info("[GOVERNANCE]", {
    event: "agent_access",
    agentType: entry.agentType,
    candidateId: entry.candidateId,
    targetUrl: entry.targetUrl,
    purpose: entry.purpose,
    dataExtracted: entry.dataExtracted,
    recruiterId: entry.recruiterId,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Enforces rate limits for agent access
 */
export async function enforceRateLimit(
  agentType: AgentType,
  targetDomain: string
): Promise<void> {
  const key = `${agentType}:${targetDomain}`
  const limit = RATE_LIMITS[agentType] || 50
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  let tracker = rateLimitTracker.get(key)

  // Initialize or reset if expired
  if (!tracker || tracker.resetAt < now) {
    tracker = {
      count: 0,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
      requests: [],
    }
    rateLimitTracker.set(key, tracker)
  }

  // Clean up old requests (older than 1 hour)
  tracker.requests = tracker.requests.filter((req) => req > oneHourAgo)

  // Check if limit exceeded
  if (tracker.requests.length >= limit) {
    throw new RateLimitError(
      `Rate limit exceeded for ${agentType} on ${targetDomain}. Limit: ${limit} requests/hour. Try again after ${tracker.resetAt.toLocaleTimeString()}.`,
      agentType,
      targetDomain,
      limit,
      tracker.resetAt
    )
  }

  // Add current request
  tracker.requests.push(now)
  tracker.count = tracker.requests.length
}

/**
 * Test-only helper to clear rate limit state between assertions.
 */
export function _resetRateLimitsForTesting(): void {
  rateLimitTracker.clear()
}

/**
 * Determines if evidence packet requires human review
 */
export function requiresHumanReview(packet: EvidencePacket): boolean {
  if (packet.agentType === "linkedin") {
    return true
  }

  if (packet.verdict === "CONTRADICTED") {
    return true
  }

  if (packet.confidence !== undefined && packet.confidence < 0.4) {
    return true
  }

  return false
}

/**
 * Sanitizes data before storage
 */
export function sanitizeForStorage<T = unknown>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForStorage(item)) as unknown as T
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase()

      if (
        lowerKey.includes("html") ||
        lowerKey.includes("raw_content") ||
        lowerKey === "body" ||
        lowerKey.includes("cookie") ||
        lowerKey.includes("session")
      ) {
        continue
      }

      if (
        typeof value === "string" &&
        (lowerKey.includes("url") || lowerKey.includes("link"))
      ) {
        sanitized[key] = removeTrackingParams(value)
      } else {
        sanitized[key] = sanitizeForStorage(value)
      }
    }
    return sanitized as unknown as T
  }

  return data
}

/**
 * Removes tracking parameters from URLs
 */
function removeTrackingParams(url: string): string {
  try {
    const parsed = new URL(url)
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "msclkid",
      "mc_cid",
      "mc_eid",
      "_ga",
      "_gid",
      "ref",
      "source",
    ]

    trackingParams.forEach((param) => {
      parsed.searchParams.delete(param)
    })

    return parsed.toString()
  } catch {
    // If URL parsing fails, return as-is
    return url
  }
}
