import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Inngest } from 'inngest';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
}

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_WEBHOOK_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
  'GITHUB_TOKEN',
  'OPENROUTER_API_KEY',
  'INNGEST_EVENT_KEY',
  'INNGEST_SIGNING_KEY',
];

async function checkEnvVars(): Promise<CheckResult> {
  const startTime = Date.now();
  const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    return {
      name: 'Environment Variables',
      status: 'fail',
      message: `Missing required variables: ${missingVars.join(', ')}`,
      duration: Date.now() - startTime,
    };
  }

  return {
    name: 'Environment Variables',
    status: 'pass',
    message: `All ${REQUIRED_ENV_VARS.length} required variables present`,
    duration: Date.now() - startTime,
  };
}

async function checkDatabase(): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    // Connect to database
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    const neonSql = neon(connectionString);
    const db = drizzle(neonSql);

    // Test connection
    await db.execute(sql`SELECT 1`);

    // Verify organizations table exists (main table for schema check)
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
      );
    `);

    const tableExists = result.rows[0]?.exists;
    if (!tableExists) {
      throw new Error('Organizations table does not exist - schema migration may be needed');
    }

    return {
      name: 'Database',
      status: 'pass',
      message: 'Connection successful and schema verified',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      name: 'Database',
      status: 'fail',
      message: `Database check failed: ${message}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkR2(): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const bucketName = process.env.R2_BUCKET_NAME!;
    const testKey = `deploy-check/${Date.now()}-test.txt`;
    const testContent = 'Pre-deployment check test file';

    // Upload test file
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: Buffer.from(testContent),
        ContentType: 'text/plain',
      })
    );

    // Delete test file
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      })
    );

    return {
      name: 'R2 Storage',
      status: 'pass',
      message: 'Upload and delete operations successful',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      name: 'R2 Storage',
      status: 'fail',
      message: `R2 check failed: ${message}`,
      duration: Date.now() - startTime,
    };
  }
}

async function checkInngest(): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    const inngest = new Inngest({
      id: 'deephire',
      name: 'DeepHire',
      eventKey: process.env.INNGEST_EVENT_KEY,
    });

    // Send a test event
    await inngest.send({
      name: 'deploy/health-check',
      data: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
      },
    });

    return {
      name: 'Inngest',
      status: 'pass',
      message: 'Test event sent successfully',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      name: 'Inngest',
      status: 'fail',
      message: `Inngest check failed: ${message}`,
      duration: Date.now() - startTime,
    };
  }
}

async function main() {
  console.log('\n🔍 Pre-Deployment Validation\n');
  console.log('Running system checks...\n');

  const checks = [
    await checkEnvVars(),
    await checkDatabase(),
    await checkR2(),
    await checkInngest(),
  ];

  let allPassed = true;

  for (const check of checks) {
    const icon = check.status === 'pass' ? '✓' : '✗';
    const color = check.status === 'pass' ? '\x1b[32m' : '\x1b[31m'; // Green or Red
    const reset = '\x1b[0m';
    const duration = check.duration ? ` (${check.duration}ms)` : '';

    console.log(`${color}${icon}${reset} ${check.name}: ${check.message}${duration}`);

    if (check.status === 'fail') {
      allPassed = false;
    }
  }

  console.log('');

  if (allPassed) {
    console.log('✅ All checks passed! System ready for deployment.\n');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please fix the issues before deploying.\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Unexpected error during pre-deployment check:', error);
  process.exit(1);
});
