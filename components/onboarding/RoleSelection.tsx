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
        description: "Looking to buy property or find a rental",
        icon: (
            <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        id: "owner" as UserRole,
        title: "Property Owner",
        description: "List and manage your properties",
        icon: (
            <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        id: "agent" as UserRole,
        title: "Agent / Broker",
        description: "Professional real estate services",
        icon: (
            <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: "builder" as UserRole,
        title: "Builder / Developer",
        description: "Promote projects and generate leads",
        icon: (
            <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Choose Your Role
                </h2>
                <p className="text-lg text-grey-40">
                    Select the option that best describes you
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role, index) => (
                    <button
                        key={role.id}
                        onClick={() => onSelectRole(role.id)}
                        style={{
                            animationDelay: `${index * 100}ms`,
                        }}
                        className={`
              group relative p-8 rounded-2xl border-2 text-left
              transition-all duration-300 hover:scale-[1.02]
              animate-slide-up
              ${selectedRole === role.id
                                ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(112,59,247,0.3)]"
                                : "bg-card-dark border-border-dark hover:border-primary/50 hover:shadow-[0_0_20px_rgba(112,59,247,0.15)]"
                            }
            `}
                    >
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Icon */}
                        <div
                            className={`
                relative mb-4 p-3 rounded-xl w-fit transition-all duration-300
                ${selectedRole === role.id
                                    ? "bg-primary text-white shadow-lg"
                                    : "bg-grey-15 text-grey-40 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-110"
                                }
              `}
                        >
                            {role.icon}
                        </div>

                        {/* Title */}
                        <h3 className="relative text-xl font-bold mb-2 transition-colors duration-300">
                            {role.title}
                        </h3>

                        {/* Description */}
                        <p className="relative text-grey-40 group-hover:text-grey-30 transition-colors duration-300">
                            {role.description}
                        </p>

                        {/* Selected Indicator with Animation */}
                        {selectedRole === role.id && (
                            <div className="absolute top-4 right-4 animate-scale-in">
                                <div className="bg-primary rounded-full p-1 shadow-lg">
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
                                </div>
                            </div>
                        )}

                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
