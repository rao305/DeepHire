# DeepHire

DeepHire is an AI-powered candidate verification platform that autonomously validates technical claims from resumes using multi-agent verification with GitHub, portfolio, and LinkedIn analysis.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT LAYER                           │
│     Next.js 16 │ React 19 │ Tailwind CSS               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 API ROUTES LAYER                        │
│   /api/jobs │ /api/candidates │ /api/health            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              AUTHENTICATION LAYER                       │
│                 Clerk Auth                              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              BUSINESS LOGIC LAYER                       │
│   Claim Extraction │ Agent Orchestration │ Brief Gen   │
└─────┬──────────┬──────────┬──────────┬─────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
┌──────────┬──────────┬──────────┬──────────┐
│ Inngest  │   R2     │ Postgres │OpenRouter│
│ Workflow │ Storage  │ Database │   AI     │
└──────────┴──────────┴──────────┴──────────┘
```

## Features

- **Multi-Agent Verification**: GitHub API, GitHub Browser, Portfolio Browser, and LinkedIn agents
- **Smart Claim Extraction**: AI-powered extraction of verifiable claims from resumes
- **Evidence-Based Scoring**: Transparent scoring with provenance logs and confidence metrics
- **Browser Automation**: Playwright-powered verification with screenshot capture
- **Shipped Work Detection**: Automatically identifies production projects and deployments
- **Async Workflow**: Inngest-powered orchestration for reliable, scalable processing
- **Real-time Updates**: React Query integration for live status updates
- **Production-Ready**: Comprehensive error handling, health checks, and structured logging

## Tech Stack

### Framework & Language
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 6** - Type safety

### Authentication & Authorization
- **Clerk** - User authentication and organization management

### Database & Storage
- **Neon PostgreSQL** - Serverless Postgres database
- **Drizzle ORM** - Type-safe database queries
- **Cloudflare R2** - S3-compatible object storage for resumes and screenshots

### AI & Automation
- **OpenRouter** - Multi-provider AI API (GPT-4o, Claude)
- **Playwright** - Browser automation for verification
- **Inngest** - Durable workflow orchestration

### Deployment & Infrastructure
- **Vercel** - Hosting and deployment
- **GitHub Actions** - CI/CD pipeline

### Development Tools
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Query** - Server state management
- **Zod** - Runtime type validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket
- Clerk account
- GitHub Personal Access Token
- OpenRouter API key
- Inngest account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deephire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in all values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
   - `CLERK_WEBHOOK_SECRET` - Clerk webhook secret
   - `R2_ACCOUNT_ID` - Cloudflare account ID
   - `R2_ACCESS_KEY_ID` - R2 access key
   - `R2_SECRET_ACCESS_KEY` - R2 secret key
   - `R2_BUCKET_NAME` - R2 bucket name
   - `R2_PUBLIC_URL` - R2 public URL
   - `GITHUB_TOKEN` - GitHub personal access token
   - `OPENROUTER_API_KEY` - OpenRouter API key
   - `INNGEST_EVENT_KEY` - Inngest event key
   - `INNGEST_SIGNING_KEY` - Inngest signing key

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
deephire/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Organization dashboard
│   │   │   ├── jobs/          # Job management
│   │   │   └── candidates/    # Candidate verification
│   │   ├── api/               # API routes
│   │   │   ├── health/        # Health check endpoint
│   │   │   ├── jobs/          # Job CRUD operations
│   │   │   ├── candidates/    # Candidate operations
│   │   │   └── inngest/       # Inngest webhook handler
│   │   ├── error.tsx          # Global error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── [feature]/        # Feature-specific components
│   ├── db/                    # Database
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── index.ts          # Database client
│   ├── inngest/              # Inngest functions
│   │   ├── client.ts         # Inngest client setup
│   │   └── functions/        # Event handlers
│   ├── lib/                   # Shared utilities
│   │   ├── logger.ts         # Structured logging
│   │   ├── api-response.ts   # API response helpers
│   │   ├── auth.ts           # Auth utilities
│   │   ├── r2.ts             # R2 storage client
│   │   └── validation.ts     # Zod schemas
│   └── types/                 # TypeScript types
├── scripts/                   # Utility scripts
│   ├── pre-deploy-check.ts   # Pre-deployment validation
│   └── integration-test.ts   # E2E test
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD pipeline
├── vercel.json               # Vercel configuration
└── package.json              # Dependencies and scripts
```

## Key Workflows

### Job Creation Flow

```
User Creates Job
       ↓
  API Validates
       ↓
  Save to Database
       ↓
Inngest: job/created event
       ↓
  Return to User
```

### Candidate Verification Flow

```
User Submits Candidate
       ↓
  Parse Resume (pdf-parse)
       ↓
Inngest: candidate/submitted
       ↓
Extract Claims (AI)
       ↓
Inngest: candidate/claims-extracted
       ↓
Parallel Agent Verification
  ├─ GitHub API Agent
  ├─ GitHub Browser Agent  
  ├─ Portfolio Browser Agent
  └─ LinkedIn Agent
       ↓
Collect Evidence Packets
       ↓
Inngest: candidate/verification-complete
       ↓
Generate Brief (AI)
  ├─ Calculate scores
  ├─ Identify verified claims
  ├─ Flag weak claims
  ├─ Detect risks
  └─ Generate interview questions
       ↓
Inngest: candidate/brief-generated
       ↓
Update Status: complete
       ↓
User Views Brief
```

## Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes directly
- `npm run db:studio` - Open Drizzle Studio

### Deployment & Testing

- `npm run deploy:check` - Validate all systems before deployment
- `npm run test:integration` - Run end-to-end integration test
- `npm run test:e2e` - Alias for test:integration

## Deployment

### Vercel Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Link project**
   ```bash
   vercel link
   ```

3. **Configure environment variables**
   
   In Vercel dashboard, add all environment variables from `.env.example`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### GitHub Integration (Recommended)

1. **Connect repository to Vercel**
   - Go to Vercel dashboard
   - Import Git repository
   - Configure environment variables

2. **Automatic deployments**
   - Every push to `main` triggers production deployment
   - Pull requests create preview deployments

### GitHub Secrets (for CI/CD)

Configure these secrets in GitHub repository settings:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`
- `GH_TOKEN` (use this name to avoid conflict with default GITHUB_TOKEN)
- `OPENROUTER_API_KEY`
- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`

## Monitoring

### Health Check

The application exposes a health check endpoint at `/api/health` that monitors:

- Database connectivity
- Environment variable configuration
- Application version (git commit SHA)

**Example:**
```bash
curl https://your-app.vercel.app/api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-25T10:30:00.000Z",
    "checks": {
      "database": "ok",
      "environment": "ok"
    },
    "version": "abc123def"
  }
}
```

### Structured Logging

All logs are JSON-formatted with:
- `timestamp` - ISO 8601 timestamp
- `level` - debug, info, warn, error
- `message` - Log message
- `context` - Additional structured data
- `error` - Error details (message, name, stack in dev only)

**Configure log level:**
```bash
LOG_LEVEL=info # debug, info, warn, error
```

## Testing

### Pre-Deployment Check

Validates all systems before deployment:

```bash
npm run deploy:check
```

**Checks:**
- Environment variables (all 13 required)
- Database connection and schema
- R2 storage (upload/delete test)
- Inngest event sending

### Integration Test

End-to-end test of the complete verification workflow:

```bash
npm run test:integration
```

**Test flow:**
1. Creates test organization, user, job, and candidate
2. Triggers verification workflow via Inngest
3. Polls for completion (max 5 minutes)
4. Validates results (brief, claims, evidence packets)
5. Cleans up test data

## Security

### Headers

Security headers configured in `vercel.json`:

- **X-Frame-Options: DENY** - Prevent clickjacking
- **X-Content-Type-Options: nosniff** - Prevent MIME sniffing
- **X-XSS-Protection: 1; mode=block** - XSS protection
- **Strict-Transport-Security** - Force HTTPS (HTML pages only)
- **Referrer-Policy: strict-origin-when-cross-origin** - Control referrer info

### Authentication

- All dashboard routes protected by Clerk middleware
- API routes use `requireAuth()` helper for authentication
- Organization-scoped data access

### Data Privacy

- Resume data stored in private R2 bucket
- Candidate PII protected by organization access controls
- Audit trails via provenance logs

## Troubleshooting

### Database Connection Issues

**Problem:** `DATABASE_URL is not set`

**Solution:** Ensure `.env` file exists and `DATABASE_URL` is configured

**Problem:** `relation "organizations" does not exist`

**Solution:** Run database migrations:
```bash
npm run db:push
```

### Build Failures

**Problem:** TypeScript errors during build

**Solution:** Run type check locally:
```bash
npx tsc --noEmit
```

### Inngest Events Not Processing

**Problem:** Events sent but functions not running

**Solution:** 
1. Check Inngest dashboard for function status
2. Verify `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are correct
3. Ensure `/api/inngest` route is accessible

### R2 Upload Failures

**Problem:** `Failed to upload file to R2`

**Solution:**
1. Verify R2 credentials are correct
2. Check bucket name matches `R2_BUCKET_NAME`
3. Ensure bucket has public access enabled for `R2_PUBLIC_URL`

## Performance

### Optimization Strategies

1. **Database Queries**
   - Indexed foreign keys (organization_id, job_id, candidate_id)
   - Batch operations where possible
   - Connection pooling via Neon serverless

2. **API Routes**
   - Response caching for static data
   - Pagination for list endpoints
   - Lazy loading for large datasets

3. **Client-Side**
   - React Query caching
   - Code splitting via dynamic imports
   - Image optimization with Next.js Image component

4. **Workflows**
   - Parallel agent execution
   - Incremental status updates
   - Graceful degradation on agent failures

## Contributing

### Git Workflow

1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Run pre-commit checks:
   ```bash
   npm run lint
   npm run build
   npm run deploy:check
   ```
4. Submit pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js config
- **Formatting**: Use Prettier (if configured)
- **Components**: Functional components with hooks
- **API Routes**: Use response helpers from `api-response.ts`
- **Errors**: Use structured logger, not console.*

### Commit Message Format

```
<type>: <description>

[optional body]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Maintenance tasks

---

Built with ❤️ using Next.js, TypeScript, and AI
