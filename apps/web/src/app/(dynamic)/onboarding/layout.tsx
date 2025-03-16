import Image from 'next/image';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { ReactNode } from 'react';
import { trpc } from '@/trpc/server';

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  // Get authentication state
  const currentUser = (await trpc.layout.app()).currentUser;

  // Calculate current step based on user data
  let currentStep = 1;

  if (currentUser?.teamId) {
    currentStep = 2;
  }

  if (currentUser?.name && currentUser?.email && currentUser?.profileImageUrl) {
    currentStep = 3;
  }

  if (
    currentUser?.teamId &&
    currentUser?.name &&
    currentUser?.email &&
    currentUser?.profileImageUrl &&
    currentUser?.bankConnections &&
    currentUser?.bankConnections.length > 0
  ) {
    currentStep = 4;
  }

  return (
    <div className="font-base flex min-h-screen w-full tracking-tight">
      {/* Left Content Panel */}
      <div className="flex w-full items-center justify-center bg-white/95 md:w-1/2">
        <div className="mx-auto w-full max-w-2xl md:p-[2.5%]">
          <div className="flex flex-col space-y-10">
            {/* Logo and Title */}
            <div className="flex flex-col space-y-6">
              <Image
                src="https://assets.solomon-ai.app/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="rounded-2xl border-2 border-gray-50 p-2 dark:border-gray-900"
              />
              <div>
                <h1 className="text-2xl font-medium text-gray-900">
                  Get Started
                </h1>
                <p className="mt-1 text-gray-500">
                  Welcome to our platform - Let's set up your account
                </p>
              </div>
            </div>

            {/* Progress Bar - subtle and minimal */}
            <div className="px-1">
              <OnboardingProgress currentStep={currentStep} />
            </div>

            {/* Main Content/Form */}
            <div className="rounded-xl bg-white">{children}</div>

            {/* Footer Help Link */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Need help?{' '}
                <a
                  href="mailto:support@solomon-ai.app"
                  className="text-primary transition-colors hover:text-primary/80"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Visual Panel */}
      <div className="relative hidden overflow-hidden bg-black md:flex md:w-1/2">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
          <div className="max-w-3xl space-y-6">
            {/* Title */}
            <div className="space-y-6">
              <h2 className="font-base text-5xl tracking-tight">
                Your Complete
                <br />
                Financial Workspace
              </h2>
              <h2 className="font-base text-5xl tracking-tight">
                Where Human Teams &<br />
                Digital Agents Unite
              </h2>
              <p className="mt-4 text-xl font-light">
                Streamline operations, enhance decision-making,
                <br />
                and drive financial excellence through seamless collaboration.
              </p>
            </div>
          </div>
        </div>

        {/* Background gradient effect */}
        <div className="bg-gradient-radial absolute inset-0 from-[#164b31] to-[#0a2c1c] opacity-80"></div>
      </div>
    </div>
  );
}
