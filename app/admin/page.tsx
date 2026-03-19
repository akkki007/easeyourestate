"use client";

import { useEffect, useState, useCallback, useRef } from"react";
import { useAuth } from"@/lib/auth/AuthContext";
import { useAdminRealtimeContext } from"./layout";
import Link from"next/link";
import toast from"react-hot-toast";

interface RecentUser {
 _id: string;
 name: { first: string; last: string };
 email?: string;
 phone?: string;
 role: string;
 createdAt: string;
 deletedAt?: string;
}

interface RecentListing {
 _id: string;
 slug: string;
 title: string;
 purpose: string;
 propertyType: string;
 status: string;
 listingType: string;
 price: { amount: number };
 location: { city: string; locality: string };
 listedBy?: { name: { first: string; last: string }; email?: string; role: string };
 createdAt: string;
}

interface Analytics {
 totalUsers: number;
 newUsersToday: number;
 activeListings: number;
 totalListings: number;
 pendingApprovals: number;
 totalReports: number;
 pendingReports: number;
 usersByRole: Record<string, number>;
 listingsByStatus: Record<string, number>;
 recentUsers: RecentUser[];
 recentListings: RecentListing[];
 pendingListings: RecentListing[];
}

export default function AdminDashboard() {
 const { token } = useAuth();
 const [data, setData] = useState<Analytics | null>(null);
 const [loading, setLoading] = useState(true);
 const [flash, setFlash] = useState(false);
 const prevDataRef = useRef<string>("");

 const fetchAnalytics = useCallback(async () => {
 if (!token) return;
 try {
 const res = await fetch("/api/admin/analytics", {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 const newData = await res.json();

 // Detect if data actually changed (flash animation)
 const sig = JSON.stringify({
 u: newData.totalUsers,
 l: newData.totalListings,
 p: newData.pendingApprovals,
 r: newData.pendingReports,
 });
 if (prevDataRef.current && prevDataRef.current !== sig) {
 setFlash(true);
 setTimeout(() => setFlash(false), 1500);
 }
 prevDataRef.current = sig;

 setData(newData);
 } catch {
 // Only toast on initial load failure
 if (!data) toast.error("Failed to load analytics");
 } finally {
 setLoading(false);
 }
 }, [token, data]);

 // Use shared realtime context (single SSE connection from layout)
 const { connected, mode, refreshKey } = useAdminRealtimeContext();

 // Initial fetch
 useEffect(() => {
 fetchAnalytics();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [token]);

 // Re-fetch when realtime refreshKey changes
 useEffect(() => {
 if (refreshKey > 0) fetchAnalytics();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [refreshKey]);

 const handleApprove = async (id: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/listings/${id}/approve`, {
 method:"PUT",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 toast.success("Listing approved");
 fetchAnalytics();
 } catch {
 toast.error("Failed to approve");
 }
 };

 if (loading) {
 return (
 <main className="p-6 flex items-center justify-center py-20">
 <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
 </main>
 );
 }

 if (!data) return null;

 const formatPrice = (n: number) => {
 if (n >= 1_00_00_000) return`${(n / 1_00_00_000).toFixed(1)} Cr`;
 if (n >= 1_00_000) return`${(n / 1_00_000).toFixed(1)} L`;
 return`${(n / 1000).toFixed(0)}K`;
 };

 const timeAgo = (d: string) => {
 const diff = Date.now() - new Date(d).getTime();
 const mins = Math.floor(diff / 60000);
 if (mins < 1) return"Just now";
 if (mins < 60) return`${mins}m ago`;
 const hrs = Math.floor(mins / 60);
 if (hrs < 24) return`${hrs}h ago`;
 const days = Math.floor(hrs / 24);
 if (days < 7) return`${days}d ago`;
 return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short"});
 };

 const statusColor: Record<string, string> = {
 active:"bg-success text-success",
 draft:"bg-muted/10 text-muted-foreground",
 pending_review:"bg-warning text-warning",
 sold:"bg-primary text-primary",
 rented:"bg-info text-info",
 rejected:"bg-error text-error",
 };

 const kpis = [
 { label:"Total Users", value: data.totalUsers, icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color:"text-primary", bg:"bg-primary"},
 { label:"New Today", value: data.newUsersToday, icon:"M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", color:"text-success", bg:"bg-success"},
 { label:"Active Listings", value: data.activeListings, icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color:"text-primary", bg:"bg-primary"},
 { label:"Total Listings", value: data.totalListings, icon:"M4 6h16M4 10h16M4 14h16M4 18h16", color:"text-info", bg:"bg-info"},
 { label:"Pending Approvals", value: data.pendingApprovals, icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color:"text-warning", bg:"bg-warning"},
 { label:"Pending Reports", value: data.pendingReports, icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color:"text-error", bg:"bg-error"},
 ];

 return (
 <main className="p-6">
 {/* Header with live indicator */}
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-semibold text-primary-foreground">Platform Overview</h2>
 <div className="flex items-center gap-2">
 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
 connected
 ?"bg-success text-success"
 :"bg-muted text-muted-foreground"
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 connected ?"bg-success animate-pulse":"bg-muted"
 }`} />
 {connected
 ?`Live${mode ==="polling"?"(polling)":""}`
 :"Connecting..."
 }
 </div>
 <button
 onClick={fetchAnalytics}
 className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-accent transition-colors"
 title="Refresh"
 >
 <svg className="w-4 h-4"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="2">
 <path strokeLinecap="round"strokeLinejoin="round"d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
 </svg>
 </button>
 </div>
 </div>

 {/* KPI Cards */}
 <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 transition-all duration-500 ${
 flash ?"ring-1 ring-accent/30 rounded-2xl":""
 }`}>
 {kpis.map((kpi) => (
 <div key={kpi.label} className="bg-muted border border-border rounded-xl p-4">
 <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
 <svg className={`w-5 h-5 ${kpi.color}`} fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d={kpi.icon} />
 </svg>
 </div>
 <p className={`text-2xl font-bold text-primary-foreground transition-all duration-300 ${flash ?"scale-105":""}`}>
 {kpi.value.toLocaleString()}
 </p>
 <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
 </div>
 ))}
 </div>

 {/* Pending Approvals Queue */}
 {data.pendingListings.length > 0 && (
 <div className="bg-muted border border-warning rounded-xl mb-6 overflow-hidden">
 <div className="px-5 py-3 border-b border-border flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-warning animate-pulse"/>
 <h3 className="text-sm font-semibold text-primary-foreground">Pending Approvals</h3>
 <span className="text-xs text-muted-foreground">({data.pendingListings.length})</span>
 </div>
 <Link href="/admin/listings"className="text-xs text-accent hover:text-accent-hover transition-colors">
 View all
 </Link>
 </div>
 <div className="divide-y divide-gray-800/50">
 {data.pendingListings.map((l) => (
 <div key={l._id} className="px-5 py-3 flex items-center gap-4">
 <div className="flex-1 min-w-0">
 <p className="text-sm text-primary-foreground font-medium truncate">{l.title}</p>
 <p className="text-xs text-muted-foreground">
 {l.location.locality}, {l.location.city} &middot; {l.propertyType} &middot; {formatPrice(l.price.amount)}
 {l.listedBy && <> &middot; by {l.listedBy.name.first} {l.listedBy.name.last}</>}
 </p>
 </div>
 <span className="text-xs text-muted-foreground shrink-0">{timeAgo(l.createdAt)}</span>
 <button
 onClick={() => handleApprove(l._id)}
 className="px-3 py-1.5 rounded-lg text-xs font-medium bg-success text-success hover:bg-success transition-colors shrink-0"
 >
 Approve
 </button>
 <Link
 href="/admin/listings"
 className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors shrink-0"
 >
 Review
 </Link>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="grid lg:grid-cols-2 gap-6 mb-6">
 {/* Users by Role */}
 <div className="bg-muted border border-border rounded-xl p-5">
 <h3 className="text-sm font-semibold text-primary-foreground mb-4">Users by Role</h3>
 {Object.keys(data.usersByRole).length === 0 ? (
 <p className="text-muted-foreground text-sm py-4 text-center">No users yet</p>
 ) : (
 <div className="space-y-3">
 {Object.entries(data.usersByRole).map(([role, count]) => {
 const pct = data.totalUsers ? Math.round((count / data.totalUsers) * 100) : 0;
 return (
 <div key={role}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-muted-foreground capitalize">{role}</span>
 <span className="text-muted-foreground">{count} ({pct}%)</span>
 </div>
 <div className="h-2 rounded-full bg-muted overflow-hidden">
 <div className="h-full rounded-full bg-accent transition-all duration-700"style={{ width:`${Math.max(pct, 2)}%`}} />
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Listings by Status */}
 <div className="bg-muted border border-border rounded-xl p-5">
 <h3 className="text-sm font-semibold text-primary-foreground mb-4">Listings by Status</h3>
 {Object.keys(data.listingsByStatus).length === 0 ? (
 <p className="text-muted-foreground text-sm py-4 text-center">No listings yet</p>
 ) : (
 <div className="space-y-3">
 {Object.entries(data.listingsByStatus).map(([status, count]) => {
 const pct = data.totalListings ? Math.round((count / data.totalListings) * 100) : 0;
 const barColors: Record<string, string> = {
 active:"bg-success", draft:"bg-muted", pending_review:"bg-warning",
 sold:"bg-primary", rented:"bg-info", rejected:"bg-error",
 expired:"bg-muted", archived:"bg-muted",
 };
 return (
 <div key={status}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-muted-foreground capitalize">{status.replace(/_/g,"")}</span>
 <span className="text-muted-foreground">{count}</span>
 </div>
 <div className="h-2 rounded-full bg-muted overflow-hidden">
 <div className={`h-full rounded-full transition-all duration-700 ${barColors[status] ||"bg-muted"}`} style={{ width:`${Math.max(pct, 2)}%`}} />
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>

 <div className="grid lg:grid-cols-2 gap-6">
 {/* Recent Users */}
 <div className="bg-muted border border-border rounded-xl overflow-hidden">
 <div className="px-5 py-3 border-b border-border flex items-center justify-between">
 <h3 className="text-sm font-semibold text-primary-foreground">Recent Users</h3>
 <Link href="/admin/users"className="text-xs text-accent hover:text-accent-hover transition-colors">
 View all
 </Link>
 </div>
 {data.recentUsers.length === 0 ? (
 <div className="px-5 py-10 text-center">
 <p className="text-muted-foreground text-sm">No users registered yet</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-800/50">
 {data.recentUsers.map((u, i) => (
 <div
 key={u._id}
 className={`px-5 py-3 flex items-center gap-3 transition-all duration-500 ${
 flash && i === 0 ?"bg-accent/5":""
 }`}
 >
 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
 {u.name.first?.charAt(0)?.toUpperCase() ||"?"}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm text-primary-foreground font-medium truncate">
 {u.name.first} {u.name.last}
 </p>
 <p className="text-xs text-muted-foreground truncate">{u.email || u.phone ||"-"}</p>
 </div>
 <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium capitalize shrink-0">
 {u.role}
 </span>
 <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(u.createdAt)}</span>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Recent Listings */}
 <div className="bg-muted border border-border rounded-xl overflow-hidden">
 <div className="px-5 py-3 border-b border-border flex items-center justify-between">
 <h3 className="text-sm font-semibold text-primary-foreground">Recent Listings</h3>
 <Link href="/admin/listings"className="text-xs text-accent hover:text-accent-hover transition-colors">
 View all
 </Link>
 </div>
 {data.recentListings.length === 0 ? (
 <div className="px-5 py-10 text-center">
 <p className="text-muted-foreground text-sm">No listings created yet</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-800/50">
 {data.recentListings.map((l, i) => (
 <div
 key={l._id}
 className={`px-5 py-3 flex items-center gap-3 transition-all duration-500 ${
 flash && i === 0 ?"bg-accent/5":""
 }`}
 >
 <div className="flex-1 min-w-0">
 <p className="text-sm text-primary-foreground font-medium truncate">{l.title}</p>
 <p className="text-xs text-muted-foreground truncate">
 {l.location.locality}, {l.location.city} &middot; {formatPrice(l.price.amount)}
 {l.listedBy && <> &middot; {l.listedBy.name.first}</>}
 </p>
 </div>
 <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium capitalize shrink-0 ${statusColor[l.status] ||"bg-muted text-muted-foreground"}`}>
 {l.status.replace(/_/g,"")}
 </span>
 <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(l.createdAt)}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </main>
 );
}
