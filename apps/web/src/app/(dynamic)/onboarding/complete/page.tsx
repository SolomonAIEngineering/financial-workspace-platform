import { ArrowRight, Cuboid } from 'lucide-react';
import { Button, LinkButton } from '@/registry/default/potion-ui/button';

import Image from 'next/image';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/navigation/routes';
import { trpc } from '@/trpc/server';

export default async function CompletePage() {
  const currentUser = (await trpc.layout.app()).currentUser;

  const hasProfile = Boolean(
    currentUser?.name && currentUser?.email && currentUser?.profileImageUrl
  );

  // If any required step is incomplete, redirect to the appropriate step
  if (!currentUser?.teamId) {
    redirect(routes.onboardingTeam());
  }

  if (!hasProfile) {
    redirect(routes.onboardingProfile());
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-white">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[5%] -left-[10%] h-64 w-64 rounded-full bg-slate-100 opacity-60 blur-3xl"></div>
        <div className="absolute top-[30%] -right-[20%] h-80 w-80 rounded-full bg-indigo-100 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[40%] h-40 w-40 rounded-full bg-sky-100 opacity-70 blur-2xl"></div>
        <div className="absolute -bottom-[5%] -left-[5%] h-60 w-60 rounded-full bg-slate-50 opacity-60 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center px-6 py-16 text-center">
        {/* Premium logo/icon container with animation */}
        <div className="absolute inset-0 -mx-1 -my-1 animate-pulse rounded-2xl bg-gradient-to-r from-slate-400/20 via-indigo-500/20 to-purple-500/20 blur-xl transition-all duration-700 group-hover:blur-xl"></div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-100 bg-white p-5 shadow-xl backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-indigo-50 opacity-50"></div>
          <Image
            src="https://assets.solomon-ai.app/logo.png"
            alt="Brand Icon"
            width={32}
            height={32}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Heading with enhanced typography */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <h1 className="rounded-2xl bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Setup Complete
        </h1>
        <p className="mx-auto max-w-md text-lg [line-height:1.6] font-light text-gray-600">
          Thank you for choosing Solomon AI as your financial management
          partner. Your premium experience awaits.
        </p>
      </div>

      {/* Actions with enhanced button styling */}
      <div className="mt-10 w-full max-w-sm space-y-4">
        <LinkButton
          href={routes.dashboard()}
          size="lg"
          variant="default"
          className="relative w-full overflow-hidden bg-gradient-to-r from-primary to-slate-600 py-6 text-lg font-medium tracking-wide shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl"
          icon={<ArrowRight className="ml-2 h-5 w-5" />}
          iconPlacement="right"
        >
          Go to Dashboard
        </LinkButton>
      </div>

      {/* Premium support contact with styled elements */}
      <div className="mt-14 flex items-center gap-2 rounded-full border border-gray-100 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-sm text-gray-600">
          For support, please contact:{' '}
          <span className="font-medium text-primary">
            support@solomonai.com
          </span>
        </p>
      </div>
    </div>
  );
}
