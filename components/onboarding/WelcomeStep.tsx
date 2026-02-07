"use client";

interface WelcomeStepProps {
    userName: string;
    onNext: () => void;
}

export default function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center animate-fade-in">
            {/* Animated Logo/Icon */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-primary to-purple-500 rounded-full p-8">
                    <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </div>
            </div>

            {/* Welcome Text */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Welcome to Wisteria Properties
                {userName && (
                    <span className="block text-primary mt-2">{userName}!</span>
                )}
            </h1>

            <p className="text-lg md:text-xl text-grey-40 max-w-2xl mb-12 leading-relaxed">
                Let's get you set up in just a few steps. We'll personalize your
                experience to help you find exactly what you're looking for.
            </p>

            {/* CTA Button */}
            <button
                onClick={onNext}
                className="
          group relative px-8 py-4 bg-primary rounded-xl font-semibold text-lg
          transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(112,59,247,0.5)]
          overflow-hidden
        "
            >
                <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </span>

                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
