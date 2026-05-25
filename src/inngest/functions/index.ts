/**
 * Inngest Functions Index
 * Central export point for all DeepHire Inngest functions.
 *
 * NOTE: `./generate-brief` still references the previous schema and is
 * temporarily not wired up until it is migrated to the current schema.
 */

import type { InngestFunction } from 'inngest';
import { helloWorld } from './hello-world';
import { verifyCandidateFunction } from './verify-candidate';

export const allFunctions: InngestFunction.Any[] = [
  helloWorld,
  verifyCandidateFunction,
];

export { helloWorld };
export { verifyCandidateFunction };
