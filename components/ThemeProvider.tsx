"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "easeyourestate-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    // Get system preference
    const getSystemTheme = (): "light" | "dark" => {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return "light";
    };

    // Resolve theme
    const resolveTheme = (t: Theme): "light" | "dark" => {
        if (t === "system") {
            return getSystemTheme();
        }
        return t;
    };

    // Load theme from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        if (stored) {
            setThemeState(stored);
        }
        setMounted(true);
    }, [storageKey]);

    // Update resolved theme and apply to document
    useEffect(() => {
        const resolved = resolveTheme(theme);
        setResolvedTheme(resolved);

        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);

        // Also set color-scheme for native elements
        root.style.colorScheme = resolved;
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            setResolvedTheme(getSystemTheme());
            const root = document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(getSystemTheme());
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(storageKey, newTheme);
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return (
            <div style={{ visibility: "hidden" }}>
                {children}
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
