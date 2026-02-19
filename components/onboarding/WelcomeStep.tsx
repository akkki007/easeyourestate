"use client";

interface WelcomeStepProps {
    userName: string;
    onNext: () => void;
}

export default function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[480px] text-center px-4">
            {/* Minimal Icon */}
            <div className="mb-10">
                <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
                    <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-4 mb-10">
                <p className="text-sm font-medium tracking-widest text-tertiary uppercase">
                    Welcome to
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">
                    easeyourestate Properties
                </h1>
                {userName && (
                    <p className="text-lg text-secondary">
                        Hello, <span className="font-medium text-primary">{userName}</span>
                    </p>
                )}
            </div>

            <p className="text-base text-secondary max-w-md mb-12 leading-relaxed">
                Let's personalize your experience. This will only take a moment.
            </p>

            {/* CTA Button */}
            <button
                onClick={onNext}
                className="
                    group inline-flex items-center gap-3 px-8 py-4
                    bg-accent text-white rounded-full font-medium
                    transition-all duration-200
                    hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/20
                    active:scale-[0.98]
                "
            >
                Get Started
                <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Subtle accent line */}
            <div className="mt-16 w-12 h-px bg-border" />
        </div>
    );
}
