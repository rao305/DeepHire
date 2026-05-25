import { boolean, date, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type {
  AgentType,
  Evidence,
  InterviewQuestion,
  JobRubric,
  ProvenanceLog,
  RiskFlag,
  ShippedWorkItem,
  VerifiedClaim,
  WeakClaim,
} from '../types';

export const organizationPlanEnum = pgEnum('organization_plan', ['free', 'pro', 'enterprise']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'recruiter', 'viewer']);
export const jobStatusEnum = pgEnum('job_status', ['active', 'archived']);
export const candidateStatusEnum = pgEnum('candidate_status', ['pending', 'analyzing', 'complete', 'error']);
export const claimTypeEnum = pgEnum('claim_type', [
  'skill',
  'project',
  'scale',
  'ownership',
  'deployment',
  'leadership',
  'outcome',
  'timeline',
  'employment',
]);
export const agentTypeEnum = pgEnum('agent_type', ['github_api', 'github_browser', 'portfolio_browser', 'linkedin']);
export const retrievalModeEnum = pgEnum('retrieval_mode', ['api', 'browser', 'hybrid', 'minimal']);
export const claimVerdictEnum = pgEnum('claim_verdict', ['SUPPORTED', 'WEAKLY_SUPPORTED', 'UNVERIFIED', 'CONTRADICTED']);
export const briefStatusEnum = pgEnum('brief_status', ['generating', 'complete', 'error']);
export const analysisRunStatusEnum = pgEnum('analysis_run_status', ['pending', 'running', 'complete', 'failed']);

const score = (name: string) => numeric(name, { precision: 5, scale: 4, mode: 'number' });
const money = (name: string) => numeric(name, { precision: 12, scale: 6, mode: 'number' });

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  plan: organizationPlanEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('organizations_clerk_id_idx').on(table.clerkId),
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').default('viewer').notNull(),
  clerkId: text('clerk_id').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_organization_id_idx').on(table.organizationId),
  index('users_clerk_id_idx').on(table.clerkId),
  index('users_is_active_idx').on(table.isActive),
]);

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  rubric: jsonb('rubric').notNull().$type<JobRubric>(),
  status: jobStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('jobs_organization_id_idx').on(table.organizationId),
  index('jobs_status_idx').on(table.status),
]);

export const candidates = pgTable('candidates', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  resumeText: text('resume_text').notNull(),
  resumeUrl: text('resume_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  linkedinUrl: text('linkedin_url'),
  notes: text('notes'),
  status: candidateStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('candidates_organization_id_idx').on(table.organizationId),
  index('candidates_job_id_idx').on(table.jobId),
  index('candidates_status_idx').on(table.status),
]);

export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  type: claimTypeEnum('type').notNull(),
  text: text('text').notNull(),
  keywords: jsonb('keywords').notNull().$type<string[]>(),
  jobRelevance: score('job_relevance').notNull(),
  priority: score('priority').notNull(),
  verificationStrategy: jsonb('verification_strategy').notNull().$type<AgentType[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('claims_candidate_id_idx').on(table.candidateId),
]);

export const evidencePackets = pgTable('evidence_packets', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  claimId: uuid('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  agentType: agentTypeEnum('agent_type').notNull(),
  retrievalMode: retrievalModeEnum('retrieval_mode').notNull(),
  verdict: claimVerdictEnum('verdict').notNull(),
  confidence: score('confidence').notNull(),
  evidence: jsonb('evidence').notNull().$type<Evidence[]>(),
  provenance: jsonb('provenance').notNull().$type<ProvenanceLog[]>(),
  shippedWork: jsonb('shipped_work').$type<ShippedWorkItem[]>(),
  visitedUrls: jsonb('visited_urls').notNull().$type<string[]>(),
  totalSteps: integer('total_steps').notNull(),
  visionCallCount: integer('vision_call_count').notNull(),
  costUsd: money('cost_usd').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('evidence_packets_candidate_id_idx').on(table.candidateId),
  index('evidence_packets_claim_id_idx').on(table.claimId),
]);

export const evidenceScreenshots = pgTable('evidence_screenshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  packetId: uuid('packet_id').notNull().references(() => evidencePackets.id, { onDelete: 'cascade' }),
  s3Key: text('s3_key').notNull(),
  pageUrl: text('page_url').notNull(),
  stepNumber: integer('step_number').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('evidence_screenshots_packet_id_idx').on(table.packetId),
]);

export const shippedWorkItems = pgTable('shipped_work_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  packetId: uuid('packet_id').notNull().references(() => evidencePackets.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  technologies: jsonb('technologies').notNull().$type<string[]>(),
  sourceUrl: text('source_url').notNull(),
  demoUrl: text('demo_url'),
  githubUrl: text('github_url'),
  hasLiveDemo: boolean('has_live_demo').default(false).notNull(),
  relevanceToRole: score('relevance_to_role').notNull(),
  technicalDepth: score('technical_depth').notNull(),
  recency: date('recency'),
  screenshotKeys: jsonb('screenshot_keys').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('shipped_work_items_candidate_id_idx').on(table.candidateId),
  index('shipped_work_items_packet_id_idx').on(table.packetId),
]);

export const candidateBriefs = pgTable('candidate_briefs', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  fitScore: score('fit_score').notNull(),
  evidenceScore: score('evidence_score').notNull(),
  shippedWorkScore: score('shipped_work_score').notNull(),
  confidenceScore: score('confidence_score').notNull(),
  verifiedClaims: jsonb('verified_claims').notNull().$type<VerifiedClaim[]>(),
  weakClaims: jsonb('weak_claims').notNull().$type<WeakClaim[]>(),
  risks: jsonb('risks').notNull().$type<RiskFlag[]>(),
  interviewQuestions: jsonb('interview_questions').notNull().$type<InterviewQuestion[]>(),
  status: briefStatusEnum('status').default('generating').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('candidate_briefs_candidate_id_idx').on(table.candidateId),
  index('candidate_briefs_job_id_idx').on(table.jobId),
]);

export const analysisRuns = pgTable('analysis_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  status: analysisRunStatusEnum('status').default('pending').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  totalCostUsd: money('total_cost_usd').default(0).notNull(),
  errorMessage: text('error_message'),
  stepsLog: jsonb('steps_log').notNull().$type<ProvenanceLog[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('analysis_runs_candidate_id_idx').on(table.candidateId),
  index('analysis_runs_job_id_idx').on(table.jobId),
  index('analysis_runs_status_idx').on(table.status),
]);
