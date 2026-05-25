import Link from 'next/link';
import { Candidate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScoreRing } from '../ui/score-ring';
import { formatDate, statusBadgeVariant, getInitials } from '@/lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Link href={`/candidates/${candidate.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {getInitials(candidate.name)}
              </div>
              <div>
                <CardTitle className="text-lg">{candidate.name}</CardTitle>
                <p className="text-sm text-gray-500">{candidate.email}</p>
              </div>
            </div>
            <Badge variant={statusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Added {formatDate(candidate.createdAt)}</p>
              {candidate.githubUrl && <p className="mt-1">✓ GitHub linked</p>}
              {candidate.portfolioUrl && <p>✓ Portfolio linked</p>}
            </div>
            {candidate.overallScore !== null && candidate.overallScore !== undefined && (
              <ScoreRing score={candidate.overallScore} size="sm" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
