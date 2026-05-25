import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { allFunctions } from '@/inngest/functions';

/**
 * Inngest API Route
 * Serves all DeepHire Inngest functions
 *
 * This endpoint is used by Inngest to:
 * 1. Discover registered functions (GET)
 * 2. Execute functions when events are triggered (POST)
 * 3. Handle function updates (PUT)
 *
 * Learn more: https://www.inngest.com/docs/reference/serve
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: allFunctions,
});
