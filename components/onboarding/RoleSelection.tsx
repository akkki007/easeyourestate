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
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0B1E3A]">
                    Choose Your Role
                </h2>
                <p className="text-lg text-slate-600">
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
              group relative p-6 rounded-lg border-2 text-left
              transition-all duration-300 hover:scale-[1.02]
              animate-slide-up
              ${selectedRole === role.id
                                ? "bg-blue-50 border-[#0066CC] shadow-md"
                                : "bg-white border-slate-200 hover:border-[#0066CC]/50 hover:shadow-md"
                            }
            `}
                    >
                        {/* Icon */}
                        <div
                            className={`
                relative mb-4 p-3 rounded-lg w-fit transition-all duration-300
                ${selectedRole === role.id
                                    ? "bg-[#0066CC] text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-[#0066CC] group-hover:scale-110"
                                }
              `}
                        >
                            {role.icon}
                        </div>

                        {/* Title */}
                        <h3 className="relative text-lg font-bold mb-2 text-[#0B1E3A] transition-colors duration-300">
                            {role.title}
                        </h3>

                        {/* Description */}
                        <p className="relative text-slate-600 group-hover:text-slate-700 transition-colors duration-300 text-sm">
                            {role.description}
                        </p>

                        {/* Selected Indicator with Animation */}
                        {selectedRole === role.id && (
                            <div className="absolute top-4 right-4 animate-scale-in">
                                <div className="bg-[#0066CC] rounded-full p-1 shadow-md">
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
                    </button>
                ))}
            </div>
        </div>
    );
}