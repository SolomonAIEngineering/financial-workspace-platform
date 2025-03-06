import { cn } from '@udecode/cn';
import { Cuboid } from 'lucide-react';

import { LoginForm } from '@/components/auth/login-form';
import { Icons } from '@/components/ui/icons';

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-30" />
        <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-64 w-64 rounded-full bg-blue-50/70 blur-2xl" />
        {/* Additional subtle blue patterns */}
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-200/20 blur-2xl" />
        <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-sky-100/30 blur-2xl" />
        <div className="absolute h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent" />
      </div>

      <main className="relative container mx-auto px-6 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center justify-center space-y-12">
          {/* Logo with enhanced glass effect */}
          <div className="rounded-2xl bg-white/40 p-4 shadow-sm ring-1 ring-blue-100/50 backdrop-blur-sm">
            <Icons.logo className={cn('h-12 w-12 text-blue-600')} />
          </div>

          <div className="flex flex-col items-center space-y-8 text-center">
            {/* Welcome badge with enhanced glass effect */}
            <div className="inline-flex items-center gap-x-2 rounded-full bg-white/50 px-5 py-1.5 text-sm font-medium text-blue-900 shadow-sm ring-1 ring-blue-100/70 backdrop-blur-sm">
              <span className="font-medium text-blue-600">Solomon AI</span>{' '}
              Financial Management Platform
              <Cuboid className="h-3.5 w-3.5 text-blue-600" />
            </div>

            <div className="space-y-5">
              <h1 className="text-3xl font-semibold tracking-tight text-blue-950 sm:text-4xl md:text-5xl">
                Financial oversight with
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  {' '}
                  clarity
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
                Take control of your business finances. Get real-time insights,
                optimize cash flow, and make data-driven decisions with our
                intelligent financial management platform designed specifically
                for small businesses and solopreneurs.
              </p>
            </div>
          </div>

          {/* Login form with enhanced glass effect */}
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/50 p-8 shadow-md ring-1 ring-blue-100/50 backdrop-blur-md">
            <LoginForm displayLogo={false} displayTitle={false} />
          </div>

          {/* Footer text with enhanced glass effect */}
          <div className="flex flex-col items-center gap-y-3">
            <div className="flex items-center gap-x-3">
              <div className="h-px w-12 bg-blue-200/50" />
              <div className="rounded-full bg-white/40 px-5 py-1.5 text-xs font-medium text-blue-800 shadow-sm ring-1 ring-blue-100/50 backdrop-blur-sm">
                Insightful · Actionable · Empowering
              </div>
              <div className="h-px w-12 bg-blue-200/50" />
            </div>
            <p className="mt-1 text-xs font-medium text-blue-600/80">
              Trusted by solopreneurs and small businesses nationwide
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
