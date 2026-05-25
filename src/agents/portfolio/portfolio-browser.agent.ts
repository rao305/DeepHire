import { chromium, Browser, Page } from "playwright";
import { visionPlanner } from "@/agents/vision-planner";
import { uploadScreenshotToR2 } from "@/lib/r2";
import type {
  ExtractedClaim,
  JobRubric,
  RetrievalBudget,
  Evidence,
  ShippedWorkItem,
} from "@/types";

export interface PortfolioEvidence {
  shippedWork: ShippedWorkItem[];
  evidence: Evidence[];
  visitedUrls: string[];
  totalSteps: number;
  foundProjectCount: number;
  hasTechWriteups: boolean;
  screenshotKeys: string[];
}

const COMMON_TECHNOLOGIES = [
  // Frontend Frameworks & Libraries
  "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "Remix", "Astro",
  "Solid", "Qwik", "Preact", "Lit", "Alpine.js", "HTMX",

  // Backend Frameworks
  "Node.js", "Express", "Fastify", "Nest.js", "Koa", "Hapi",
  "Python", "FastAPI", "Django", "Flask", "Pyramid",
  "Ruby", "Rails", "Sinatra",
  "PHP", "Laravel", "Symfony", "CodeIgniter",
  "Go", "Gin", "Echo", "Fiber",
  "Rust", "Actix", "Rocket", "Axum",
  "Java", "Spring", "Spring Boot", "Quarkus", "Micronaut",
  "Kotlin", "Ktor",
  "C#", ".NET", "ASP.NET", "ASP.NET Core",
  "Elixir", "Phoenix",

  // Databases
  "PostgreSQL", "MySQL", "MariaDB", "MongoDB", "Redis", "Elasticsearch",
  "Cassandra", "DynamoDB", "CouchDB", "Neo4j", "SQLite", "Supabase",
  "PlanetScale", "Neon", "Turso", "Firebase", "Firestore",

  // Cloud & DevOps
  "AWS", "GCP", "Azure", "Vercel", "Netlify", "Cloudflare", "Heroku",
  "DigitalOcean", "Railway", "Render", "Fly.io",
  "Docker", "Kubernetes", "K8s", "Helm", "Terraform", "Ansible",
  "Jenkins", "CircleCI", "GitHub Actions", "GitLab CI", "Travis CI",

  // Languages
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Kotlin",
  "C++", "C#", "Ruby", "PHP", "Swift", "Dart", "Elixir", "Clojure",
  "Scala", "Haskell", "OCaml", "F#",

  // Mobile
  "React Native", "Flutter", "Swift", "SwiftUI", "Kotlin", "Jetpack Compose",
  "Ionic", "Capacitor", "Expo",

  // CSS & Styling
  "Tailwind", "TailwindCSS", "CSS", "Sass", "SCSS", "Less", "Styled Components",
  "Emotion", "CSS Modules", "PostCSS", "Bootstrap", "Material UI", "Chakra UI",
  "shadcn/ui", "Ant Design", "Mantine",

  // API & Data
  "GraphQL", "REST", "gRPC", "WebSockets", "tRPC", "Apollo", "Prisma",
  "Drizzle", "TypeORM", "Sequelize", "Mongoose", "SQLAlchemy",

  // Payment & Services
  "Stripe", "PayPal", "Square", "Braintree",

  // Auth
  "Auth0", "Clerk", "NextAuth", "Passport.js", "OAuth", "JWT",

  // Testing
  "Jest", "Vitest", "Playwright", "Cypress", "Selenium", "Testing Library",
  "Mocha", "Chai", "pytest", "JUnit", "RSpec",

  // Build Tools
  "Webpack", "Vite", "Rollup", "Parcel", "esbuild", "Turbopack", "SWC", "Babel",

  // Other
  "WebGL", "Three.js", "D3.js", "Chart.js", "Socket.io", "WebRTC",
  "TensorFlow", "PyTorch", "Langchain", "OpenAI", "Anthropic",
];

const ALLOWED_HOSTING_DOMAINS = [
  "vercel.app",
  "netlify.app",
  "github.io",
  "web.app",
  "render.com",
  "herokuapp.com",
  "fly.dev",
  "railway.app",
  "pages.dev",
];

export class PortfolioBrowserAgent {
  private browser: Browser | null = null;

  async discoverShippedWork(
    portfolioUrl: string,
    claims: ExtractedClaim[],
    jobRubric: JobRubric,
    budget: RetrievalBudget,
    evidencePacketId: string
  ): Promise<PortfolioEvidence> {
    const startTime = Date.now();
    const evidence: Evidence[] = [];
    const shippedWork: ShippedWorkItem[] = [];
    const visitedUrls: string[] = [];
    const screenshotKeys: string[] = [];
    let totalSteps = 0;
    let hasTechWriteups = false;

    try {
      this.browser = await chromium.launch({ headless: true });
      const context = await this.browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      const page = await context.newPage();

      const portfolioDomain = new URL(portfolioUrl).hostname;

      // Step 1: Navigate to portfolio homepage
      console.log(`[Portfolio] Navigating to ${portfolioUrl}`);
      await page.goto(portfolioUrl, { waitUntil: "networkidle", timeout: 30000 });
      visitedUrls.push(portfolioUrl);
      totalSteps++;

      // Step 2: Take screenshot and analyze with vision
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshotKey = `evidence/${evidencePacketId}/portfolio-home-${Date.now()}.png`;
      await uploadScreenshotToR2(screenshotBuffer, evidencePacketId, 1);
      screenshotKeys.push(screenshotKey);

      // Step 3: Vision analysis could be added here if needed
      console.log(`[Portfolio] Analyzing portfolio layout`);

      // Step 4: Try to navigate to projects section
      const projectsSectionLink = await this.findProjectsLink(page);
      if (projectsSectionLink) {
        console.log(`[Portfolio] Navigating to projects section: ${projectsSectionLink}`);
        await page.goto(projectsSectionLink, { waitUntil: "networkidle", timeout: 30000 });
        visitedUrls.push(projectsSectionLink);
        totalSteps++;

        const projectsScreenshot = await page.screenshot({ fullPage: true });
        const projectsScreenshotKey = `evidence/${evidencePacketId}/portfolio-projects-${Date.now()}.png`;
        await uploadScreenshotToR2(projectsScreenshot, evidencePacketId, 2);
        screenshotKeys.push(projectsScreenshotKey);
      }

      // Step 5: Extract all project cards
      const projectCards = await this.extractProjectCards(page);
      console.log(`[Portfolio] Found ${projectCards.length} project cards`);

      // Step 6: Process each project
      for (const card of projectCards) {
        if (totalSteps >= budget.maxSteps) break;
        if (Date.now() - startTime >= budget.maxTimeSeconds * 1000) break;

        const technologies = this.extractTechnologies(card.description + " " + card.techStack);
        const relevanceScore = this.calculateRelevanceToRole(technologies, jobRubric);

        const workItem: ShippedWorkItem = {
          title: card.title,
          description: card.description,
          sourceUrl: card.url || portfolioUrl,
          demoUrl: card.demoUrl,
          githubUrl: undefined,
          technologies,
          hasLiveDemo: card.isLiveDemo,
          relevanceToRole: relevanceScore,
          technicalDepth: Math.min(technologies.length * 0.15, 1.0),
          recency: card.year ? `${card.year}` : undefined,
          evidenceScreenshots: [],
        };

        shippedWork.push(workItem);

        // Create evidence for this project
        evidence.push({
          claimId: "", // Will be matched later
          sourceUrl: card.url || portfolioUrl,
          sourceType: "portfolio",
          pageTitle: card.title,
          snippets: [{
            text: card.description,
            relevance: 0.7,
            supportsClaim: true,
            context: `Project: ${card.title}, Technologies: ${technologies.join(", ")}`,
          }],
          screenshotS3Key: undefined,
          timestamp: new Date(),
          agentReasoning: `Found project with relevance score ${relevanceScore.toFixed(2)}`,
        });

        // If there's a demo link, try to verify it works
        if (card.demoUrl && this.isAllowedDomain(card.demoUrl, portfolioDomain)) {
          try {
            console.log(`[Portfolio] Verifying demo: ${card.demoUrl}`);
            await page.goto(card.demoUrl, { waitUntil: "networkidle", timeout: 15000 });
            visitedUrls.push(card.demoUrl);
            totalSteps++;

            const demoScreenshot = await page.screenshot();
            const demoScreenshotKey = `evidence/${evidencePacketId}/demo-${card.title.replace(/\s+/g, "-")}-${Date.now()}.png`;
            await uploadScreenshotToR2(demoScreenshot, evidencePacketId, totalSteps);
            screenshotKeys.push(demoScreenshotKey);

            workItem.hasLiveDemo = true;
            workItem.demoUrl = card.demoUrl;
          } catch (err) {
            console.log(`[Portfolio] Demo verification failed: ${err}`);
          }
        }
      }

      // Step 7: Look for technical writeups/blog
      const hasWriteups = await this.checkForTechWriteups(page);
      hasTechWriteups = hasWriteups;

      return {
        shippedWork,
        evidence,
        visitedUrls,
        totalSteps,
        foundProjectCount: shippedWork.length,
        hasTechWriteups,
        screenshotKeys,
      };
    } catch (error) {
      console.error("[Portfolio] Error during discovery:", error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  async verifySpecificClaim(
    portfolioUrl: string,
    claim: ExtractedClaim,
    budget: RetrievalBudget,
    evidencePacketId: string
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];
    const startTime = Date.now();

    try {
      this.browser = await chromium.launch({ headless: true });
      const context = await this.browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      const page = await context.newPage();

      await page.goto(portfolioUrl, { waitUntil: "networkidle", timeout: 30000 });

      // Take screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      const screenshotKey = `evidence/${evidencePacketId}/claim-${claim.id}-${Date.now()}.png`;
      await uploadScreenshotToR2(screenshot, evidencePacketId, 1);

      // Extract page text for keyword matching
      const pageText = await page.textContent("body") || "";
      const claimKeywords = claim.text.slice(0, 200);

      // Check if claim keywords are found in the page
      const hasKeywords = claim.keywords.some(kw =>
        pageText.toLowerCase().includes(kw.toLowerCase())
      );

      if (hasKeywords) {
        evidence.push({
          claimId: claim.id,
          sourceUrl: portfolioUrl,
          sourceType: "portfolio",
          pageTitle: await page.title(),
          snippets: [{
            text: claimKeywords,
            relevance: 0.75,
            supportsClaim: true,
            context: "Found matching keywords in portfolio",
          }],
          screenshotS3Key: screenshotKey,
          timestamp: new Date(),
          agentReasoning: "Portfolio verification via keyword matching",
        });
      }

      return evidence;
    } catch (error) {
      console.error("[Portfolio] Error verifying claim:", error);
      return evidence;
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  private async findProjectsLink(page: Page): Promise<string | null> {
    // Try to find links with common project section names
    const projectKeywords = ["projects", "work", "portfolio", "case studies", "my work"];

    for (const keyword of projectKeywords) {
      try {
        const link = await page.locator(`a:has-text("${keyword}")`).first();
        if (await link.isVisible({ timeout: 2000 })) {
          const href = await link.getAttribute("href");
          if (href) {
            return new URL(href, page.url()).href;
          }
        }
      } catch {
        // Continue to next keyword
      }
    }

    return null;
  }

  private async extractProjectCards(page: Page): Promise<Array<{
    title: string;
    description: string;
    url?: string;
    demoUrl?: string;
    techStack: string;
    role?: string;
    year?: number;
    impact?: string;
    isLiveDemo: boolean;
  }>> {
    const projects: Array<any> = [];

    try {
      // Common selectors for portfolio project cards
      const cardSelectors = [
        "article",
        ".project",
        ".portfolio-item",
        ".work-item",
        ".case-study",
        '[class*="project"]',
        '[class*="portfolio"]',
      ];

      for (const selector of cardSelectors) {
        const cards = await page.locator(selector).all();

        for (const card of cards) {
          try {
            const title = await card.locator("h1, h2, h3, h4, .title, [class*='title']").first().textContent() || "";
            const description = await card.locator("p, .description, [class*='description']").first().textContent() || "";

            let projectUrl: string | undefined;
            let demoUrl: string | undefined;

            // Look for "View Project" or "Live Demo" links
            const links = await card.locator("a").all();
            for (const link of links) {
              const linkText = (await link.textContent() || "").toLowerCase();
              const href = await link.getAttribute("href");

              if (href) {
                if (linkText.includes("demo") || linkText.includes("live") || linkText.includes("view app")) {
                  demoUrl = new URL(href, page.url()).href;
                } else if (linkText.includes("view") || linkText.includes("details")) {
                  projectUrl = new URL(href, page.url()).href;
                }
              }
            }

            // Extract tech stack (look for tags/badges)
            const techElements = await card.locator(".tag, .badge, .tech, [class*='tech'], [class*='stack']").all();
            const techStack = (await Promise.all(techElements.map(el => el.textContent()))).join(" ");

            if (title.trim()) {
              projects.push({
                title: title.trim(),
                description: description.trim(),
                url: projectUrl,
                demoUrl,
                techStack,
                isLiveDemo: !!demoUrl,
              });
            }
          } catch (err) {
            // Skip this card
          }
        }

        if (projects.length > 0) break; // Found projects with this selector
      }
    } catch (error) {
      console.error("[Portfolio] Error extracting project cards:", error);
    }

    return projects;
  }

  private async checkForTechWriteups(page: Page): Promise<boolean> {
    const writeupKeywords = ["blog", "articles", "writing", "posts", "thoughts"];

    for (const keyword of writeupKeywords) {
      try {
        const link = await page.locator(`a:has-text("${keyword}")`).first();
        if (await link.isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        // Continue
      }
    }

    return false;
  }

  private isAllowedDomain(url: string, portfolioDomain: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Allow portfolio's own domain
      if (hostname === portfolioDomain || hostname.endsWith(`.${portfolioDomain}`)) {
        return true;
      }

      // Allow common hosting platforms
      for (const allowedDomain of ALLOWED_HOSTING_DOMAINS) {
        if (hostname.endsWith(allowedDomain)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  private calculateRelevanceToRole(technologies: string[], jobRubric: JobRubric): number {
    const mustHaveSkills = jobRubric.mustHaveSkills.map(s => s.toLowerCase());
    const niceToHaveSkills = jobRubric.niceToHaveSkills.map(s => s.toLowerCase());
    const techLower = technologies.map(t => t.toLowerCase());

    let mustHaveMatches = 0;
    let niceToHaveMatches = 0;

    for (const skill of mustHaveSkills) {
      if (techLower.some(tech => tech.includes(skill) || skill.includes(tech))) {
        mustHaveMatches++;
      }
    }

    for (const skill of niceToHaveSkills) {
      if (techLower.some(tech => tech.includes(skill) || skill.includes(tech))) {
        niceToHaveMatches++;
      }
    }

    const mustHaveScore = mustHaveSkills.length > 0 ? mustHaveMatches / mustHaveSkills.length : 0;
    const niceToHaveScore = niceToHaveSkills.length > 0 ? niceToHaveMatches / niceToHaveSkills.length : 0;

    const relevance = mustHaveScore * 0.7 + niceToHaveScore * 0.3;
    return Math.min(relevance, 1.0);
  }

  private extractTechnologies(text: string): string[] {
    const found = new Set<string>();
    const lowerText = text.toLowerCase();

    for (const tech of COMMON_TECHNOLOGIES) {
      const lowerTech = tech.toLowerCase();
      if (lowerText.includes(lowerTech)) {
        found.add(tech);
      }
    }

    return Array.from(found);
  }

  private async isValidPage(page: Page): Promise<boolean> {
    try {
      const title = await page.title();
      const url = page.url();

      // Check for error pages
      if (title.toLowerCase().includes("404") || title.toLowerCase().includes("not found")) {
        return false;
      }

      if (url.includes("404") || url.includes("error")) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

export const portfolioBrowserAgent = new PortfolioBrowserAgent();
