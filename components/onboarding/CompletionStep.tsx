"use client";

interface CompletionStepProps {
    userName: string;
    role: string;
    onComplete: () => void;
}

export default function CompletionStep({
    userName,
    role,
    onComplete,
}: CompletionStepProps) {
    const getRoleTitle = () => {
        switch (role) {
            case "buyer":
                return "Buyer / Tenant";
            case "owner":
                return "Property Owner";
            case "agent":
                return "Agent / Broker";
            case "builder":
                return "Builder / Developer";
            default:
                return "User";
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[480px] text-center px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-success/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
            </div>

            {/* Success Icon */}
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-success/20 rounded-full blur-xl scale-150" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg shadow-success/30">
                    <svg
                        className="w-12 h-12 text-white animate-check"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Success Message */}
            <div className="relative space-y-4 mb-10">
                <h1 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">
                    You&apos;re all set!
                </h1>
                <p className="text-lg text-secondary max-w-md">
                    Welcome aboard, <span className="font-semibold text-accent">{userName}</span>
                </p>
            </div>

            {/* Role Badge */}
            <div className="relative mb-12">
                <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card border border-border text-primary text-sm font-medium shadow-sm">
                    <span className="flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                    </span>
                    {getRoleTitle()}
                </span>
            </div>

            {/* CTA Button */}
            <button
                onClick={onComplete}
                className="
                    group inline-flex items-center gap-3 px-8 py-4
                    bg-gradient-to-r from-accent to-accent-hover text-white rounded-full font-medium
                    transition-all duration-300
                    hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02]
                    active:scale-[0.98]
                "
            >
                Start Exploring
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

            {/* Subtle accent */}
            <p className="relative mt-16 text-sm text-secondary">
                Ready to discover amazing properties
            </p>
        </div>
    );
}
