"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import {
    Building2,
    CreditCard,
    LayoutDashboard,
    LogIn,
    Menu,
    X,
} from "lucide-react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, isHydrated } = useAuth();

    const showDashboard = isHydrated && isAuthenticated;
    const showAuthLinks = isHydrated && !isAuthenticated;

    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href={"/"}>
                            <div className="flex items-center gap-2 select-none cursor-pointer">
                                <div className="relative flex items-end">
                                    <span className="text-[2rem] font-black text-foreground leading-none tracking-tighter">
                                        eye
                                    </span>
                                    <div className="absolute -top-1 -right-2 w-4 h-4 overflow-hidden">
                                        <div
                                            className="w-0 h-0"
                                            style={{
                                                borderLeft: "16px solid transparent",
                                                borderTop: "16px solid #674188",
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>
                        </Link>

                        {/* Right section wrapper */}
                        <div className="flex items-center gap-2">
                            {/* Desktop nav */}
                            <nav className="hidden md:flex items-center gap-1">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent text-sm font-medium transition-colors">
                                    <CreditCard className="w-4 h-4" />
                                    Pay Rent
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary  text-sm font-semibold hover:bg-primary transition-colors shadow-sm shadow-primary">
                                    <Building2 className="w-4 h-4" />
                                    For Property Owners
                                </button>
                                <div className="w-px h-5 bg-muted mx-1" />
                                {showDashboard && (
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-foreground hover:bg-accent text-sm font-medium transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                )}
                                {showAuthLinks && (
                                    <>
                                        <Link
                                            href="/signup"
                                            className="px-5 py-2 text-sm font-medium text-foreground transition-colors rounded-lg hover:bg-accent"
                                        >
                                            Sign Up
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-foreground hover:bg-accent text-sm font-medium transition-colors"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            Login
                                        </Link>
                                    </>
                                )}
                                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent text-sm font-medium transition-colors">
                                    <Menu className="w-4 h-4" />
                                    Menu
                                </button>
                            </nav>

                            {/* Theme Toggle */}
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground transition-colors"
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
                            )}

                            {/* Mobile burger */}
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent text-sm font-medium">
                            <CreditCard className="w-4 h-4" /> Pay Rent
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                            <Building2 className="w-4 h-4" /> For Property Owners
                        </button>
                        {showDashboard && (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent text-sm font-medium"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                        )}
                        {showAuthLinks && (
                            <>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent text-sm font-medium text-left"
                                >
                                    Sign up
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent text-sm font-medium text-left"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </header>
        </>
    );
}
