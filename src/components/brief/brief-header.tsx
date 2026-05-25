import { Brief } from '@/types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface BriefHeaderProps {
  brief: Brief;
  candidateName: string;
}

export function BriefHeader({ brief, candidateName }: BriefHeaderProps) {
  const recommendationConfig = {
    strong_yes: { label: 'Strong Yes', variant: 'success' as const },
    yes: { label: 'Yes', variant: 'success' as const },
    maybe: { label: 'Maybe', variant: 'warning' as const },
    no: { label: 'No', variant: 'danger' as const },
    strong_no: { label: 'Strong No', variant: 'danger' as const },
  };

  const config = recommendationConfig[brief.recommendation];

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{candidateName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Executive Brief
            </p>
          </div>
          <Badge variant={config.variant} className="text-base px-4 py-1">
            {config.label}
          </Badge>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{brief.summary}</p>
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {brief.verifiedClaims.length}
            </div>
            <div className="text-xs text-gray-500">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {brief.weakClaims.length}
            </div>
            <div className="text-xs text-gray-500">Weak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {brief.falseClaims.length}
            </div>
            <div className="text-xs text-gray-500">False</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {brief.shippedWork.length}
            </div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
