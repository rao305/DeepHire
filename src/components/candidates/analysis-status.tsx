import { Candidate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { Progress } from '../ui/progress';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AnalysisStatusProps {
  candidate: Candidate;
}

export function AnalysisStatus({ candidate }: AnalysisStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: 'Pending Analysis',
      description: 'Waiting to start verification',
      color: 'text-gray-500',
      progress: 0,
    },
    analyzing: {
      icon: Spinner,
      title: 'Analyzing Candidate',
      description: 'AI agents are verifying resume claims',
      color: 'text-blue-600',
      progress: 50,
    },
    completed: {
      icon: CheckCircle,
      title: 'Analysis Complete',
      description: 'All verification steps finished',
      color: 'text-green-600',
      progress: 100,
    },
    failed: {
      icon: XCircle,
      title: 'Analysis Failed',
      description: 'An error occurred during verification',
      color: 'text-red-600',
      progress: 0,
    },
  };

  const config = statusConfig[candidate.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className={config.color}>
            {candidate.status === 'analyzing' ? (
              <Spinner size="md" />
            ) : (
              <Icon className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{config.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
            <Progress value={config.progress} className="mt-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
