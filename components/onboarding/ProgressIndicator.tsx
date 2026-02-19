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
        <div className="w-full max-w-md mx-auto mb-12 px-4">
            {/* Progress Bar */}
            <div className="relative h-1 bg-hover rounded-full overflow-hidden mb-6">
                <div
                    className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>

            {/* Step Labels */}
            <div className="flex justify-between">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center"
                    >
                        {/* Step Number */}
                        <div
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center mb-2
                                text-sm font-medium transition-all duration-300
                                ${index < currentStep
                                    ? "bg-accent text-white"
                                    : index === currentStep
                                        ? "bg-accent text-white"
                                        : "bg-hover text-tertiary"
                                }
                            `}
                        >
                            {index < currentStep ? (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>

                        {/* Step Label */}
                        <span
                            className={`
                                text-xs font-medium text-center transition-colors duration-300
                                ${index <= currentStep ? "text-primary" : "text-tertiary"}
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
