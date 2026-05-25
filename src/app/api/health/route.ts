import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
    environment: 'ok' | 'error';
  };
  version?: string;
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

export async function GET() {
  const checks = {
    database: 'error' as const,
    environment: 'error' as const,
  };

  try {
    // Check database connection
    try {
      await db.execute(sql`SELECT 1`);
      checks.database = 'ok';
      logger.debug('Health check: Database connection OK');
    } catch (dbError) {
      logger.error('Health check: Database connection failed', dbError as Error);
    }

    // Check environment variables
    const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);
    if (missingVars.length === 0) {
      checks.environment = 'ok';
      logger.debug('Health check: All environment variables present');
    } else {
      logger.warn('Health check: Missing environment variables', {
        missing: missingVars,
      });
    }

    // Determine overall health status
    const isHealthy = checks.database === 'ok' && checks.environment === 'ok';
    const status = isHealthy ? 'healthy' : 'unhealthy';

    const healthData: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA,
    };

    if (!isHealthy) {
      logger.warn('Health check: System unhealthy', { checks });
      return errorResponse('System is unhealthy', 503);
    }

    logger.info('Health check: System healthy');
    return successResponse(healthData);
  } catch (error) {
    logger.error('Health check: Unexpected error', error as Error);
    return errorResponse('Health check failed', 503);
  }
}
