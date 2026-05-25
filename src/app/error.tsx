'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [errorId, setErrorId] = useState<string>('');

  useEffect(() => {
    // Generate unique error ID for tracking
    const id = uuidv4();
    setErrorId(id);

    // Log error with ID for support reference
    console.error('Error occurred:', {
      errorId: id,
      message: error.message,
      digest: error.digest,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full border border-gray-200 bg-white rounded-lg p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Something went wrong
          </h1>

          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            We encountered an unexpected error. Our team has been notified.
          </p>

          {errorId && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-6">
              <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Error ID (for support reference):
              </p>
              <code className="text-sm font-mono text-gray-700">{errorId}</code>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              Try again
            </button>

            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors text-center"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
