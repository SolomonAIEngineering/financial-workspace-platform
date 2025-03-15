import { CheckIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
    currentStep: number;
    progress?: number; // Progress percentage for current step (0-100)
}

const steps = [
    { id: 1, name: 'Create Team', description: 'Set up your organization' },
    { id: 2, name: 'Complete Profile', description: 'Add your personal details' },
    { id: 3, name: 'Connect Bank', description: 'Link your financial accounts' },
    { id: 4, name: 'Complete', description: 'Start using the platform' },
];

export function OnboardingProgress({
    currentStep,
    progress = 50, // Default to 50% if not specified
}: OnboardingProgressProps) {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                        isCurrent ? "bg-white border-primary text-primary" :
                                            "bg-white border-gray-300 text-gray-500"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckIcon className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-medium">
                                        {step.id}
                                    </span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "mt-2 text-sm font-medium",
                                    isCompleted ? "text-primary" :
                                        isCurrent ? "text-primary" :
                                            "text-gray-500"
                                )}
                            >
                                {step.name}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {step.description}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress bar for current step */}
            {steps.map((step) => {
                const isCurrent = step.id === currentStep;

                if (isCurrent) {
                    return (
                        <div key={`progress-${step.id}`} className="mt-2 px-4 w-full">
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    );
                }
                return null;
            })}

            {/* Connecting lines between steps */}
            <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                </div>
                <div className="relative flex">
                    {steps.map((step, index) => {
                        const isCompleted = step.id < currentStep;
                        const isLast = index === steps.length - 1;

                        if (isLast) return null;

                        return (
                            <div
                                key={`line-${step.id}`}
                                className={cn(
                                    "h-0.5 flex-1",
                                    isCompleted ? "bg-primary" : "bg-gray-200"
                                )}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}