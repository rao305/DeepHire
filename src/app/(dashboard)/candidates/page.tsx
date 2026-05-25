import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { jobs, candidates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Shell } from '@/components/layout/shell';
import { CandidateCard } from '@/components/candidates/candidate-card';

export default async function CandidatesPage() {
  const { userId } = await auth();

  // Get user's organization
  const { users } = await import('@/db/schema');
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId!),
  });

  if (!user) {
    return (
      <Shell>
        <p>User not found</p>
      </Shell>
    );
  }

  // Get jobs for user's organization
  const userJobs = await db.select().from(jobs).where(eq(jobs.organizationId, user.organizationId));

  const allCandidates = await Promise.all(
    userJobs.map(job =>
      db.select().from(candidates).where(eq(candidates.jobId, job.id))
    )
  );

  const candidatesList = allCandidates.flat();

  return (
    <Shell>
      <div>
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-gray-500 mt-1">All candidates across your jobs</p>
      </div>

      {candidatesList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No candidates yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidatesList.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate as any} />
          ))}
        </div>
      )}
    </Shell>
  );
}
