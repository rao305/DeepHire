import { RiskFlag } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle } from 'lucide-react';

interface RiskFlagsProps {
  flags: RiskFlag[];
}

export function RiskFlags({ flags }: RiskFlagsProps) {
  if (flags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            Risk Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No risk flags detected</p>
        </CardContent>
      </Card>
    );
  }

  const severityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          Risk Flags ({flags.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flags.map((flag, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={severityVariant(flag.severity) as any}>
                  {flag.severity}
                </Badge>
                <h4 className="font-medium">{flag.description}</h4>
              </div>
              <p className="text-sm text-gray-600">{flag.details}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
