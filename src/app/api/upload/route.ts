import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadResumeToR2 } from '@/lib/r2';
import pdf from 'pdf-parse';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_MIME_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['.pdf'];

/**
 * POST /api/upload
 * Upload a PDF resume file to R2 storage
 * Requires authentication via Clerk
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to upload files' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing file - Please provide a file to upload' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large - Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type - Only PDF files are allowed',
          allowedTypes: ALLOWED_MIME_TYPES,
          providedType: file.type
        },
        { status: 400 }
      );
    }

    // Validate file extension
    const filename = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext));
    if (!hasValidExtension) {
      return NextResponse.json(
        {
          error: 'Invalid file extension - Only .pdf files are allowed',
          allowedExtensions: ALLOWED_EXTENSIONS,
          providedFilename: file.name
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    let extractedText = '';
    try {
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json(
        {
          error: 'Failed to parse PDF - File may be corrupted or password-protected',
          details: pdfError instanceof Error ? pdfError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Upload to R2
    const url = await uploadResumeToR2(buffer, userId, file.name);

    // Return success response
    return NextResponse.json({
      url,
      text: extractedText,
      filename: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('R2')) {
        return NextResponse.json(
          {
            error: 'Storage service error',
            details: error.message
          },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
