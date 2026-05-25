import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { Inngest } from 'inngest';
import * as schema from '../src/db/schema';
import { logger } from '../src/lib/logger';

const TEST_PREFIX = '[E2E-TEST]';

interface TestData {
  organizationId: string;
  userId: string;
  jobId: string;
  candidateId: string;
}

// Initialize database
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const neonSql = neon(connectionString);
const db = drizzle(neonSql, { schema });

// Initialize Inngest client
const inngest = new Inngest({
  id: 'deephire',
  name: 'DeepHire',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

async function createTestData(): Promise<TestData> {
  console.log(`${TEST_PREFIX} Setting up test data...`);

  // Create test organization
  const [organization] = await db
    .insert(schema.organizations)
    .values({
      clerkId: `test_org_${Date.now()}`,
      name: 'E2E Test Organization',
      plan: 'pro',
    })
    .returning();

  logger.info(`${TEST_PREFIX} Created test organization`, {
    organizationId: organization.id,
  });

  // Create test user
  const [user] = await db
    .insert(schema.users)
    .values({
      organizationId: organization.id,
      email: `test_${Date.now()}@example.com`,
      clerkId: `test_user_${Date.now()}`,
      role: 'admin',
    })
    .returning();

  logger.info(`${TEST_PREFIX} Created test user`, { userId: user.id });

  // Create test job with Senior Full-Stack Engineer JD
  const [job] = await db
    .insert(schema.jobs)
    .values({
      organizationId: organization.id,
      title: 'Senior Full-Stack Engineer',
      description: `We are seeking a Senior Full-Stack Engineer with strong experience in React, Node.js, and cloud infrastructure. 
      
Key Responsibilities:
- Design and build scalable web applications
- Lead technical architecture decisions
- Mentor junior developers
- Deploy and maintain production systems

Requirements:
- 5+ years of professional software development experience
- Expert knowledge of React and modern JavaScript/TypeScript
- Strong backend experience with Node.js or similar
- Experience with cloud platforms (AWS, GCP, or Azure)
- Track record of shipping production applications
- Experience with CI/CD and DevOps practices`,
      rubric: {
        must_have: [
          'React expertise',
          'Node.js/Backend experience',
          'Production deployment experience',
        ],
        nice_to_have: [
          'Open source contributions',
          'Team leadership experience',
          'Cloud infrastructure knowledge',
        ],
      },
      status: 'active',
    })
    .returning();

  logger.info(`${TEST_PREFIX} Created test job`, { jobId: job.id });

  // Create test candidate
  const [candidate] = await db
    .insert(schema.candidates)
    .values({
      organizationId: organization.id,
      jobId: job.id,
      name: 'Test Candidate',
      email: `candidate_${Date.now()}@example.com`,
      githubUrl: 'https://github.com/octocat',
      resumeText: `Senior Full-Stack Engineer with 7 years of experience building scalable web applications.

SKILLS
- Frontend: React, TypeScript, Next.js, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL, Redis
- DevOps: Docker, AWS, CI/CD, Terraform

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-Present
- Led development of microservices architecture serving 1M+ users
- Built real-time collaboration features using WebSockets
- Reduced API response time by 60% through caching and optimization
- Mentored team of 4 junior developers

Full-Stack Developer | StartupXYZ | 2018-2020
- Shipped 15+ production features from concept to deployment
- Implemented CI/CD pipeline reducing deployment time by 80%
- Built responsive web applications with React and Node.js

PROJECTS
- Contributed to open source React libraries
- Built and deployed multiple side projects to production
- Active GitHub profile with 100+ repositories`,
      status: 'pending',
    })
    .returning();

  logger.info(`${TEST_PREFIX} Created test candidate`, {
    candidateId: candidate.id,
  });

  return {
    organizationId: organization.id,
    userId: user.id,
    jobId: job.id,
    candidateId: candidate.id,
  };
}

async function triggerVerification(testData: TestData): Promise<void> {
  console.log(`${TEST_PREFIX} Triggering verification workflow...`);

  await inngest.send({
    name: 'candidate/submitted',
    data: {
      candidateId: testData.candidateId,
      jobId: testData.jobId,
      organizationId: testData.organizationId,
    },
  });

  logger.info(`${TEST_PREFIX} Sent candidate/submitted event`, {
    candidateId: testData.candidateId,
  });
}

async function pollForCompletion(candidateId: string): Promise<boolean> {
  console.log(`${TEST_PREFIX} Polling for completion (max 5 minutes)...`);

  const maxAttempts = 60; // 60 attempts * 5 seconds = 5 minutes
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const [candidate] = await db
      .select()
      .from(schema.candidates)
      .where(eq(schema.candidates.id, candidateId));

    const status = candidate?.status;
    logger.debug(`${TEST_PREFIX} Poll attempt ${attempt}/${maxAttempts}`, {
      status,
    });

    if (status === 'complete') {
      console.log(`${TEST_PREFIX} Candidate status: complete ✓`);
      return true;
    }

    if (status === 'error') {
      console.log(`${TEST_PREFIX} Candidate status: error ✗`);
      return false;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  console.log(`${TEST_PREFIX} Timeout: Verification did not complete in 5 minutes`);
  return false;
}

async function validateResults(candidateId: string): Promise<boolean> {
  console.log(`${TEST_PREFIX} Validating results...`);
  let isValid = true;

  // Check if brief exists
  const [brief] = await db
    .select()
    .from(schema.candidateBriefs)
    .where(eq(schema.candidateBriefs.candidateId, candidateId));

  if (!brief) {
    console.log(`${TEST_PREFIX} ✗ No brief found for candidate`);
    return false;
  }

  console.log(`${TEST_PREFIX} ✓ Brief exists`);

  // Validate brief has required fields
  if (typeof brief.fitScore !== 'number' || brief.fitScore < 0 || brief.fitScore > 1) {
    console.log(`${TEST_PREFIX} ✗ Invalid fitScore: ${brief.fitScore}`);
    isValid = false;
  } else {
    console.log(`${TEST_PREFIX} ✓ fitScore: ${brief.fitScore}`);
  }

  if (typeof brief.evidenceScore !== 'number' || brief.evidenceScore < 0 || brief.evidenceScore > 1) {
    console.log(`${TEST_PREFIX} ✗ Invalid evidenceScore: ${brief.evidenceScore}`);
    isValid = false;
  } else {
    console.log(`${TEST_PREFIX} ✓ evidenceScore: ${brief.evidenceScore}`);
  }

  if (!Array.isArray(brief.verifiedClaims)) {
    console.log(`${TEST_PREFIX} ✗ verifiedClaims is not an array`);
    isValid = false;
  } else {
    console.log(`${TEST_PREFIX} ✓ verifiedClaims: ${brief.verifiedClaims.length} claims`);
  }

  // Check if claims were extracted
  const claims = await db
    .select()
    .from(schema.claims)
    .where(eq(schema.claims.candidateId, candidateId));

  if (claims.length === 0) {
    console.log(`${TEST_PREFIX} ✗ No claims extracted`);
    isValid = false;
  } else {
    console.log(`${TEST_PREFIX} ✓ Extracted ${claims.length} claims`);
  }

  // Check if evidence packets were collected
  const packets = await db
    .select()
    .from(schema.evidencePackets)
    .where(eq(schema.evidencePackets.candidateId, candidateId));

  if (packets.length === 0) {
    console.log(`${TEST_PREFIX} ✗ No evidence packets collected`);
    isValid = false;
  } else {
    console.log(`${TEST_PREFIX} ✓ Collected ${packets.length} evidence packets`);
  }

  return isValid;
}

async function cleanup(organizationId: string): Promise<void> {
  console.log(`${TEST_PREFIX} Cleaning up test data...`);

  // Delete organization (cascade deletes all related records)
  await db
    .delete(schema.organizations)
    .where(eq(schema.organizations.id, organizationId));

  logger.info(`${TEST_PREFIX} Deleted test organization and all related data`, {
    organizationId,
  });
}

async function main() {
  console.log('\n🧪 Integration Test: End-to-End Candidate Verification\n');

  let testData: TestData | null = null;

  try {
    // Setup
    testData = await createTestData();

    // Trigger
    await triggerVerification(testData);

    // Poll
    const completed = await pollForCompletion(testData.candidateId);
    if (!completed) {
      throw new Error('Verification workflow did not complete successfully');
    }

    // Validate
    const isValid = await validateResults(testData.candidateId);
    if (!isValid) {
      throw new Error('Validation failed - results do not meet expectations');
    }

    console.log(`\n✅ Integration test passed!\n`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Integration test failed:`, error);
    logger.error(`${TEST_PREFIX} Test failed`, error as Error);
    process.exit(1);
  } finally {
    // Always cleanup, even on failure
    if (testData) {
      await cleanup(testData.organizationId);
    }
  }
}

main().catch((error) => {
  console.error('\n❌ Unexpected error during integration test:', error);
  process.exit(1);
});
