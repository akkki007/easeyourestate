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
        <div className="flex flex-col items-center justify-center min-h-[480px] text-center px-4">
            {/* Success Icon */}
            <div className="mb-10">
                <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-white"
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
            <div className="space-y-4 mb-10">
                <h1 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">
                    You're all set
                </h1>
                <p className="text-lg text-secondary max-w-md">
                    Welcome aboard, <span className="font-medium text-primary">{userName}</span>
                </p>
            </div>

            {/* Role Badge */}
            <div className="mb-12">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hover text-secondary text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {getRoleTitle()}
                </span>
            </div>

            {/* CTA Button */}
            <button
                onClick={onComplete}
                className="
                    group inline-flex items-center gap-3 px-8 py-4
                    bg-accent text-white rounded-full font-medium
                    transition-all duration-200
                    hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/20
                    active:scale-[0.98]
                "
            >
                Start Exploring
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

            {/* Subtle accent */}
            <p className="mt-16 text-sm text-tertiary">
                Ready to discover amazing properties
            </p>
        </div>
    );
}
