import { VerificationRubric } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface RubricEditorProps {
  rubric: VerificationRubric;
}

export function RubricEditor({ rubric }: RubricEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Rubric</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {rubric.requiredSkills.map((skill) => (
              <Badge key={skill} variant="default">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Preferred Skills</h4>
          <div className="flex flex-wrap gap-2">
            {rubric.preferredSkills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Key Projects</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {rubric.keyProjects.map((project, i) => (
              <li key={i}>• {project}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Verification Weights</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>GitHub Activity</span>
              <span className="font-medium">{(rubric.weights.githubActivity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Portfolio Quality</span>
              <span className="font-medium">{(rubric.weights.portfolioQuality * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Project Complexity</span>
              <span className="font-medium">{(rubric.weights.projectComplexity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Code Quality</span>
              <span className="font-medium">{(rubric.weights.codeQuality * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
