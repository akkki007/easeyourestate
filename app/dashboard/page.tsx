"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";

interface DashboardStats {
    [key: string]: number;
}

export default function DashboardPage() {
    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("buyer");
    const [stats, setStats] = useState<DashboardStats>({});

    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (!raw) return;
        try {
            const user = JSON.parse(raw);
            setUserName(
                typeof user.name === "object"
                    ? user.name.first || "User"
                    : user.name || "User"
            );
            setUserEmail(user.email || "");
            setUserRole(user.role || "buyer");
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch("/api/user/dashboard-stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.stats) setStats(data.stats);
            })
            .catch(() => { /* ignore */ });
    }, []);

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            buyer: "Buyer",
            tenant: "Tenant",
            owner: "Property Owner",
            agent: "Agent / Broker",
            builder: "Builder / Developer",
        };
        return labels[role] || "User";
    };

    const getQuickActions = (role: string) => {
        switch (role) {
            case "buyer":
                return [
                    { label: "Search Properties", href: "/dashboard/search", icon: "search" },
                    { label: "View Saved", href: "/dashboard/saved", icon: "heart" },
                    { label: "My Appointments", href: "/dashboard/appointments", icon: "calendar" },
                ];
            case "tenant":
                return [
                    { label: "Search Rentals", href: "/dashboard/search", icon: "search" },
                    { label: "View Saved", href: "/dashboard/saved", icon: "heart" },
                    { label: "Saved Searches", href: "/dashboard/saved-searches", icon: "list" },
                ];
            case "owner":
                return [
                    { label: "Add Property", href: "/dashboard/properties/new", icon: "plus" },
                    { label: "View Listings", href: "/dashboard/listings", icon: "list" },
                    { label: "Check Messages", href: "/dashboard/messages", icon: "message" },
                ];
            case "agent":
                return [
                    { label: "Add Listing", href: "/dashboard/listings/new", icon: "plus" },
                    { label: "Manage Leads", href: "/dashboard/leads", icon: "users" },
                    { label: "Schedule Visit", href: "/dashboard/appointments", icon: "calendar" },
                ];
            case "builder":
                return [
                    { label: "Add Project", href: "/dashboard/projects/new", icon: "plus" },
                    { label: "View Leads", href: "/dashboard/leads", icon: "users" },
                    { label: "Documents", href: "/dashboard/documents", icon: "document" },
                ];
            default:
                return [];
        }
    };

    const quickActions = getQuickActions(userRole);

    return (
        <>
            <DashboardHeader
                userName={userName}
                userEmail={userEmail}
                pageTitle="Overview"
            />

            <main className="p-6">
                {/* Welcome Banner */}
                <div className="mb-8 bg-gradient-to-r from-accent to-accent-hover rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-white/70 text-sm mb-1">Welcome back,</p>
                            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                                {userName}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {getRoleLabel(userRole)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {quickActions.slice(0, 2).map((action, idx) => (
                                <Link
                                    key={idx}
                                    href={action.href}
                                    className={`
                                        px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${idx === 0
                                            ? "bg-white text-accent hover:bg-white/90"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                        }
                                    `}
                                >
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {(userRole === "buyer" || userRole === "tenant") ? (
                        <>
                            <StatCard
                                label="Viewed Properties"
                                value={String(stats.viewedProperties ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Saved Properties"
                                value={String(stats.savedProperties ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Saved Searches"
                                value={String(stats.savedSearches ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Appointments"
                                value={String(stats.appointments ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                label="Total Views"
                                value={String(stats.totalViews ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Active Listings"
                                value={String(stats.activeListings ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Total Inquiries"
                                value={String(stats.totalInquiries ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Appointments"
                                value={String(stats.appointments ?? 0)}
                                change=""
                                changeType="neutral"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                        </>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-primary">Recent Activity</h3>
                            <button className="text-sm text-secondary hover:text-primary">View all</button>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-primary font-medium mb-1">No recent activity</p>
                                <p className="text-tertiary text-sm">Your recent actions will appear here</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="font-semibold text-primary">Quick Actions</h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2">
                                {quickActions.map((action, idx) => (
                                    <Link
                                        key={idx}
                                        href={action.href}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-hover flex items-center justify-center text-secondary group-hover:bg-active transition-colors">
                                            <ActionIcon type={action.icon} />
                                        </div>
                                        <span className="text-sm font-medium text-secondary group-hover:text-primary">
                                            {action.label}
                                        </span>
                                        <svg className="w-4 h-4 text-tertiary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    {/* Tips Card */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-warning-bg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-primary mb-1">Getting Started</h4>
                                <p className="text-sm text-secondary mb-3">
                                    {userRole === "buyer"
                                        ? "Start by searching for properties in your preferred location. Save your favorites to compare later."
                                        : "Complete your profile and add your first property listing to get started."
                                    }
                                </p>
                                <Link
                                    href={userRole === "buyer" ? "/dashboard/search" : "/dashboard/settings"}
                                    className="text-sm font-medium text-accent hover:text-accent-hover inline-flex items-center gap-1"
                                >
                                    Learn more
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-info-bg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-primary mb-1">Need Help?</h4>
                                <p className="text-sm text-secondary mb-3">
                                    Our support team is here to help you with any questions or issues you might have.
                                </p>
                                <Link
                                    href="/dashboard/support"
                                    className="text-sm font-medium text-accent hover:text-accent-hover inline-flex items-center gap-1"
                                >
                                    Contact Support
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

function StatCard({
    label,
    value,
    change,
    changeType,
    icon,
}: {
    label: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-hover flex items-center justify-center text-secondary">
                    {icon}
                </div>
                <span
                    className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${changeType === "positive" ? "bg-success-bg text-success" : ""}
                        ${changeType === "negative" ? "bg-error-bg text-error" : ""}
                        ${changeType === "neutral" ? "bg-hover text-tertiary" : ""}
                    `}
                >
                    {change}
                </span>
            </div>
            <p className="text-2xl font-semibold text-primary mb-1">{value}</p>
            <p className="text-sm text-secondary">{label}</p>
        </div>
    );
}

function ActionIcon({ type }: { type: string }) {
    switch (type) {
        case "search":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            );
        case "heart":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            );
        case "calendar":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        case "plus":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            );
        case "list":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            );
        case "message":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            );
        case "users":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            );
        case "document":
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        default:
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            );
    }
}
