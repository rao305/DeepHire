import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  redirect('/sign-in');

  // Marketing fallback (never rendered; kept for reference).
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Deep<span className="text-blue-600">Hire</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            AI-Powered Technical Recruiting Intelligence
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Verify resume claims automatically using AI browser agents that check GitHub,
            portfolios, and public evidence
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Automated Verification</h3>
              <p className="text-gray-600">
                AI agents automatically verify technical claims against GitHub repos, portfolios,
                and public evidence
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Executive Briefs</h3>
              <p className="text-gray-600">
                Get comprehensive candidate briefs with verified claims, risk flags, and interview
                questions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Smart Prioritization</h3>
              <p className="text-gray-600">
                Focus on what matters - system prioritizes critical claims and ranks shipped work
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
