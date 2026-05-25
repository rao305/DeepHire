import { Inngest } from 'inngest';
import { ExtractedClaim, EvidencePacket } from '@/types';

/**
 * DeepHire Inngest Event Schema
 * Defines all async events for agent orchestration
 */
type Events = {
  /**
   * Triggered when a recruiting job is created
   * Allows downstream workflows to prepare analysis resources
   */
  'job/created': {
    data: {
      jobId: string;
      organizationId: string;
    };
  };

  /**
   * Triggered when a candidate submits their application
   * Initiates the verification pipeline
   */
  'candidate/submitted': {
    data: {
      candidateId: string;
      jobId: string;
      organizationId: string;
    };
  };

  /**
   * Triggered after resume parsing and claim extraction
   * Signals that claims are ready for verification
   */
  'candidate/claims-extracted': {
    data: {
      candidateId: string;
      claims: ExtractedClaim[];
    };
  };

  /**
   * Triggered when all agent verification is complete
   * Signals that brief generation can begin
   */
  'candidate/verification-complete': {
    data: {
      candidateId: string;
      evidencePackets: EvidencePacket[];
    };
  };

  /**
   * Triggered when candidate brief is generated
   * Final step in the verification pipeline
   */
  'candidate/brief-generated': {
    data: {
      candidateId: string;
      briefId: string;
    };
  };

  /**
   * Triggers GitHub verification agent
   * Verifies claims using GitHub API and browser automation
   */
  'agent/github-verify': {
    data: {
      candidateId: string;
      claimId: string;
      claim: ExtractedClaim;
      githubUrl: string;
    };
  };

  /**
   * Triggers Portfolio verification agent
   * Verifies claims using portfolio website analysis
   */
  'agent/portfolio-verify': {
    data: {
      candidateId: string;
      claimId: string;
      claim: ExtractedClaim;
      portfolioUrl: string;
    };
  };

  /**
   * Triggers LinkedIn verification agent
   * Verifies claims using LinkedIn profile analysis
   */
  'agent/linkedin-verify': {
    data: {
      candidateId: string;
      claimId: string;
      claim: ExtractedClaim;
      linkedinUrl: string;
    };
  };
};

/**
 * Event name constants for type-safe event dispatching
 */
export const INNGEST_EVENTS = {
  JOB_CREATED: 'job/created',
  CANDIDATE_SUBMITTED: 'candidate/submitted',
  CLAIMS_EXTRACTED: 'candidate/claims-extracted',
  VERIFICATION_COMPLETE: 'candidate/verification-complete',
  BRIEF_GENERATED: 'candidate/brief-generated',
  GITHUB_VERIFY: 'agent/github-verify',
  PORTFOLIO_VERIFY: 'agent/portfolio-verify',
  LINKEDIN_VERIFY: 'agent/linkedin-verify',
} as const;

/**
 * Typed Inngest client for DeepHire
 * Provides end-to-end type safety for event dispatching and handling
 */
export const inngest = new Inngest({
  id: 'deephire',
  name: 'DeepHire',
});
