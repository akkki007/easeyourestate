"use client";

export type UserRole = "buyer" | "owner" | "agent" | "builder";

interface RoleSelectionProps {
    selectedRole: UserRole | null;
    onSelectRole: (role: UserRole) => void;
}

const roles = [
    {
        id: "buyer" as UserRole,
        title: "Buyer / Tenant",
        description: "Looking to buy or rent property",
        icon: (
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        id: "owner" as UserRole,
        title: "Property Owner",
        description: "List and manage properties",
        icon: (
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        id: "agent" as UserRole,
        title: "Agent / Broker",
        description: "Professional real estate services",
        icon: (
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: "builder" as UserRole,
        title: "Builder / Developer",
        description: "Promote projects and leads",
        icon: (
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
];

export default function RoleSelection({
    selectedRole,
    onSelectRole,
}: RoleSelectionProps) {
    return (
        <div className="w-full max-w-xl mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-primary tracking-tight mb-3">
                    What brings you here?
                </h2>
                <p className="text-secondary">
                    Select the option that best describes you
                </p>
            </div>

            <div className="space-y-3">
                {roles.map((role, index) => (
                    <button
                        key={role.id}
                        onClick={() => onSelectRole(role.id)}
                        style={{ animationDelay: `${index * 75}ms` }}
                        className={`
                            group w-full p-5 rounded-2xl border text-left
                            transition-all duration-300 animate-slide-up
                            ${selectedRole === role.id
                                ? "bg-gradient-to-r from-accent to-accent-hover border-accent shadow-lg shadow-accent/20"
                                : "bg-card border-border hover:border-accent/40 hover:bg-hover hover:shadow-md"
                            }
                        `}
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div
                                className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center
                                    transition-all duration-300
                                    ${selectedRole === role.id
                                        ? "bg-white/20 text-white"
                                        : "bg-accent/10 text-accent group-hover:bg-accent/20"
                                    }
                                `}
                            >
                                {role.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`
                                    font-medium text-base mb-0.5
                                    transition-colors duration-200
                                    ${selectedRole === role.id ? "text-white" : "text-primary"}
                                `}>
                                    {role.title}
                                </h3>
                                <p className={`
                                    text-sm transition-colors duration-200
                                    ${selectedRole === role.id ? "text-white/80" : "text-secondary"}
                                `}>
                                    {role.description}
                                </p>
                            </div>

                            {/* Indicator */}
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                transition-all duration-300
                                ${selectedRole === role.id
                                    ? "bg-white border-white scale-110"
                                    : "border-border group-hover:border-accent/50"
                                }
                            `}>
                                {selectedRole === role.id && (
                                    <svg
                                        className="w-3.5 h-3.5 text-accent"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
