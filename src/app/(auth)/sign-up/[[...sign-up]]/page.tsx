import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="flex flex-col justify-between px-8 py-10 sm:px-12 lg:px-16">
          <div className="text-xl font-semibold tracking-tight">
            Deep<span className="text-blue-400">Hire</span>
          </div>

          <div className="max-w-xl py-16">
            <p className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200">
              Evidence-first technical recruiting
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Hire engineers who actually ship
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              DeepHire verifies candidate claims against public work, shipped projects,
              and source evidence so hiring teams can focus interviews on what matters.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Built for modern engineering teams that value proof over polish.
          </p>
        </section>

        <section className="flex items-center justify-center bg-slate-900 px-6 py-12 lg:rounded-l-[2rem]">
          <div className="w-full max-w-md">
            <SignUp
              appearance={{
                variables: {
                  colorPrimary: '#60a5fa',
                  colorBackground: '#0f172a',
                  colorInputBackground: '#1e293b',
                  colorInputText: '#f8fafc',
                  colorText: '#f8fafc',
                  colorTextSecondary: '#cbd5e1',
                },
                elements: {
                  rootBox: 'mx-auto',
                  cardBox: 'border border-slate-700 shadow-2xl',
                },
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
