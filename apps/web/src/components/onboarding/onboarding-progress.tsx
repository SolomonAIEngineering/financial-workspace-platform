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
            {/* Step indicators */}
            <div className="flex justify-between mb-1">
                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
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

            {/* Connecting lines between steps - improved with active step progress */}
            <div className="relative mt-4">
                {/* Background track */}
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200 rounded-full"></div>
                </div>

                {/* Progress overlay */}
                <div className="relative flex h-0.5">
                    {steps.map((step, index) => {
                        // Skip rendering for the last step since there's no line after it
                        if (index === steps.length - 1) return null;

                        const nextStep = steps[index + 1];

                        // This line connects current step to next step
                        const isCompletedLine = step.id < currentStep;
                        const isActiveLine = step.id === currentStep;
                        const lineWidth = `${100 / (steps.length - 1)}%`;

                        if (isCompletedLine) {
                            // Completed line segment
                            return (
                                <div
                                    key={`line-${step.id}`}
                                    className="bg-primary rounded-full transition-all duration-500"
                                    style={{ width: lineWidth }}
                                />
                            );
                        } else if (isActiveLine) {
                            // Active line segment with partial progress
                            return (
                                <div
                                    key={`line-${step.id}`}
                                    className="rounded-full transition-all duration-500 relative"
                                    style={{ width: lineWidth }}
                                >
                                    <div
                                        className="absolute h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            );
                        } else {
                            // Inactive line segment
                            return (
                                <div
                                    key={`line-${step.id}`}
                                    className="rounded-full"
                                    style={{ width: lineWidth }}
                                />
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}