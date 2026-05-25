import { ClaimWithEvidence } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ClaimCard } from '../ui/claim-card';
import { CheckCircle } from 'lucide-react';

interface VerifiedClaimsProps {
  claims: ClaimWithEvidence[];
}

export function VerifiedClaims({ claims }: VerifiedClaimsProps) {
  if (claims.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Verified Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No verified claims</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
        Verified Claims ({claims.length})
      </h2>
      <div className="space-y-4">
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}
