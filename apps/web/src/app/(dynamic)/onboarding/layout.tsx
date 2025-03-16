import Image from 'next/image';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { ReactNode } from 'react';
import { trpc } from '@/trpc/server';

interface OnboardingLayoutProps {
    children: ReactNode;
}

export default async function OnboardingLayout({ children }: OnboardingLayoutProps) {
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
        <div className="flex min-h-screen w-full font-base tracking-tight">
            {/* Left Content Panel */}
            <div className="w-full md:w-1/2 bg-white/95 flex items-center justify-center">
                <div className="w-full mx-auto max-w-2xl md:p-[2.5%]">
                    <div className="flex flex-col space-y-10">
                        {/* Logo and Title */}
                        <div className="flex flex-col space-y-6">
                            <Image
                                src="https://assets.solomon-ai.app/logo.png"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="border-2 border-gray-50 dark:border-gray-900 rounded-2xl p-2"
                            />
                            <div>
                                <h1 className="text-2xl font-medium text-gray-900">Get Started</h1>
                                <p className="text-gray-500 mt-1">Welcome to our platform - Let's set up your account</p>
                            </div>
                        </div>

                        {/* Progress Bar - subtle and minimal */}
                        <div className="px-1">
                            <OnboardingProgress currentStep={currentStep} />
                        </div>

                        {/* Main Content/Form */}
                        <div className="bg-white rounded-xl">
                            {children}
                        </div>

                        {/* Footer Help Link */}
                        <div className="text-center text-sm text-gray-500">
                            <p>Need help? <a href="mailto:support@solomon-ai.app" className="text-primary hover:text-primary/80 transition-colors">Contact support</a></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Visual Panel */}
            <div className="hidden md:flex md:w-1/2 bg-black relative overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-white z-10">

                    <div className="max-w-3xl space-y-6">
                        {/* Title */}
                        <div className="space-y-6">
                            <h2 className="text-5xl font-base tracking-tight">
                                Your Complete<br />
                                Financial Workspace
                            </h2>
                            <h2 className="text-5xl font-base tracking-tight">
                                Where Human Teams &<br />
                                Digital Agents Unite
                            </h2>
                            <p className="text-xl mt-4 font-light">
                                Streamline operations, enhance decision-making,<br />
                                and drive financial excellence through seamless collaboration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-radial from-[#164b31] to-[#0a2c1c] opacity-80"></div>
            </div>
        </div>
    );
} 