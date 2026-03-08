"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./DashboardShell";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth/AuthContext";

interface DashboardHeaderProps {
    userName: string;
    userEmail: string;
    pageTitle?: string;
}

export default function DashboardHeader({
    userName,
    userEmail,
    pageTitle = "Dashboard",
}: DashboardHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const { setSidebarOpen } = useDashboard();
    const { resolvedTheme, setTheme } = useTheme();
    const { logout } = useAuth();
    const router = useRouter();

    const handleSignOut = () => {
        logout();
        router.push("/");
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-hover text-secondary transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Page Title */}
                <div>
                    <h1 className="text-lg font-semibold text-primary">{pageTitle}</h1>
                </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search properties, leads, messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="
                            w-full pl-10 pr-4 py-2.5 rounded-xl
                            bg-input-bg border border-input-border
                            focus:bg-surface focus:border-accent focus:outline-none
                            focus:ring-4 focus:ring-accent/10
                            text-sm text-primary placeholder:text-tertiary
                            transition-all duration-200
                        "
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Mobile Search */}
                <button className="md:hidden p-2.5 rounded-xl hover:bg-hover text-secondary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-hover text-secondary transition-colors"
                    aria-label="Toggle theme"
                >
                    {resolvedTheme === "dark" ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl hover:bg-hover text-secondary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
                </button>

                {/* Quick Add */}
                <button
                    onClick={() => router.push("/dashboard/properties/new")}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden lg:inline">Add New</span>
                </button>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-border mx-2" />

                {/* User Section */}
                <div className="relative flex items-center gap-3">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-primary leading-tight">{userName}</p>
                        <p className="text-xs text-tertiary leading-tight">{userEmail}</p>
                    </div>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium hover:bg-accent-hover transition-colors"
                        title="Profile menu"
                    >
                        {userName.charAt(0).toUpperCase()}
                    </button>

                    {/* Profile dropdown */}
                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-40 py-1 overflow-hidden">
                                <div className="px-4 py-3 border-b border-border">
                                    <p className="text-sm font-medium text-primary truncate">{userName}</p>
                                    <p className="text-xs text-tertiary truncate">{userEmail}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        router.push("/dashboard/settings");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-hover transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        handleSignOut();
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
