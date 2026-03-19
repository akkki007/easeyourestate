"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "./Sidebar";

interface DashboardContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType>({
    sidebarOpen: false,
    setSidebarOpen: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

interface DashboardShellProps {
    userRole: string;
    userName: string;
    userEmail: string;
    children: React.ReactNode;
}

export default function DashboardShell({
    userRole,
    userName,
    userEmail,
    children,
}: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <DashboardContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            <div className="min-h-screen bg-background">
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-background/80 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar
                        userRole={userRole}
                        userName={userName}
                        userEmail={userEmail}
                    />
                </div>

                {/* Sidebar - Mobile */}
                <div
                    className={`
                        lg:hidden fixed inset-y-0 left-0 z-40
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
                >
                    <Sidebar
                        userRole={userRole}
                        userName={userName}
                        userEmail={userEmail}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:pl-64 min-h-screen">
                    {children}
                </div>
            </div>
        </DashboardContext.Provider>
    );
}
