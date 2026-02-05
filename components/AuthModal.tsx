"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { X, Home, Key, Briefcase } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: "signin" | "signup";
}

type AuthView = "signin" | "signup" | "role-selection";

export default function AuthModal({ isOpen, onClose, initialView = "signin" }: AuthModalProps) {
    const [view, setView] = useState<AuthView>(initialView === "signup" ? "role-selection" : "signin");
    const { theme } = useTheme();

    useEffect(() => {
        if (isOpen) {
            const targetView = initialView === "signup" ? "role-selection" : "signin";
            // We only want to set the view when the modal first opens or initialView changes.
            // We do NOT want to reset it when 'view' changes internally.
            setView(targetView);
        }
    }, [isOpen, initialView]);

    if (!isOpen) return null;

    const handleRoleSelect = (role: "tenant" | "owner" | "agent") => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem("wisteria_role", role);
        }
        setView("signup");
    };

    const switchView = (newView: AuthView) => {
        setView(newView);
    }

    const clerkAppearance = {
        baseTheme: theme === 'dark' ? dark : undefined,
        elements: {
            card: "shadow-none bg-transparent",
            rootBox: "w-full",

        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-grey-10 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 text-grey-30 hover:text-purple-60 dark:text-grey-40"
                >
                    <X size={24} />
                </button>

                <div className="p-6 md:p-8">
                    {/* Header for Custom Views */}
                    {view === "role-selection" && (
                        <>
                            <h2 className="mb-2 text-2xl font-bold text-center text-grey-08 dark:text-white-99">
                                Select Your Role
                            </h2>
                            <p className="mb-6 text-center text-sm text-grey-30 dark:text-grey-40">
                                How do you plan to use Wisteria?
                            </p>
                        </>
                    )}

                    {/* Role Selection View */}
                    {view === "role-selection" && (
                        <div className="grid gap-4">
                            <button
                                onClick={() => handleRoleSelect("tenant")}
                                className="flex w-full items-center gap-4 rounded-xl border border-white-90 p-4 transition-all hover:border-purple-60 hover:bg-purple-99 dark:border-grey-20 dark:hover:bg-grey-15"
                            >
                                <div className="rounded-full bg-purple-90 p-2 text-purple-60">
                                    <Key size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-grey-08 dark:text-white-99">Buy / Rent</div>
                                    <div className="text-xs text-grey-30 dark:text-grey-40">Find your dream home</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleRoleSelect("owner")}
                                className="flex w-full items-center gap-4 rounded-xl border border-white-90 p-4 transition-all hover:border-purple-60 hover:bg-purple-99 dark:border-grey-20 dark:hover:bg-grey-15"
                            >
                                <div className="rounded-full bg-purple-90 p-2 text-purple-60">
                                    <Home size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-grey-08 dark:text-white-99">List Property</div>
                                    <div className="text-xs text-grey-30 dark:text-grey-40">For property owners</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleRoleSelect("agent")}
                                className="flex w-full items-center gap-4 rounded-xl border border-white-90 p-4 transition-all hover:border-purple-60 hover:bg-purple-99 dark:border-grey-20 dark:hover:bg-grey-15"
                            >
                                <div className="rounded-full bg-purple-90 p-2 text-purple-60">
                                    <Briefcase size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-grey-08 dark:text-white-99">Property Agent</div>
                                    <div className="text-xs text-grey-30 dark:text-grey-40">For real estate agents</div>
                                </div>
                            </button>

                            <div className="mt-4 text-center text-sm text-grey-30 dark:text-grey-40">
                                Already have an account?{" "}
                                <button onClick={() => switchView("signin")} className="font-semibold text-purple-60 hover:underline">
                                    Log in
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Clerk Components */}
                    {view === "signin" && (
                        <div className="flex justify-center">
                            <SignIn
                                appearance={clerkAppearance}
                                routing="virtual"
                                fallbackRedirectUrl="/"
                                signUpUrl="#"
                                forceRedirectUrl="/"
                            />
                            {/* Custom Link to switch to Role Selection for Signup */}
                            <style jsx global>{`
                       .cl-footerActionLink { display: none !important; }
                   `}</style>
                            <div className="absolute bottom-8 left-0 w-full text-center text-sm text-grey-30 dark:text-grey-40 pointer-events-none">
                                <span className="pointer-events-auto">
                                    Don&apos;t have an account?{" "}
                                    <button onClick={() => switchView("role-selection")} className="font-semibold text-purple-60 hover:underline">
                                        Sign up
                                    </button>
                                </span>
                            </div>
                        </div>
                    )}

                    {view === "signup" && (
                        <div className="flex justify-center flex-col">
                            {/* Back button to change role */}
                            <button onClick={() => switchView("role-selection")} className="mb-4 self-start text-xs text-grey-40 hover:text-purple-60">
                                ← Change Role
                            </button>
                            <SignUp
                                appearance={clerkAppearance}
                                routing="virtual"
                                forceRedirectUrl="/sync-role"
                                signInUrl="#"
                            />
                            <style jsx global>{`
                       .cl-footerActionLink { display: none !important; }
                   `}</style>
                            <div className="mt-4 text-center text-sm text-grey-30 dark:text-grey-40">
                                Already have an account?{" "}
                                <button onClick={() => switchView("signin")} className="font-semibold text-purple-60 hover:underline">
                                    Log in
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
