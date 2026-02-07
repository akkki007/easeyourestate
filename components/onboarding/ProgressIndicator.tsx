"use client";

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
}

export default function ProgressIndicator({
    currentStep,
    totalSteps,
    steps,
}: ProgressIndicatorProps) {
    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            {/* Progress Bar */}
            <div className="relative h-1 bg-border-dark rounded-full overflow-hidden mb-8">
                <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-start">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-2 relative"
                        style={{ width: `${100 / totalSteps}%` }}
                    >
                        {/* Circle Indicator */}
                        <div
                            className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center
                transition-all duration-300 relative z-10
                ${index < currentStep
                                    ? "bg-primary border-primary"
                                    : index === currentStep
                                        ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(112,59,247,0.4)]"
                                        : "bg-card-dark border-border-dark"
                                }
              `}
                        >
                            {index < currentStep ? (
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span
                                    className={`text-sm font-medium ${index === currentStep ? "text-primary" : "text-grey-40"
                                        }`}
                                >
                                    {index + 1}
                                </span>
                            )}
                        </div>

                        {/* Step Label */}
                        <span
                            className={`
                text-xs font-medium text-center transition-colors duration-300
                ${index <= currentStep
                                    ? "text-white"
                                    : "text-grey-40"
                                }
              `}
                        >
                            {step}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
