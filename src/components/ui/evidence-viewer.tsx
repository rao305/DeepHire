import { Evidence } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { ExternalLink } from 'lucide-react';

interface EvidenceViewerProps {
  evidence: Evidence[];
}

export function EvidenceViewer({ evidence }: EvidenceViewerProps) {
  if (evidence.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">No evidence found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <Badge variant="secondary">{item.type.replace('_', ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span>Relevance: {(item.relevanceScore * 100).toFixed(0)}%</span>
                <span>Credibility: {(item.credibilityScore * 100).toFixed(0)}%</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
