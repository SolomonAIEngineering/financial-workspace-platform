import { Cuboid } from 'lucide-react';
import { Icons } from '@/components/ui/icons';
import { LoginForm } from '@/components/auth/login-form';
import { cn } from '@udecode/cn';

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-zinc-50">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-40" />
        <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-64 w-64 rounded-full bg-zinc-100/50 blur-2xl" />
      </div>

      <main className="relative container mx-auto px-6 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center justify-center space-y-10">
          {/* Logo with glass effect */}
          <div className="rounded-2xl bg-white/30 p-4 ring-1 ring-zinc-100 backdrop-blur-sm">
            <Icons.logo className={cn('h-12 w-12')} />
          </div>

          <div className="flex flex-col items-center space-y-8 text-center">
            {/* Welcome badge with glass effect */}
            <div className="inline-flex items-center gap-x-2 rounded-full bg-white/40 px-5 py-1.5 text-sm font-medium text-zinc-800 ring-1 ring-zinc-100 backdrop-blur-sm">
              Welcome to Solomon AI Financial Management Platform
              <Cuboid className="h-3.5 w-3.5" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
                Financial oversight with
                <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
                  {' '}
                  clarity
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                Take control of your business finances. Get real-time insights, optimize cash flow, and make data-driven decisions with our intelligent financial management platform designed specifically for small businesses and solopreneurs.
              </p>
            </div>
          </div>

          {/* Login form with glass effect */}
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/50 p-8 ring-1 ring-zinc-100 backdrop-blur-md">
            <LoginForm displayLogo={false} displayTitle={false} />
          </div>

          {/* Footer text with glass effect */}
          <div className="flex items-center gap-x-3">
            <div className="h-px w-8 bg-zinc-200/50" />
            <div className="rounded-full bg-white/30 px-4 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-100 backdrop-blur-sm">
              Insightful · Actionable · Empowering
            </div>
            <div className="h-px w-8 bg-zinc-200/50" />
          </div>
        </div>
      </main>
    </div>
  );
}
