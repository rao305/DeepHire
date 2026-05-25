import { ShippedWork } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShippedWorkCard } from '../ui/shipped-work-card';
import { Rocket } from 'lucide-react';

interface ShippedWorkSectionProps {
  work: ShippedWork[];
}

export function ShippedWorkSection({ work }: ShippedWorkSectionProps) {
  if (work.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Top Shipped Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No shipped work found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Rocket className="h-6 w-6 text-blue-600" />
        Top Shipped Work ({work.length})
      </h2>
      <div className="space-y-4">
        {work.map((item) => (
          <ShippedWorkCard key={item.id} work={item} />
        ))}
      </div>
    </div>
  );
}
