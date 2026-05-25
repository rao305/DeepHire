'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Terminal, Loader2, Check, X } from 'lucide-react';

type Step = 'jd' | 'rubric' | 'save';

interface RubricData {
  title: string;
  seniority: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  focusAreas: string[];
  weights: {
    technicalDepth: number;
    shippedWork: number;
    leadership: number;
    scaleExperience: number;
  };
}

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('jd');
  const [jd, setJd] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [rubric, setRubric] = useState<RubricData>({
    title: '',
    seniority: 'mid',
    mustHaveSkills: [],
    niceToHaveSkills: [],
    focusAreas: [],
    weights: {
      technicalDepth: 30,
      shippedWork: 30,
      leadership: 20,
      scaleExperience: 20,
    },
  });
  const [newSkill, setNewSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleParseJD = async () => {
    setIsParsing(true);
    // Simulate API call to parse JD
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock parsed data
    setRubric({
      title: 'Senior Full-Stack Engineer',
      seniority: 'senior',
      mustHaveSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      niceToHaveSkills: ['AWS', 'Docker', 'GraphQL'],
      focusAreas: ['Scalability', 'Code Quality', 'Mentorship'],
      weights: {
        technicalDepth: 35,
        shippedWork: 30,
        leadership: 20,
        scaleExperience: 15,
      },
    });
    setIsParsing(false);
    setStep('rubric');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd, rubric }),
    });
    const data = await response.json();
    setIsSaving(false);
    router.push(`/jobs/${data.id}`);
  };

  const totalWeight =
    rubric.weights.technicalDepth +
    rubric.weights.shippedWork +
    rubric.weights.leadership +
    rubric.weights.scaleExperience;

  const addSkill = () => {
    if (newSkill.trim()) {
      setRubric({
        ...rubric,
        mustHaveSkills: [...rubric.mustHaveSkills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const addNiceSkill = () => {
    if (newNiceSkill.trim()) {
      setRubric({
        ...rubric,
        niceToHaveSkills: [...rubric.niceToHaveSkills, newNiceSkill.trim()],
      });
      setNewNiceSkill('');
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12 border-l-2 border-terminal-amber pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-terminal-amber" />
          <h1 className="text-2xl font-mono text-terminal-amber tracking-tight">
            ~/jobs/new
          </h1>
        </div>
        <p className="text-xs font-mono text-[#8b949e] tracking-wider">
          CONFIGURE NEW ROLE EVALUATION CRITERIA
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12 flex items-center gap-4">
        {[
          { id: 'jd', label: 'JD INPUT' },
          { id: 'rubric', label: 'ROLE RUBRIC' },
          { id: 'save', label: 'SAVE' },
        ].map((s, idx) => (
          <div key={s.id} className="flex items-center gap-4">
            <div
              className={`flex items-center gap-3 ${
                step === s.id
                  ? 'text-terminal-green'
                  : idx < ['jd', 'rubric', 'save'].indexOf(step)
                  ? 'text-terminal-amber'
                  : 'text-[#3f3f46]'
              }`}
            >
              <div
                className={`w-6 h-6 border flex items-center justify-center text-[10px] font-mono ${
                  step === s.id
                    ? 'border-terminal-green bg-terminal-green/10'
                    : idx < ['jd', 'rubric', 'save'].indexOf(step)
                    ? 'border-terminal-amber bg-terminal-amber/10'
                    : 'border-[#3f3f46]'
                }`}
              >
                {idx < ['jd', 'rubric', 'save'].indexOf(step) ? (
                  <Check className="w-3 h-3" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="text-[10px] font-mono tracking-wider">{s.label}</span>
            </div>
            {idx < 2 && (
              <div
                className={`h-px w-12 ${
                  idx < ['jd', 'rubric', 'save'].indexOf(step)
                    ? 'bg-terminal-amber'
                    : 'bg-[#3f3f46]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: JD Input */}
      {step === 'jd' && (
        <div className="max-w-4xl">
          <div className="mb-6 border-l-2 border-terminal-green pl-4">
            <h2 className="text-sm font-mono text-terminal-green mb-1">
              STEP 1: JOB DESCRIPTION INPUT
            </h2>
            <p className="text-xs font-mono text-[#8b949e]">
              Paste the full job description. AI will extract evaluation criteria.
            </p>
          </div>

          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-4">
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste your job description here..."
              className="w-full min-h-[300px] bg-[#0a0e14] border border-[#27272a] p-4 text-xs font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green resize-y"
            />

            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1f]">
              <div className="text-[10px] font-mono">
                <span
                  className={
                    jd.length >= 100 ? 'text-terminal-green' : 'text-terminal-amber'
                  }
                >
                  {jd.length} CHARS
                </span>
                <span className="text-[#3f3f46] mx-2">/</span>
                <span className="text-[#8b949e]">MIN 100 REQUIRED</span>
              </div>

              <Button
                onClick={handleParseJD}
                disabled={jd.length < 100 || isParsing}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    Parse JD
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Role Rubric */}
      {step === 'rubric' && (
        <div className="max-w-4xl space-y-8">
          <div className="border-l-2 border-terminal-green pl-4">
            <h2 className="text-sm font-mono text-terminal-green mb-1">
              STEP 2: ROLE RUBRIC
            </h2>
            <p className="text-xs font-mono text-[#8b949e]">
              AI extracted these criteria. Adjust as needed.
            </p>
          </div>

          {/* Basic Info */}
          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-[#8b949e] mb-2 tracking-wider">
                JOB TITLE
              </label>
              <input
                type="text"
                value={rubric.title}
                onChange={(e) => setRubric({ ...rubric, title: e.target.value })}
                className="w-full bg-[#0a0e14] border border-[#27272a] px-4 py-2 text-sm font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8b949e] mb-2 tracking-wider">
                SENIORITY
              </label>
              <select
                value={rubric.seniority}
                onChange={(e) => setRubric({ ...rubric, seniority: e.target.value })}
                className="w-full bg-[#0a0e14] border border-[#27272a] px-4 py-2 text-sm font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green"
              >
                <option value="junior">JUNIOR</option>
                <option value="mid">MID</option>
                <option value="senior">SENIOR</option>
                <option value="staff">STAFF</option>
                <option value="principal">PRINCIPAL</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-terminal-green mb-3 tracking-wider">
                MUST-HAVE SKILLS
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {rubric.mustHaveSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 bg-terminal-green/10 border border-terminal-green/30 px-3 py-1 text-xs font-mono text-terminal-green"
                  >
                    {skill}
                    <button
                      onClick={() =>
                        setRubric({
                          ...rubric,
                          mustHaveSkills: rubric.mustHaveSkills.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add skill..."
                  className="flex-1 bg-[#0a0e14] border border-[#27272a] px-3 py-2 text-xs font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green"
                />
                <Button onClick={addSkill} variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-terminal-amber mb-3 tracking-wider">
                NICE-TO-HAVE SKILLS
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {rubric.niceToHaveSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 bg-terminal-amber/10 border border-terminal-amber/30 px-3 py-1 text-xs font-mono text-terminal-amber"
                  >
                    {skill}
                    <button
                      onClick={() =>
                        setRubric({
                          ...rubric,
                          niceToHaveSkills: rubric.niceToHaveSkills.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNiceSkill}
                  onChange={(e) => setNewNiceSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNiceSkill()}
                  placeholder="Add skill..."
                  className="flex-1 bg-[#0a0e14] border border-[#27272a] px-3 py-2 text-xs font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green"
                />
                <Button onClick={addNiceSkill} variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Weights */}
          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-mono text-[#8b949e] tracking-wider">
                EVALUATION WEIGHTS
              </label>
              <div className="text-xs font-mono">
                <span
                  className={
                    totalWeight === 100 ? 'text-terminal-green' : 'text-terminal-red'
                  }
                >
                  {totalWeight}%
                </span>
                <span className="text-[#3f3f46] mx-2">/</span>
                <span className="text-[#8b949e]">MUST EQUAL 100%</span>
              </div>
            </div>

            {Object.entries(rubric.weights).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-[#e6edf3]">
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </label>
                  <span className="text-xs font-mono text-terminal-green tabular-nums">
                    {value}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) =>
                    setRubric({
                      ...rubric,
                      weights: {
                        ...rubric.weights,
                        [key]: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1 bg-[#27272a] appearance-none slider"
                  style={{
                    background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${value}%, #27272a ${value}%, #27272a 100%)`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[#1a1a1f]">
            <Button onClick={() => setStep('jd')} variant="outline">
              <ArrowLeft className="w-3 h-3 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep('save')} disabled={totalWeight !== 100}>
              Continue
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Save */}
      {step === 'save' && (
        <div className="max-w-2xl">
          <div className="mb-6 border-l-2 border-terminal-green pl-4">
            <h2 className="text-sm font-mono text-terminal-green mb-1">
              STEP 3: REVIEW & SAVE
            </h2>
            <p className="text-xs font-mono text-[#8b949e]">
              Confirm role configuration before saving.
            </p>
          </div>

          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-6">
            <div>
              <div className="text-[10px] font-mono text-[#8b949e] mb-1">
                JOB TITLE
              </div>
              <div className="text-lg font-mono text-terminal-green">
                {rubric.title}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-[#8b949e] mb-1">
                SENIORITY
              </div>
              <div className="text-sm font-mono text-terminal-amber uppercase">
                {rubric.seniority}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-[#8b949e] mb-2">
                MUST-HAVE SKILLS ({rubric.mustHaveSkills.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {rubric.mustHaveSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-terminal-green/10 border border-terminal-green/30 px-3 py-1 text-xs font-mono text-terminal-green"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1a1a1f]">
              <div className="text-[10px] font-mono text-[#8b949e] mb-3">
                EVALUATION WEIGHTS
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(rubric.weights).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-[#0a0e14] border border-[#27272a] px-4 py-3"
                  >
                    <div className="text-[10px] text-[#8b949e] mb-1">
                      {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </div>
                    <div className="text-xl font-mono text-terminal-green tabular-nums">
                      {value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button onClick={() => setStep('rubric')} variant="outline">
              <ArrowLeft className="w-3 h-3 mr-2" />
              Back
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 mr-2" />
                  Save Role
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
