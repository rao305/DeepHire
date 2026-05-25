# DeepHire Product Document

## Overview

DeepHire is a recruiter-facing candidate intelligence layer for technical hiring that helps companies identify candidates who have actually shipped meaningful work and verify whether important resume claims are supported by public evidence.[cite:242][cite:244][cite:248] The product exists because AI-generated and AI-tailored resumes are making resumes a weaker signal, increasing recruiter workload, and pushing hiring teams to rely more on public proof-of-work, portfolio review, and structured evaluation rather than keyword match alone.[cite:242][cite:248][cite:251]

DeepHire does not replace an ATS such as Greenhouse; it sits on top of existing recruiting workflow and turns candidate materials into evidence-backed candidate briefs.[cite:123][cite:165][cite:249] Its core promise is simple: surface the most relevant shipped work, verify the highest-value claims, and help recruiters move from polished narrative to real evidence.[cite:247][cite:252][cite:191]

DeepHire now extends beyond static parsing and simple API lookups. Its retrieval layer uses a hybrid model: official APIs where structured data is strong, and autonomous browser research agents where human-style inspection of public pages is needed to assess real proof-of-work.[cite:200][cite:212][cite:272][cite:277]

## Problem

In the current hiring market, candidates can cheaply tailor resume wording to a job description using AI tools, which means many applicants look highly aligned on paper even when the underlying evidence is weak.[cite:242][cite:244][cite:248] This reduces trust in resumes, increases false positives in screening, and makes it harder for recruiters to separate candidates who can actually build and ship from those who simply present well.[cite:242][cite:251][cite:253]

This problem is especially acute in technical hiring because traditional ATS workflows still lean heavily on text match, metadata, and recruiter notes, while strong engineers often have richer public artifacts such as GitHub repos, demos, and technical writeups that are not systematically evaluated in early screening.[cite:244][cite:251][cite:191] Hiring guidance around GitHub and portfolios emphasizes project quality, documentation, recency, collaboration, and meaningful shipped work as important signals, but most recruiters do not have time to inspect that evidence candidate by candidate.[cite:191][cite:254][cite:260]

The core failure of existing screening tools is that they mostly rank text, not proof. In practice, good recruiters and hiring managers often open GitHub, click into pinned repos, read READMEs, inspect demos, and follow portfolio links to understand whether a candidate has actually shipped meaningful work; DeepHire productizes that research behavior with bounded browser agents and evidence capture.[cite:191][cite:254][cite:266][cite:277]

## Product thesis

DeepHire is built on two linked ideas:

- Verify important claims: determine whether a candidate’s critical resume claims are supported by relevant public evidence.[cite:247][cite:250]
- Surface shipped work: identify the most impressive, relevant thing the candidate has actually built or contributed to, and explain why it matters for the role.[cite:191][cite:254][cite:266]

This leads to a product that is not just fraud-aware and not just a resume screener. It is proof-of-work recruiting infrastructure for technical hiring.[cite:247][cite:252][cite:191]

## Who the product is for

The initial target user is the technical recruiter hiring software engineers at startups and mid-size companies, plus founders and boutique recruiting firms screening engineering candidates.[cite:176][cite:195][cite:244] This group is the best starting point because software candidates are more likely to have public proof-of-work such as GitHub repositories, portfolio sites, demos, and technical project links, making claim verification and shipped-work discovery feasible at scale.[cite:176][cite:191][cite:254]

### Primary users

- In-house technical recruiters at startups using structured hiring workflows.[cite:244][cite:249]
- Heads of talent at engineering-heavy companies.[cite:251]
- Founders personally screening engineering applicants.[cite:244]
- Tech-focused recruiting agencies.[cite:195]

### Why they should use it

- It reduces wasted screening time on AI-polished but shallow applications.[cite:242][cite:253]
- It improves shortlist quality by surfacing public proof-of-work.[cite:191][cite:254]
- It gives hiring teams a structured way to evaluate real building and shipping signals.[cite:178][cite:184][cite:260]
- It helps recruiters ask better interview questions based on weak or unverified claims.[cite:178][cite:184]
- It automates the manual browser research that strong technical recruiters already do across GitHub and portfolio sites.[cite:191][cite:254][cite:277]

## Positioning

The strongest positioning for DeepHire is not “AI detects fake resumes.” The stronger positioning is: **DeepHire helps companies hire engineers who have actually shipped by surfacing the most relevant proof-of-work behind every resume.**[cite:191][cite:254][cite:266]

Supporting lines:

- DeepHire turns AI-polished resumes into evidence-backed candidate briefs.[cite:244][cite:248]
- DeepHire scores proof, not just keywords.[cite:248][cite:251]
- DeepHire uses agentic retrieval to verify candidate claims against public work evidence.[cite:230][cite:247][cite:252]
- DeepHire launches browser-based research agents to inspect public proof-of-work the way a technical recruiter would.[cite:272][cite:277]

This framing is stronger because it is positive, recruiter-friendly, and focused on finding real builders rather than merely policing candidates.[cite:191][cite:265]

## Core product outcomes

For every candidate, the product should answer two recruiter questions:

1. Is this candidate’s key resume story supported by public evidence?[cite:247][cite:250]
2. What is the strongest, most relevant shipped work this candidate has actually built or contributed to?[cite:191][cite:254][cite:266]

Those questions map directly to the two main outputs:

- **Evidence-backed claim verification**
- **Shipped work discovery and ranking**

## End-to-end workflow

### 1. Job setup

The recruiter or hiring team creates a role inside DeepHire by pasting a job description or syncing one later from an ATS such as Greenhouse.[cite:246][cite:249] The system parses the JD into a structured rubric containing must-have skills, preferred skills, seniority expectations, domain relevance, and weights used later for claim prioritization and scoring.[cite:178][cite:184]

### 2. Candidate ingestion

The recruiter uploads a resume PDF manually in the first version or later syncs it from Greenhouse through customer-managed API and webhook integration.[cite:123][cite:165][cite:249] The candidate or recruiter also provides job-relevant public links such as GitHub, portfolio, demo URLs, and optionally LinkedIn or similar profile links.[cite:176][cite:195][cite:254]

### 3. Claim extraction

The system parses the resume and extracts structured claims, such as technical skills, projects, scale claims, ownership claims, deployment claims, and leadership claims.[cite:247][cite:252] Each claim is linked to the job rubric so the system knows which claims are important enough to verify and which are low value for early screening.[cite:178][cite:184]

### 4. Retrieval planning

DeepHire creates a verification plan for the highest-priority claims. For each claim, it decides whether official APIs are sufficient, whether a browser research agent is needed, which domains are allowed, and what evidence threshold is required before the retrieval task stops.[cite:200][cite:212][cite:226][cite:233]

### 5. Hybrid retrieval execution

DeepHire runs a hybrid retrieval layer:

- API-first retrieval where structured data is strong, especially for GitHub repository discovery and metadata.[cite:200][cite:212][cite:214]
- Browser-agent retrieval where human-like page inspection is needed, especially for reading READMEs, checking repo structure, following demos, and exploring portfolio projects.[cite:272][cite:277]

### 6. Evidence judgment

Retrieved evidence is converted into normalized evidence objects and mapped back to the original claims.[cite:247][cite:250] The system then judges whether each claim is supported, weakly supported, unverified, or contradictory using a retrieval-then-judge pattern similar to claim verification systems.[cite:247][cite:250][cite:252]

### 7. Candidate brief generation

The system generates a recruiter-facing brief containing:

- Fit score
- Evidence score
- Shipped Work score
- Top verified claims
- Top weak or unverified claims
- Best shipped projects
- Risk flags
- Targeted interview questions
- Evidence packets with links and provenance

This brief is designed to fit structured hiring practices and to support faster, more defensible first-pass screening.[cite:178][cite:184][cite:244]

## Product features

### Job intelligence

- JD parser
- Role rubric generation
- Must-have vs nice-to-have weighting
- Seniority extraction
- Recruiter-adjustable scoring weights

### Candidate ingestion

- Resume PDF upload
- Candidate link capture for GitHub, portfolio, demo pages, and public profile links
- ATS-based candidate import later via Greenhouse integration.[cite:123][cite:249]

### Claim intelligence

- Resume claim extraction
- Claim normalization by category: skill, project, ownership, scale, deployment, leadership, outcome
- Claim prioritization based on role relevance and verification value

### Hybrid evidence retrieval layer

- GitHub evidence retrieval via official GitHub REST APIs for repos, contents, commits, and repo statistics.[cite:200][cite:212][cite:213][cite:214][cite:222]
- Browser-based GitHub repo inspection for README quality, project structure, deployment clues, and linked demos.[cite:277][cite:283]
- Portfolio and demo page browser retrieval for public project pages, deployment links, and technical writeups.[cite:254][cite:258][cite:272]
- Public profile consistency checker for role-title and timeline consistency.[cite:176][cite:190]
- Shipped project detector to identify the strongest publicly evidenced project work.[cite:191][cite:254][cite:266]

### Candidate briefing

- Verified claim section
- Weak or unverified claim section
- Contradiction and timeline concern section
- Best shipped work section
- Interview question pack
- ATS-ready summary for recruiter copy/paste or write-back
- Evidence packet viewer with visited pages, snippets, and sources

### Integrations

- Manual upload first
- Greenhouse customer-managed integration later using API credentials and webhooks rather than ATS replacement.[cite:123][cite:165][cite:249]

## Evidence sources and connectors

For MVP, the product should support only job-relevant, high-signal connectors.

| Connector | Retrieval mode | Purpose | Why it matters |
|---|---|---|---|
| GitHub | API + browser hybrid | Repos, commits, README depth, contribution patterns, project metadata, linked demos | Best structured and inspectable public proof-of-work source for technical candidates.[cite:200][cite:212][cite:214][cite:283] |
| Personal portfolio / demo site | Browser-first | Project pages, live apps, writeups, screenshots, demos | Useful for identifying shipped work and product thinking in unstructured formats.[cite:254][cite:258][cite:272] |
| Public profile link | Minimal browser review / consistency check | Timeline/title consistency, background cross-checking | Useful as a secondary consistency layer, not a sole truth source, and requires careful governance.[cite:176][cite:190][cite:276] |
| Candidate-provided project links | Browser-first | Devpost, blog posts, docs, product URLs | Captures work not visible in a standard resume.[cite:254][cite:266] |

GitHub should be the strongest evidence source in v1 because it is both structured and suitable for browser inspection, while broader profile checking should be conservative and job-relevant.[cite:200][cite:212][cite:220]

## Browser research layer

The Browser Research Layer is the differentiating engine of DeepHire. It turns manual recruiter-style investigation into bounded, repeatable agentic workflows.[cite:272][cite:277]

### Design principles

- Retrieval must be triggered by a job-relevant candidate claim.
- Agents must operate only on allowlisted public domains.
- Every session must have a retrieval budget, stopping condition, and output schema.
- Every finding must be traceable to a source URL and captured snippet.
- High-stakes decisions must remain human-reviewed.

### Browser agent capabilities

- Open a provided public URL
- Scroll and detect relevant sections
- Click project or repository links
- Read visible page text
- Follow top-N allowed links
- Stop when evidence threshold is met
- Return structured evidence packets rather than raw browsing traces only

### Evidence packets

Every browser session should produce a normalized evidence packet with:

- Claim ID
- Source type
- Source URL
- Page title
- Visited pages list
- Extracted snippets
- Detected artifacts such as README, demo, tests, docs, deployment clues
- Support judgment
- Confidence
- Timestamp
- Provenance log

This makes browser-based research auditable and recruiter-friendly.

## Agentic retrieval architecture

DeepHire should use agentic retrieval internally, but inside a controlled workflow rather than as a free-roaming browser agent system.[cite:226][cite:233][cite:235] The best implementation is a set of specialized workers or sub-agents coordinated by an orchestration service.

### Internal sub-agents

#### JD Agent
- Extracts required skills, technical focus, seniority, and role rubric from the JD.

#### Claim Extraction Agent
- Parses the resume and returns a structured list of claims.

#### Claim Prioritization Agent
- Decides which claims are worth verifying first based on job importance and expected public evidence availability.

#### Source Planner Agent
- Chooses which connectors and retrieval modes to use for each claim, such as GitHub API, GitHub browser inspection, portfolio browser inspection, or profile consistency review.[cite:230][cite:233]

#### GitHub API Agent
- Uses GitHub REST APIs to retrieve repository metadata, contents, commit history, and repository statistics for claim support analysis.[cite:200][cite:212][cite:213][cite:214][cite:222]

#### GitHub Browser Research Agent
- Opens candidate profiles and repositories, reviews pinned repos, reads READMEs, inspects repository structure, and follows linked demos or documentation to assess shipped-work quality.[cite:277][cite:283]

#### Portfolio Browser Research Agent
- Navigates project pages, demos, screenshots, and technical writeups to find proof of shipped work and relevant product signals.[cite:254][cite:258][cite:272]

#### Timeline/Consistency Agent
- Checks chronology and role-title consistency across public sources where available.[cite:176][cite:190]

#### Evidence Judge Agent
- Determines whether a claim is supported, weakly supported, unverified, or contradictory based on retrieved evidence.[cite:247][cite:250][cite:252]

#### Shipped Work Ranking Agent
- Identifies the most impressive and relevant shipped work based on role relevance, technical depth, recency, evidence quality, and shipping signals.[cite:191][cite:254][cite:266]

#### Interview Question Agent
- Generates targeted questions for important claims that still need confirmation.[cite:178][cite:184]

### Why agentic retrieval matters

This design is stronger than plain resume parsing because it introduces dynamic retrieval and evidence checking rather than relying only on what the candidate wrote. Agentic retrieval systems are defined by multi-step planning, tool use, retrieval, evaluation, and iteration, which matches what DeepHire is doing for candidate verification and proof-of-work discovery.[cite:226][cite:230][cite:233][cite:238]

## Source-specific retrieval strategy

### GitHub

GitHub should be handled with a hybrid strategy. API retrieval is ideal for repo discovery, metadata, commit history, and repository statistics, while browser agents are better for reading READMEs, judging project completeness, examining linked demos, and understanding the practical quality of shipped work.[cite:200][cite:212][cite:214][cite:277][cite:283]

### Personal portfolio and demos

Portfolio sites should be handled primarily with browser agents because the most valuable information is usually embedded in page layout, navigation, images, project cards, and linked demos rather than exposed through a clean API.[cite:254][cite:258][cite:272]

### LinkedIn or equivalent professional profile

Public profile research should be treated much more conservatively. It can support timeline and title consistency checks, but it should not be the primary proof-of-work source, and it requires stronger governance because social profile screening raises privacy, fairness, and platform-risk concerns.[cite:275][cite:276][cite:281]

## Scoring model

DeepHire should not reduce a candidate to one opaque score. It should expose multiple dimensions tied to recruiter decision-making.

### Main scores

- **Fit score**: how well the candidate’s claims align with the role rubric.
- **Evidence score**: how much public evidence supports the most important claims.
- **Shipped Work score**: how strong and relevant the candidate’s best demonstrated work appears to be.
- **Confidence score**: how much usable evidence was available across reviewed sources.

### Risk flags

- High JD mirroring with low evidence
- Important claim with no visible support
- Timeline mismatch
- Weak support for production/deployment claims
- Inflated scale claims without clear proof
- Thin public evidence despite strong narrative claims

The system should also show claim-level labels:
- Supported
- Weakly supported
- Unverified
- Contradictory

## Candidate brief structure

A recruiter-facing candidate brief should include:

### Candidate snapshot
- Candidate name
- Role analyzed for
- Fit score
- Evidence score
- Shipped Work score
- Confidence score

### Best shipped work
- Top 1 to 3 projects or contributions
- Why each is impressive
- Why each is relevant to the current role
- Source links
- Evidence snippets

### Verified signals
- Claims with strong public support

### Weak or unverified claims
- Important claims that need follow-up in interview

### Contradictions or concerns
- Timeline inconsistencies
- Unsupported production claims
- Overly generic bullets with low supporting evidence

### Interview prompts
- Specific questions based on the highest-value unresolved claims

### Evidence viewer
- Evidence packets
- Visited pages
- Supporting snippets
- Source provenance

This brief should make it easy for a recruiter or hiring manager to see what the candidate has actually built, what evidence supports it, and what still needs verification.

## Product screens

### 1. Job setup screen
- JD input
- Role rubric extraction
- Weight editing
- Saved role profiles

### 2. Candidate upload screen
- Resume upload
- GitHub URL input
- Portfolio URL input
- Public profile URL input
- Candidate notes

### 3. Analysis status screen
- Claim extraction progress
- Retrieval plan by claim
- Browser agent task progress by source
- Evidence fetch status

### 4. Candidate brief screen
- Core scores
- Best shipped work section
- Verified claims
- Weak claims
- Risk flags
- Interview questions
- Evidence packet viewer

### 5. Recruiter actions screen
- Advance
- Hold
- Reject
- Export summary
- Copy ATS note
- Push summary to Greenhouse later

### 6. Integrations/admin screen
- Greenhouse credentials
- Webhook setup
- Connector controls
- Team settings
- Scoring preferences
- Source governance rules

## Governance and compliance boundaries

DeepHire’s browser-agent system must be tightly governed. Recruitment scraping guidance and social-profile-screening research emphasize the importance of fairness, relevance, data minimization, and process controls when using public web data in hiring.[cite:217][cite:276]

### Governance rules

- Only retrieve public, job-relevant information.[cite:217][cite:276]
- Restrict agents to allowlisted domains and task scopes.
- Keep provenance logs for every evidence packet.[cite:217]
- Do not use browser research to make fully autonomous hiring decisions.
- Require human review for any reject recommendation or high-risk flag.[cite:276]
- Treat LinkedIn and similar profile browsing as higher-risk than GitHub and portfolio inspection.[cite:275][cite:281]

## Greenhouse layer

DeepHire should start as a standalone product and later become an integration layer on top of Greenhouse rather than an ATS competitor.[cite:123][cite:165][cite:249] Greenhouse remains the system of record, while DeepHire becomes the evidence and proof-of-work intelligence layer.[cite:123][cite:246]

### What DeepHire pulls from Greenhouse

- Job and JD
- Candidate record
- Application record
- Resume/document attachment
- Optional stage metadata and recruiter context[cite:123]

### What DeepHire writes back

- Evidence score
- Shipped Work summary
- Risk flags
- Top verified claims
- Top unverified claims
- Link to full candidate brief

A customer-managed integration flow is the right starting point: the customer admin creates the API credentials and webhooks in Greenhouse and connects them to DeepHire.[cite:165][cite:141][cite:249]

## Technical architecture

For implementation detail (agents, evidence packets, Inngest workflows, database schema, cost model, and full tech stack), see **[deephire_browser_agents_technical_spec.md](./deephire_browser_agents_technical_spec.md)**.

### Frontend
- Next.js or React recruiter dashboard

### Backend
- FastAPI service layer
- Postgres for jobs, candidates, claims, evidence, scores, analysis runs, and browser-session logs
- Redis + Celery or Temporal for orchestration and sub-agent task execution
- S3-compatible storage for resumes, raw evidence snapshots, and browser evidence artifacts

### Connectors and retrieval stack
- GitHub REST API client first.[cite:200][cite:212]
- Headless browser automation layer for GitHub and portfolio inspection.[cite:277]
- Public portfolio fetcher with careful policy checks.[cite:220]
- Greenhouse connector later for ATS sync.[cite:123][cite:249]

### LLM usage
- Structured claim extraction
- Retrieval planning
- Browser action planning
- Evidence summarization
- Evidence judgment
- Interview question generation
- Candidate brief writing

LLMs should not be the sole scoring authority; the final scoring should be deterministic and evidence-linked.[cite:247][cite:252]

## MVP scope

The first version should be narrow and useful.

### MVP in scope
- Technical roles only
- Manual JD paste
- Manual resume upload
- GitHub required or strongly encouraged
- Portfolio optional
- Public profile optional
- Verify top 5 important claims only
- Surface top 1 to 3 shipped work items
- GitHub API + browser hybrid retrieval
- Portfolio browser retrieval
- Generate recruiter brief page with evidence packets

### MVP out of scope
- Workday integration
- Full marketplace partnership flows
- Generic hiring across all job types
- Broad social web scraping
- Fully autonomous rejection decisions
- Heavy LinkedIn dependence as a core product dependency

## Product-market fit story

DeepHire fits a real market shift: recruiters are buried in AI-generated or AI-tailored applications, while strong hiring decisions increasingly depend on finding real evidence of execution rather than trusting resume polish alone.[cite:242][cite:244][cite:248][cite:251] The product is especially compelling in technical hiring because public proof-of-work is more accessible, and hiring teams already value shipped products, GitHub quality, demos, and project depth when evaluating engineers.[cite:191][cite:254][cite:260]

The wedge is strong because the product is not trying to replace the ATS or automate all hiring. It solves a clear, painful first-pass screening problem by helping recruiters and hiring managers answer a practical question: **What has this person actually shipped, and how much of their story is backed by evidence?**[cite:191][cite:254][cite:266]

Its unique advantage is that it does not stop at ranking resumes or calling APIs. It automates the high-value browser research behavior that strong technical recruiters already perform manually across GitHub and portfolio links.[cite:191][cite:254][cite:277]

## Final product definition

DeepHire is a technical recruiting intelligence layer that helps companies hire engineers who have actually shipped. It ingests a job description and candidate materials, extracts important claims, plans how each claim should be checked, launches hybrid API and browser-agent retrieval workflows to gather public evidence, verifies those claims, surfaces the candidate’s strongest shipped work, and returns a recruiter-grade candidate brief that fits into existing hiring workflows.[cite:230][cite:247][cite:252][cite:249][cite:277]

The product wins when it helps hiring teams stop asking only “does this resume match the job description?” and start asking “what proof exists that this candidate can actually build what this job needs?”[cite:242][cite:244][cite:191]
