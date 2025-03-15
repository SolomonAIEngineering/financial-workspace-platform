import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';
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
        <div className="flex min-h-screen flex-col bg-gradient-to-b f items-center justify-center rom-background to-muted/30">
            <div className="container max-w-4xl py-8 md:py-12">
                <div className="mx-auto flex w-full flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <h1 className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                                Complete Your Setup
                            </h1>
                        </div>
                        <p className="text-muted-foreground max-w-xl">
                            Let's get your account set up so you can start managing your finances. Follow these simple steps to get started.
                        </p>
                    </div>

                    <OnboardingProgress currentStep={currentStep} />

                    <div className="rounded-xl border border-border/70 bg-card/50 p-8 shadow-sm backdrop-blur-sm">
                        {children}
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>Need help? Contact our support team at <span className="text-primary">support@example.com</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
} 