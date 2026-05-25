import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/**
 * Upload a file to R2 storage
 * @param file - File buffer to upload
 * @param key - S3 key (path) for the file
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload file to R2: ${message}`);
  }
}

/**
 * Upload a resume PDF to R2
 * @param file - PDF file buffer
 * @param candidateId - Unique candidate identifier
 * @param filename - Original filename
 * @returns Public URL of the uploaded resume
 */
export async function uploadResumeToR2(
  file: Buffer,
  candidateId: string,
  filename: string
): Promise<string> {
  const timestamp = Date.now();
  const key = `resumes/${candidateId}/${timestamp}-${filename}`;
  return uploadToR2(file, key, 'application/pdf');
}

/**
 * Upload a screenshot to R2
 * @param screenshot - PNG image buffer
 * @param packetId - Packet identifier
 * @param step - Step number in the verification process
 * @returns Public URL of the uploaded screenshot
 */
export async function uploadScreenshotToR2(
  screenshot: Buffer,
  packetId: string,
  step: number
): Promise<string> {
  const timestamp = Date.now();
  const key = `screenshots/${packetId}/step-${step}-${timestamp}.png`;
  return uploadToR2(screenshot, key, 'image/png');
}

/**
 * Generate a presigned URL for direct browser uploads
 * @param key - S3 key where the file will be uploaded
 * @param contentType - MIME type of the file to be uploaded
 * @param expiresInSeconds - URL expiration time in seconds
 * @returns Presigned upload URL
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate presigned URL: ${message}`);
  }
}

/**
 * Delete a file from R2
 * @param key - S3 key of the file to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete file from R2: ${message}`);
  }
}

/**
 * Extract S3 key from a full R2 URL
 * @param url - Full R2 public URL
 * @returns S3 key (path without domain)
 */
export function getR2KeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.slice(1);
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }
}
