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
                return "Buyer/Tenant";
            case "owner":
                return "Property Owner";
            case "agent":
                return "Agent/Broker";
            case "builder":
                return "Builder/Developer";
            default:
                return "User";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center animate-fade-in">
            {/* Success Animation */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-8 animate-scale-in">
                    <svg
                        className="w-16 h-16 text-white animate-check"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0B1E3A]">
                All Set, {userName}! 🎉
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-2">
                Your profile has been set up as a{" "}
                <span className="text-[#0066CC] font-semibold">{getRoleTitle()}</span>
            </p>

            <p className="text-lg text-slate-600 max-w-2xl mb-12">
                You're ready to explore amazing properties on Wisteria Properties
            </p>

            {/* CTA Button */}
            <button
                onClick={onComplete}
                className="
          group px-8 py-4 bg-[#0066CC] text-white rounded-lg font-semibold text-lg
          transition-all duration-300 hover:scale-105 hover:shadow-lg
        "
            >
                <span className="flex items-center gap-2">
                    Start Exploring
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
            </button>

            {/* Decorative Confetti Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#0066CC] rounded-full animate-float-1" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-float-2" />
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-[#7C5CFF] rounded-full animate-float-3" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-[#0066CC] rounded-full animate-float-1" />
            </div>
        </div>
    );
}
