'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { useTheme } from './ThemeProvider'

export default function Navbar() {
    const [showBanner, setShowBanner] = useState(true)
    const { isSignedIn } = useUser()
    const { resolvedTheme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    return (
        <>
            {/* Top Banner */}
            {showBanner && (
                <div className="bg-surface-elevated border-b border-border py-3 px-4 text-center text-sm font-medium relative">
                    <span className="text-secondary">Discover Your Dream Property with easeyourestate Properties</span>
                    <a className="ml-2 underline text-accent hover:text-accent-hover transition-colors" href="#">
                        Learn More
                    </a>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">easeyourestate Properties</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1 bg-surface p-1 rounded-full border border-border">
                        <Link href="/" className="px-6 py-2 rounded-full bg-hover text-sm font-medium text-primary shadow-sm">
                            Home
                        </Link>
                        <Link href="#" className="px-6 py-2 rounded-full hover:bg-hover text-sm font-medium text-secondary transition-colors">
                            About Us
                        </Link>
                        <Link href="#" className="px-6 py-2 rounded-full hover:bg-hover text-sm font-medium text-secondary transition-colors">
                            Properties
                        </Link>
                        <Link href="#" className="px-6 py-2 rounded-full hover:bg-hover text-sm font-medium text-secondary transition-colors">
                            Services
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg bg-surface border border-border hover:bg-hover text-secondary hover:text-primary transition-colors"
                            aria-label="Toggle theme"
                        >
                            {resolvedTheme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Auth Buttons */}
                        {isSignedIn ? (
                            <>
                                <Link href="/dashboard">
                                    <button className="bg-surface border border-border px-6 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors">
                                        Dashboard
                                    </button>
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        ) : (
                            <>
                                <Link href="/demoone">
                                    <button className="hidden sm:block bg-surface border border-border px-6 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/signup">
                                    <button className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
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
