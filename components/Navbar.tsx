'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

export default function Navbar() {
    const [showBanner, setShowBanner] = useState(true)
    const { isSignedIn } = useUser()

    return (
        <>
            {/* Top Banner */}
            {showBanner && (
                <div className="bg-card-dark border-b border-border-dark py-3 px-4 text-center text-sm font-medium relative">
                    <span className="text-white/80">✨ Discover Your Dream Property with Wisteria Properties</span>
                    <a className="ml-2 underline text-white hover:text-primary transition-colors" href="#">
                        Learn More
                    </a>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-border-dark py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">real_estate_agent</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Wisteria Properties</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1 bg-card-dark p-1 rounded-full border border-border-dark">
                        <a className="px-6 py-2 rounded-full bg-[#1A1A1A] text-sm font-medium shadow-sm" href="#">
                            Home
                        </a>
                        <a className="px-6 py-2 rounded-full hover:bg-white/10 text-sm font-medium text-gray-400" href="#">
                            About Us
                        </a>
                        <a className="px-6 py-2 rounded-full hover:bg-white/10 text-sm font-medium text-gray-400" href="#">
                            Properties
                        </a>
                        <a className="px-6 py-2 rounded-full hover:bg-white/10 text-sm font-medium text-gray-400" href="#">
                            Services
                        </a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isSignedIn ? (
                            <>
                                <Link href="/dashboard">
                                    <button className="bg-card-dark border border-border-dark px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                                        Dashboard
                                    </button>
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        ) : (
                            <>
                                <Link href="/demoone">
                                    <button className="bg-card-dark border border-border-dark px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/signup">
                                    <button className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}
