import { z } from 'zod';

const githubUrlRegex = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/;
const linkedinUrlRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9._%-]+\/?$/;

const optionalUrl = (schema: z.ZodString) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

export const createJobSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(100, 'Description must be at least 100 characters'),
  rubric: z.record(z.string(), z.unknown()).optional(),
});

export const createCandidateSchema = z.object({
  jobId: z.string().uuid('A valid jobId is required'),
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('A valid email is required'),
  resumeText: z.string().optional(),
  resumeUrl: optionalUrl(z.string().url('Resume URL must be a valid URL')),
  githubUrl: optionalUrl(
    z.string().regex(githubUrlRegex, 'GitHub URL must be a valid profile URL')
  ),
  portfolioUrl: optionalUrl(z.string().url('Portfolio URL must be a valid URL')),
  linkedinUrl: optionalUrl(
    z.string().regex(linkedinUrlRegex, 'LinkedIn URL must be a valid profile URL')
  ),
  notes: z.string().optional(),
});

const maxUploadSizeBytes = 10 * 1024 * 1024;
const allowedUploadTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export const uploadSchema = z.object({
  file: z
    .custom<File>(
      (file) => typeof File !== 'undefined' && file instanceof File,
      'A file is required'
    )
    .refine((file) => file.size > 0, 'File cannot be empty')
    .refine(
      (file) => file.size <= maxUploadSizeBytes,
      'File must be 10MB or smaller'
    )
    .refine(
      (file) => allowedUploadTypes.has(file.type),
      'File must be a PDF, DOCX, or text file'
    ),
});

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;

  return Object.fromEntries(
    Object.entries(flattened)
      .filter(([, messages]) => messages?.[0])
      .map(([field, messages]) => [field, messages?.[0] ?? 'Invalid value'])
  );
}
