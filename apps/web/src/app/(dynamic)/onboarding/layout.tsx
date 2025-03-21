import Image from 'next/image';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { trpc } from '@/trpc/server';

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  // Get authentication state
  const currentUser = (await trpc.layout.app()).currentUser;

  // get the cookies
  // Get the onboarding-bank-skipped cookie value
  const cookieStore = await cookies();
  const hasBankSkipped =
    cookieStore.get('onboarding-bank-skipped')?.value === 'true';

  // Calculate current step based on user data
  const currentStep = calculateOnboardingStep(currentUser, hasBankSkipped);

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans antialiased">
      {/* Left Content Panel */}
      <div className="flex w-full items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-300 md:w-1/2">
        <div className="flex h-full w-full max-w-3xl flex-col justify-between p-6 md:p-8">
          {/* Top Section with Logo and Header */}
          <div className="flex flex-col">
            {/* Logo and Title */}
            <header className="mb-6 flex flex-col space-y-4">
              <Image
                src="https://assets.solomon-ai.app/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="rounded-xl border-4 border-gray-50 p-2 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-900"
              />
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Get Started
                </h1>
                <p className="text-base text-gray-500">
                  Welcome to our platform — Let's set up your account
                </p>
              </div>
            </header>

            {/* Progress Bar */}
            <OnboardingProgress currentStep={currentStep} />
          </div>

          {/* Main Content Area - Flexibly sized */}
          <div className="my-4 flex-1 overflow-auto py-2">
            <div className="h-full rounded-xl bg-white transition-all duration-300">
              {children}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto text-center text-sm text-gray-500">
            <p>
              Need help?{' '}
              <a
                href="mailto:support@solomon-ai.app"
                className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                Contact support
              </a>
            </p>
          </footer>
        </div>
      </div>

      {/* Right Visual Panel */}
      <div className="relative hidden overflow-hidden bg-black transition-all duration-300 md:flex md:w-1/2">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
          <div className="max-w-3xl opacity-95">
            {/* Branded Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
              <Image
                src="https://assets.solomon-ai.app/logo.png"
                alt="Brand Icon"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>

            {/* Title and Descriptions with animation classes */}
            <div className="space-y-6">
              <h2 className="font-display text-4xl leading-tight font-bold tracking-tight">
                Your Complete
                <br />
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Financial Workspace
                </span>
              </h2>
              <h3 className="text-3xl leading-tight font-medium tracking-tight">
                Where Human Teams &
                <br />
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Digital Agents Unite
                </span>
              </h3>
              <p className="mt-4 text-lg leading-relaxed font-light text-white/90">
                Streamline operations, enhance decision-making,
                <br />
                and drive financial excellence through seamless collaboration.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced background gradient with animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/mesh-gradient.svg')] bg-cover bg-center opacity-20 mix-blend-soft-light"></div>
        <div className="absolute right-0 bottom-0 left-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
    </div>
  );
}

// Helper function to calculate current onboarding step
function calculateOnboardingStep(currentUser: any, hasBankSkipped: boolean) {
  if (!currentUser) return 1;

  const hasTeam = Boolean(currentUser.teamId);
  if (!hasTeam) return 1; // Needs team creation

  const hasBankConnection = currentUser.bankConnections?.length > 0;
  if (hasBankConnection || hasBankSkipped) return 3; // All steps completed

  return 2; // Has team but needs bank connection
}
