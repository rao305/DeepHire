import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { jobs, candidates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Shell } from '@/components/layout/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
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
  const jobIds = userJobs.map(j => j.id);

  const allCandidates = await Promise.all(
    jobIds.map(id => db.select().from(candidates).where(eq(candidates.jobId, id)))
  );
  const candidatesList = allCandidates.flat();

  const stats = {
    totalJobs: userJobs.length,
    totalCandidates: candidatesList.length,
    completed: candidatesList.filter(c => c.status === 'complete').length,
    analyzing: candidatesList.filter(c => c.status === 'analyzing').length,
  };

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your recruiting pipeline</p>
        </div>
        <Link href="/jobs/new">
          <Button>Create Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Analyzing</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.analyzing}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {userJobs.length === 0 ? (
              <p className="text-sm text-gray-500">No jobs yet</p>
            ) : (
              <div className="space-y-2">
                {userJobs.slice(0, 5).map(job => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.status}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            {candidatesList.length === 0 ? (
              <p className="text-sm text-gray-500">No candidates yet</p>
            ) : (
              <div className="space-y-2">
                {candidatesList.slice(0, 5).map(candidate => (
                  <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
