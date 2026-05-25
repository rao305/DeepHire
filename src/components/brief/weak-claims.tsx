import { ClaimWithEvidence } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ClaimCard } from '../ui/claim-card';
import { AlertTriangle } from 'lucide-react';

interface WeakClaimsProps {
  claims: ClaimWithEvidence[];
}

export function WeakClaims({ claims }: WeakClaimsProps) {
  if (claims.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <AlertTriangle className="h-6 w-6 text-yellow-600" />
        Weak/Unverified Claims ({claims.length})
      </h2>
      <div className="space-y-4">
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}
