import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full border border-gray-200 bg-white rounded-lg p-8 shadow-sm">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-gray-300" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              404
            </h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Page not found
          </h2>

          <p className="text-gray-600 mb-8" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-center"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              Go to dashboard
            </Link>

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
