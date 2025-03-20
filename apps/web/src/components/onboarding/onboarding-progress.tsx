import { CheckIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  progress?: number; // Progress percentage for current step (0-100)
}

const steps = [
  { id: 1, name: 'Create Team', description: 'Set up your organization' },
  // { id: 2, name: 'Complete Profile', description: 'Add your personal details' },
  { id: 2, name: 'Connect Bank', description: 'Link your financial accounts' },
  { id: 3, name: 'Complete', description: 'Start using the platform' },
];

export function OnboardingProgress({
  currentStep,
  progress = 50, // Default to 50% if not specified
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Step indicators - minimalist design */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center',
                isPending && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border transition-all',
                  isCompleted
                    ? 'border-primary bg-primary text-white'
                    : isCurrent
                      ? 'border-primary bg-white text-primary'
                      : 'border-gray-200 bg-white text-gray-400'
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              {/* Only show name for current and completed steps */}
              {(isCurrent || isCompleted) && (
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCompleted || isCurrent ? 'text-primary' : 'text-gray-400'
                  )}
                >
                  {step.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Connecting lines - minimalist version */}
      <div className="relative mt-4">
        {/* Background track */}
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="h-0.5 w-full bg-gray-100"></div>
        </div>

        {/* Progress overlay */}
        <div className="relative flex h-0.5">
          {steps.map((step, index) => {
            // Skip rendering for the last step since there's no line after it
            if (index === steps.length - 1) return null;

            // Calculate segment width
            const lineWidth = `${100 / (steps.length - 1)}%`;

            // Determine if this line segment is completed or active
            const isCompletedLine = currentStep > step.id;
            const isActiveLine = currentStep === step.id;

            if (isCompletedLine) {
              // Completed line segment
              return (
                <div
                  key={`line-${step.id}`}
                  className="h-full bg-primary transition-all"
                  style={{ width: lineWidth }}
                />
              );
            } else if (isActiveLine) {
              // Active line segment with partial progress
              return (
                <div
                  key={`line-${step.id}`}
                  className="relative h-full transition-all"
                  style={{ width: lineWidth }}
                >
                  <div
                    className="absolute h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              );
            } else {
              // Inactive line segment
              return (
                <div
                  key={`line-${step.id}`}
                  className="h-full bg-transparent"
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
