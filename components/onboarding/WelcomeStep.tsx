"use client";

interface WelcomeStepProps {
    userName: string;
    onNext: () => void;
}

export default function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-[480px] text-center px-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 rounded-3xl pointer-events-none" />

            {/* Icon with glow effect */}
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/30">
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
            <div className="relative space-y-4 mb-10">
                <p className="text-sm font-medium tracking-widest text-tertiary uppercase">
                    Welcome to
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">
                    <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                        Easeyourestate
                    </span>{" "}
                    Properties
                </h1>
                {userName && (
                    <p className="text-lg text-secondary">
                        Hello, <span className="font-medium text-accent">{userName}</span>
                    </p>
                )}
            </div>

            {/* CTA Button */}
            <button
                onClick={onNext}
                className="
                    group inline-flex items-center gap-3 px-8 py-4
                    bg-gradient-to-r from-accent to-accent-hover text-white rounded-full font-medium
                    transition-all duration-300
                    hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02]
                    active:scale-[0.98]
                "
            >
                Get Started
                <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
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

            {/* Subtle accent dots */}
            <div className="mt-16 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent/30" />
                <div className="w-2 h-2 rounded-full bg-accent/50" />
                <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
        </div>
    );
}
