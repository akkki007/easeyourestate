"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [initialAuthView, setInitialAuthView] = useState<"signin" | "signup">("signin");

    const { user } = useUser();



    const openAuth = (view: "signin" | "signup") => {
        setInitialAuthView(view);
        setAuthModalOpen(true);
        setIsOpen(false);
    }

    const navLinks = [
        { href: "/buy", label: "Buy" },
        { href: "/rent", label: "Rent" },
        { href: "/commercial", label: "Commercial" },
        { href: "/pg", label: "PG" },
        { href: "/projects", label: "Projects" },
        { href: "/agents", label: "Agents" },
        { href: "/blog", label: "Blog" },
    ];

    return (
        <>
            <header
                className="relative w-full bg-w-primary-dark/90 backdrop-blur-md border-b border-white/10 shadow-lg text-white"
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        {/* Placeholder Icon */}
                        <div className="size-8 bg-w-brand rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">W</div>
                        <span className="text-xl font-bold tracking-tight">Wisteria Properties</span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-white/70 hover:text-white transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-w-brand after:transition-all hover:after:w-full"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <SignedOut>
                            <button
                                onClick={() => openAuth("signin")}
                                className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-full"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => openAuth("signup")}
                                className="text-sm font-bold bg-white text-w-primary-dark px-5 py-2 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Register
                            </button>
                        </SignedOut>

                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden bg-w-primary-dark/95 backdrop-blur-xl border-t border-white/10 p-6 absolute w-full left-0 shadow-2xl animate-in slide-in-from-top-2">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-lg font-medium text-white/90 hover:text-white py-2 border-b border-white/5"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-4">
                                <SignedOut>
                                    <button
                                        onClick={() => openAuth("signin")}
                                        className="text-left text-lg font-medium text-white/90 py-2"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => openAuth("signup")}
                                        className="text-center text-lg font-bold bg-white text-w-primary-dark py-3 rounded-xl shadow-lg mt-2"
                                    >
                                        Register
                                    </button>
                                </SignedOut>
                            </div>
                        </div>
                    </div>
                )}
            </header>
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialView={initialAuthView} />
        </>
    );
}
