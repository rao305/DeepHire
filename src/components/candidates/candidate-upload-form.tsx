'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock,
  Code,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Play,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface CandidateUploadFormProps {
  jobId: string;
  onSuccess?: (candidateId: string) => void;
}

type Step = 1 | 2 | 3;

const GITHUB_URL_REGEX = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/;
const LINKEDIN_URL_REGEX =
  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9._%-]+\/?$/;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

interface UploadedResume {
  url: string;
  text: string;
  filename: string;
  size: number;
}

interface FormState {
  name: string;
  email: string;
  githubUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;
  notes: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extractGithubUsername(url: string): string | null {
  const match = url.match(/github\.com\/([A-Za-z0-9-]+)/);
  return match ? match[1] : null;
}

function extractLinkedinHandle(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([A-Za-z0-9._%-]+)/);
  return match ? match[1] : null;
}

function extractName(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every((w) => /^[A-Za-z][A-Za-z'.-]+$/.test(w))
    ) {
      return line;
    }
  }
  return '';
}

function extractEmail(text: string): string {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0] : '';
}

export function CandidateUploadForm({
  jobId,
  onSuccess,
}: CandidateUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedResume | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    githubUrl: '',
    portfolioUrl: '',
    linkedinUrl: '',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const githubUsername = useMemo(
    () => (form.githubUrl ? extractGithubUsername(form.githubUrl) : null),
    [form.githubUrl]
  );
  const linkedinHandle = useMemo(
    () => (form.linkedinUrl ? extractLinkedinHandle(form.linkedinUrl) : null),
    [form.linkedinUrl]
  );

  const validateFile = (candidate: File): string | null => {
    if (candidate.type !== 'application/pdf') {
      return 'File must be a PDF';
    }
    if (candidate.size > MAX_FILE_BYTES) {
      return `File must be 10MB or smaller (got ${formatBytes(candidate.size)})`;
    }
    if (candidate.size === 0) {
      return 'File is empty';
    }
    return null;
  };

  const uploadFile = useCallback((candidate: File) => {
    setUploadProgress(0);
    setIsUploading(true);
    setUploadError(null);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as UploadedResume;
          setUploaded(payload);
          setUploadProgress(100);
          setForm((prev) => ({
            ...prev,
            name: prev.name || extractName(payload.text || ''),
            email: prev.email || extractEmail(payload.text || ''),
          }));
        } catch {
          setUploadError('Server returned an invalid response');
        }
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const payload = JSON.parse(xhr.responseText);
          message = payload.error || message;
        } catch {
          /* keep generic message */
        }
        setUploadError(message);
      }
    });

    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setUploadError('Network error during upload');
    });

    xhr.addEventListener('abort', () => {
      setIsUploading(false);
      setUploadError('Upload aborted');
    });

    const data = new FormData();
    data.append('file', candidate);
    xhr.send(data);
  }, []);

  const handleFileSelected = (candidate: File) => {
    const error = validateFile(candidate);
    if (error) {
      setUploadError(error);
      setFile(null);
      setUploaded(null);
      return;
    }
    setFile(candidate);
    setUploaded(null);
    uploadFile(candidate);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const candidate = event.dataTransfer.files?.[0];
    if (candidate) handleFileSelected(candidate);
  };

  const removeFile = () => {
    setFile(null);
    setUploaded(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStep2 = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (!form.githubUrl.trim()) {
      errors.githubUrl = 'GitHub URL is required';
    } else if (!GITHUB_URL_REGEX.test(form.githubUrl.trim())) {
      errors.githubUrl = 'Must be a valid github.com profile URL';
    }

    if (form.portfolioUrl.trim()) {
      try {
        new URL(form.portfolioUrl.trim());
      } catch {
        errors.portfolioUrl = 'Must be a valid URL';
      }
    }

    if (form.linkedinUrl.trim()) {
      if (!LINKEDIN_URL_REGEX.test(form.linkedinUrl.trim())) {
        errors.linkedinUrl = 'Must be a valid linkedin.com/in profile URL';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errors.name = 'Candidate name is required';
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Valid email is required';
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleStartAnalysis = async () => {
    if (!uploaded || !validateStep3()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createRes = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          name: form.name.trim(),
          email: form.email.trim(),
          resumeText: uploaded.text,
          resumeUrl: uploaded.url,
          githubUrl: form.githubUrl.trim(),
          portfolioUrl: form.portfolioUrl.trim() || undefined,
          linkedinUrl: form.linkedinUrl.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });

      const createPayload = await createRes.json();
      if (!createRes.ok || createPayload?.success === false) {
        throw new Error(createPayload?.error || 'Failed to create candidate');
      }

      const candidateId: string =
        createPayload.data?.id ?? createPayload.data?.candidateId;
      if (!candidateId) {
        throw new Error('No candidate id returned');
      }

      const verifyRes = await fetch(`/api/candidates/${candidateId}/verify`, {
        method: 'POST',
      });
      const verifyPayload = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || verifyPayload?.success === false) {
        throw new Error(verifyPayload?.error || 'Failed to start analysis');
      }

      onSuccess?.(candidateId);
      router.push(`/candidates/${candidateId}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unknown error starting analysis'
      );
      setIsSubmitting(false);
    }
  };

  const stepCanContinue = step === 1 ? !!uploaded && !isUploading : true;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((n, idx) => {
          const isActive = step === n;
          const isDone = step > n;
          return (
            <div key={n} className="flex items-center gap-4">
              <div
                className={cn(
                  'flex items-center gap-3',
                  isActive
                    ? 'text-terminal-green'
                    : isDone
                    ? 'text-terminal-amber'
                    : 'text-[#3f3f46]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 border flex items-center justify-center text-[10px] font-mono',
                    isActive && 'border-terminal-green bg-terminal-green/10',
                    isDone && 'border-terminal-amber bg-terminal-amber/10',
                    !isActive && !isDone && 'border-[#3f3f46]'
                  )}
                >
                  {isDone ? <Check className="w-3 h-3" /> : n}
                </div>
                <span className="text-[10px] font-mono tracking-wider">
                  {n === 1 ? 'RESUME' : n === 2 ? 'LINKS' : 'REVIEW'}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={cn(
                    'h-px w-10',
                    step > n ? 'bg-terminal-amber' : 'bg-[#3f3f46]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="border-l-2 border-terminal-green pl-4">
            <h2 className="text-sm font-mono text-terminal-green mb-1">
              STEP 1: RESUME UPLOAD
            </h2>
            <p className="text-xs font-mono text-[#8b949e]">
              PDF only, max 10MB. Text will be extracted for claim analysis.
            </p>
          </div>

          {!file && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed p-12 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-terminal-green bg-terminal-green/5'
                  : 'border-[#27272a] hover:border-terminal-green/40 hover:bg-[#0f1116]'
              )}
              role="button"
              tabIndex={0}
              aria-label="Upload resume PDF"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <Upload
                className={cn(
                  'w-12 h-12 mx-auto mb-4 transition-colors',
                  isDragging ? 'text-terminal-green' : 'text-[#3f3f46]'
                )}
              />
              <div className="text-sm font-mono text-[#e6edf3] mb-1">
                Drop PDF here or click to browse
              </div>
              <div className="text-xs font-mono text-[#8b949e]">
                Maximum 10MB &middot; PDF only
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const candidate = e.target.files?.[0];
                  if (candidate) handleFileSelected(candidate);
                }}
              />
            </div>
          )}

          {file && (
            <div className="border border-[#1a1a1f] bg-[#0f1116] p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 border border-terminal-green/30 bg-terminal-green/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-terminal-green" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-mono text-[#e6edf3] truncate">
                      {file.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#8b949e] mt-1 tracking-wider">
                      {formatBytes(file.size).toUpperCase()}
                      {uploaded && (
                        <span className="ml-3 text-terminal-green">
                          &middot; UPLOAD COMPLETE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-[#8b949e] hover:text-terminal-red transition-colors shrink-0"
                  aria-label="Remove file"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(isUploading || uploadProgress > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#8b949e] tracking-wider">
                      {isUploading ? 'UPLOADING' : 'COMPLETE'}
                    </span>
                    <span className="text-[10px] font-mono text-terminal-green tabular-nums">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-1 bg-[#27272a] overflow-hidden">
                    <div
                      className="h-full bg-terminal-green transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-3 border border-terminal-red/30 bg-terminal-red/5 p-4">
              <AlertCircle className="w-4 h-4 text-terminal-red shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-terminal-red">
                {uploadError}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="border-l-2 border-terminal-green pl-4">
            <h2 className="text-sm font-mono text-terminal-green mb-1">
              STEP 2: PUBLIC LINKS
            </h2>
            <p className="text-xs font-mono text-[#8b949e]">
              Provide profiles for our agents to verify claims against.
            </p>
          </div>

          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-6">
            <UrlField
              icon={<Code className="w-4 h-4" />}
              label="GitHub URL"
              required
              placeholder="https://github.com/username"
              value={form.githubUrl}
              onChange={(value) =>
                setForm({ ...form, githubUrl: value })
              }
              error={fieldErrors.githubUrl}
              preview={
                githubUsername ? `Username: @${githubUsername}` : undefined
              }
              prefix="github.com/"
            />

            <UrlField
              icon={<Globe className="w-4 h-4" />}
              label="Portfolio URL"
              placeholder="https://yourname.com"
              value={form.portfolioUrl}
              onChange={(value) =>
                setForm({ ...form, portfolioUrl: value })
              }
              error={fieldErrors.portfolioUrl}
              helper="Optional &middot; personal site, blog, or case studies"
            />

            <UrlField
              icon={<BriefcaseBusiness className="w-4 h-4" />}
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/username"
              value={form.linkedinUrl}
              onChange={(value) =>
                setForm({ ...form, linkedinUrl: value })
              }
              error={fieldErrors.linkedinUrl}
              preview={
                linkedinHandle ? `Profile: /in/${linkedinHandle}` : undefined
              }
              helper="Optional &middot; used to verify employment timeline"
            />

            <div>
              <label className="block text-[10px] font-mono text-[#8b949e] mb-2 tracking-wider">
                NOTES
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                placeholder="Referred by Jane. Strong React background. Reach out before 5pm PT..."
                rows={4}
                className="w-full bg-[#0a0e14] border border-[#27272a] px-3 py-2 text-xs font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green resize-y"
              />
              <div className="mt-1.5 text-[10px] font-mono text-[#3f3f46]">
                Optional &middot; context shown alongside the brief
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="border-l-2 border-terminal-green pl-4">
            <h2 className="text-sm font-mono text-terminal-green mb-1">
              STEP 3: REVIEW &amp; ANALYZE
            </h2>
            <p className="text-xs font-mono text-[#8b949e]">
              Confirm details. Analysis runs in the background once kicked off.
            </p>
          </div>

          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-4">
            <div className="text-[10px] font-mono text-[#8b949e] tracking-wider">
              CANDIDATE
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-[#8b949e] mb-2 tracking-wider">
                  NAME
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Jane Doe"
                  className={cn(
                    'w-full bg-[#0a0e14] border px-3 py-2 text-xs font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green',
                    fieldErrors.name
                      ? 'border-terminal-red'
                      : 'border-[#27272a]'
                  )}
                />
                {fieldErrors.name && (
                  <div className="mt-1 text-[10px] font-mono text-terminal-red">
                    {fieldErrors.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#8b949e] mb-2 tracking-wider">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="jane@example.com"
                  className={cn(
                    'w-full bg-[#0a0e14] border px-3 py-2 text-xs font-mono text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-terminal-green',
                    fieldErrors.email
                      ? 'border-terminal-red'
                      : 'border-[#27272a]'
                  )}
                />
                {fieldErrors.email && (
                  <div className="mt-1 text-[10px] font-mono text-terminal-red">
                    {fieldErrors.email}
                  </div>
                )}
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#3f3f46]">
              Auto-extracted from resume &middot; edit if incorrect
            </div>
          </div>

          <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-5">
            <div className="text-[10px] font-mono text-[#8b949e] tracking-wider">
              ANALYSIS INPUTS
            </div>

            <SummaryRow
              icon={<FileText className="w-4 h-4 text-terminal-green" />}
              label="RESUME"
              value={uploaded?.filename ?? file?.name ?? '—'}
              suffix={uploaded ? formatBytes(uploaded.size) : undefined}
            />
            <SummaryRow
              icon={<Code className="w-4 h-4 text-terminal-green" />}
              label="GITHUB"
              value={githubUsername ? `@${githubUsername}` : form.githubUrl}
              link={form.githubUrl}
            />
            {form.portfolioUrl && (
              <SummaryRow
                icon={<Globe className="w-4 h-4 text-terminal-amber" />}
                label="PORTFOLIO"
                value={form.portfolioUrl}
                link={form.portfolioUrl}
              />
            )}
            {form.linkedinUrl && (
              <SummaryRow
                icon={<BriefcaseBusiness className="w-4 h-4 text-terminal-amber" />}
                label="LINKEDIN"
                value={
                  linkedinHandle ? `/in/${linkedinHandle}` : form.linkedinUrl
                }
                link={form.linkedinUrl}
              />
            )}
            {form.notes && (
              <div className="pt-4 border-t border-[#1a1a1f]">
                <div className="text-[10px] font-mono text-[#8b949e] tracking-wider mb-2">
                  NOTES
                </div>
                <div className="text-xs font-mono text-[#e6edf3] whitespace-pre-wrap leading-relaxed">
                  {form.notes}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#1a1a1f] border border-[#1a1a1f]">
            <div className="bg-[#0a0e14] px-5 py-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#8b949e] tracking-wider mb-2">
                <DollarSign className="w-3 h-3" />
                ESTIMATED COST
              </div>
              <div className="text-xl font-mono text-terminal-green tabular-nums">
                ~$0.10
              </div>
              <div className="text-[10px] font-mono text-[#3f3f46] mt-1">
                Full evidence verification
              </div>
            </div>
            <div className="bg-[#0a0e14] px-5 py-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#8b949e] tracking-wider mb-2">
                <Clock className="w-3 h-3" />
                ESTIMATED TIME
              </div>
              <div className="text-xl font-mono text-terminal-amber tabular-nums">
                ~2-3 min
              </div>
              <div className="text-[10px] font-mono text-[#3f3f46] mt-1">
                Runs in background
              </div>
            </div>
          </div>

          {submitError && (
            <div className="flex items-start gap-3 border border-terminal-red/30 bg-terminal-red/5 p-4">
              <AlertCircle className="w-4 h-4 text-terminal-red shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-terminal-red">
                {submitError}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-[#1a1a1f]">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep((step - 1) as Step)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 && (
          <Button
            disabled={!stepCanContinue}
            onClick={() => {
              if (step === 2 && !validateStep2()) return;
              setStep((step + 1) as Step);
            }}
          >
            Continue
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        )}

        {step === 3 && (
          <Button onClick={handleStartAnalysis} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

interface UrlFieldProps {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  preview?: string;
  helper?: string;
  prefix?: string;
}

function UrlField({
  icon,
  label,
  required,
  placeholder,
  value,
  onChange,
  error,
  preview,
  helper,
  prefix,
}: UrlFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10px] font-mono text-[#8b949e] mb-2 tracking-wider">
        <span className="text-terminal-green">{icon}</span>
        {label}
        {required && <span className="text-terminal-red">*</span>}
      </label>
      <div
        className={cn(
          'flex items-center bg-[#0a0e14] border focus-within:ring-1 focus-within:ring-terminal-green',
          error ? 'border-terminal-red' : 'border-[#27272a]'
        )}
      >
        {prefix && (
          <span className="px-3 text-[10px] font-mono text-[#3f3f46] border-r border-[#1a1a1f] py-2 select-none">
            {prefix}
          </span>
        )}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-[#e6edf3] focus:outline-none"
        />
      </div>
      {preview && !error && (
        <div className="mt-1.5 text-[10px] font-mono text-terminal-green">
          {preview}
        </div>
      )}
      {error && (
        <div className="mt-1.5 text-[10px] font-mono text-terminal-red">
          {error}
        </div>
      )}
      {helper && !error && !preview && (
        <div
          className="mt-1.5 text-[10px] font-mono text-[#3f3f46]"
          dangerouslySetInnerHTML={{ __html: helper }}
        />
      )}
    </div>
  );
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  link?: string;
}

function SummaryRow({ icon, label, value, suffix, link }: SummaryRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 border border-[#27272a] bg-[#0a0e14] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono text-[#8b949e] tracking-wider">
          {label}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="text-xs font-mono text-[#e6edf3] truncate">
            {value}
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="text-[#8b949e] hover:text-terminal-green shrink-0"
              aria-label="Open link"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {suffix && (
        <div className="text-[10px] font-mono text-[#8b949e] tabular-nums shrink-0">
          {suffix}
        </div>
      )}
    </div>
  );
}
