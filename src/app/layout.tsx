import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = {
  title: {
    default: 'DeepHire',
    template: '%s | DeepHire',
  },
  description: 'Hire engineers who actually ship with AI-powered evidence verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
