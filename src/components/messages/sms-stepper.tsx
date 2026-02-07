"use client";

import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface SMSStepperProps {
  currentStep: number;
  steps: Step[];
}

export function SMSStepper({ currentStep, steps }: SMSStepperProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-12">
        {/* Background Track */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-wood-light/30" />

        {/* Active Progress */}
        <div
          className="absolute top-6 left-0 h-1 bg-amber-glow transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isComplete = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isUpcoming = step.number > currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    relative flex h-12 w-12 items-center justify-center rounded-full border-4 font-heading font-bold text-lg
                    transition-all duration-300
                    ${
                      isComplete
                        ? "bg-amber-glow border-amber-glow text-wood-dark shadow-lg glow-amber"
                        : isCurrent
                        ? "bg-cream border-amber-glow text-amber-dim shadow-lg animate-pulse-glow"
                        : "bg-tan/50 border-wood-light/50 text-smoke/60"
                    }
                  `}
                >
                  {isComplete ? (
                    <Check className="h-6 w-6 stroke-[3]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-4 text-center max-w-[140px]">
                  <p
                    className={`
                      font-heading font-bold text-sm uppercase tracking-wider mb-1
                      ${isCurrent ? "text-amber-dim" : isComplete ? "text-charcoal" : "text-smoke/60"}
                    `}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`
                      font-body text-xs
                      ${isCurrent || isComplete ? "text-smoke" : "text-smoke/40"}
                    `}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
