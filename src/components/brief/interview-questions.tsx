import { InterviewQuestion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MessageSquare } from 'lucide-react';

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
}

export function InterviewQuestions({ questions }: InterviewQuestionsProps) {
  const categoryBadge = (category: string) => {
    switch (category) {
      case 'technical': return { variant: 'default' as const, label: 'Technical' };
      case 'behavioral': return { variant: 'secondary' as const, label: 'Behavioral' };
      case 'verification': return { variant: 'warning' as const, label: 'Verification' };
      default: return { variant: 'default' as const, label: category };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Interview Questions ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questions.map((q, index) => {
            const badge = categoryBadge(q.category);
            return (
              <div key={index} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="font-bold text-gray-400">{index + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Purpose:</span> {q.purpose}
                    </p>
                    {q.followUps && q.followUps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Follow-ups:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {q.followUps.map((followUp, i) => (
                            <li key={i}>• {followUp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
