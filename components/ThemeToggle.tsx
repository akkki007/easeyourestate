"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const themes = [
        {
            value: "light" as const,
            label: "Light",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            value: "dark" as const,
            label: "Dark",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ),
        },
        {
            value: "system" as const,
            label: "System",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    const currentIcon = resolvedTheme === "dark" ? themes[1].icon : themes[0].icon;

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                    flex items-center gap-2 p-2.5 rounded-xl
                    bg-surface text-secondary
                    hover:bg-hover hover:text-primary
                    border border-border
                    transition-colors duration-200
                "
                aria-label="Toggle theme"
            >
                {currentIcon}
                {showLabel && (
                    <span className="text-sm font-medium">
                        {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="
                    absolute right-0 mt-2 w-36 py-1
                    bg-surface border border-border rounded-xl shadow-lg
                    z-50 animate-fade-in
                ">
                    {themes.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => {
                                setTheme(t.value);
                                setIsOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 text-left
                                transition-colors duration-150
                                ${theme === t.value
                                    ? "bg-hover text-primary"
                                    : "text-secondary hover:bg-hover hover:text-primary"
                                }
                            `}
                        >
                            <span className={theme === t.value ? "text-accent" : ""}>
                                {t.icon}
                            </span>
                            <span className="text-sm font-medium">{t.label}</span>
                            {theme === t.value && (
                                <svg className="w-4 h-4 ml-auto text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Simple toggle button (light/dark only)
export function ThemeToggleSimple({ className = "" }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-14 h-8 rounded-full p-1
                bg-hover border border-border
                transition-colors duration-300
                ${className}
            `}
            aria-label="Toggle theme"
        >
            <div
                className={`
                    w-6 h-6 rounded-full
                    bg-surface shadow-sm
                    flex items-center justify-center
                    transition-transform duration-300
                    ${resolvedTheme === "dark" ? "translate-x-6" : "translate-x-0"}
                `}
            >
                {resolvedTheme === "dark" ? (
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </div>
        </button>
    );
}
