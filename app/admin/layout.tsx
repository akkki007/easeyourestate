"use client";

import { useEffect, useState, useCallback, createContext, useContext } from"react";
import { useRouter, usePathname } from"next/navigation";
import Link from"next/link";
import { useAuth, getUserDisplayName } from"@/lib/auth/AuthContext";
import { useAdminRealtime } from"@/lib/hooks/useAdminRealtime";

// Context so child pages can subscribe to realtime events
interface AdminRealtimeContextValue {
 connected: boolean;
 mode:"changestream"|"polling"| null;
 lastEvent: number | null;
 refreshKey: number; // increments on every change — child pages can use as useEffect dep
}

const AdminRealtimeContext = createContext<AdminRealtimeContextValue>({
 connected: false,
 mode: null,
 lastEvent: null,
 refreshKey: 0,
});

export const useAdminRealtimeContext = () => useContext(AdminRealtimeContext);

const NAV_ITEMS = [
 {
 label:"Dashboard",
 href:"/admin",
 icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
 },
 {
 label:"Users",
 href:"/admin/users",
 icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
 },
 {
 label:"Listings",
 href:"/admin/listings",
 icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
 },
 {
 label:"Requests",
 href:"/admin/requests",
 icon:"M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4 0V2m0 2v2m0-2H8m4 0H8m9 8h-2m0 0H9m4 0v4m0-4V8",
 },
 {
 label:"Employees",
 href:"/admin/employees",
 icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a3 3 0 00-3-3h-.5",
 },
 {
 label:"Config",
 href:"/admin/config",
 icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const pathname = usePathname();
 const { token, user, isHydrated, logout } = useAuth();
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [refreshKey, setRefreshKey] = useState(0);

 // Skip auth check for the login page
 const isLoginPage = pathname ==="/admin/login";

 useEffect(() => {
 if (!isHydrated || isLoginPage) return;
 if (!token || !user || (user.role !=="admin" && user.role !== "employee")) {
 router.replace("/admin/login");
 }
 }, [isHydrated, token, user, router, isLoginPage]);

 // Realtime connection (only when authenticated)
 const isAdmin = !isLoginPage && isHydrated && !!token && (user?.role ==="admin" || user?.role === "employee");
 const handleRealtimeRefresh = useCallback(() => {
 setRefreshKey((k) => k + 1);
 }, []);
 const realtime = useAdminRealtime(isAdmin ? token : null, handleRealtimeRefresh);

 // Login page renders without shell
 if (isLoginPage) return <>{children}</>;

 // Auth loading
 if (!isHydrated || !token || !user || (user.role !=="admin" && user.role !== "employee")) return null;

 const isActive = (href: string) => {
 if (href ==="/admin") return pathname ==="/admin";
 return pathname === href || pathname.startsWith(href +"/");
 };

 const handleLogout = () => {
 logout();
 router.push("/admin/login");
 };

 return (
 <div className="min-h-screen bg-background">
 {/* Mobile overlay */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 bg-black/60 z-30 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside
 className={`
 fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-bg border-r border-border
 flex flex-col transition-transform duration-300
 ${sidebarOpen ?"translate-x-0":"-translate-x-full"}
 lg:translate-x-0
`}
 >
 {/* Logo */}
 <div className="h-16 flex items-center px-5 border-b border-border">
 <Link href="/admin"className="flex items-center gap-3">
 <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
 <svg className="w-5 h-5 text-primary-foreground"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
 </svg>
 </div>
 <div>
 <span className="font-semibold text-foreground text-sm">Admin Panel</span>
 <p className="text-[10px] text-muted-foreground">easeyourestate</p>
 </div>
 </Link>
 </div>

 {/* Nav */}
 <nav className="flex-1 overflow-y-auto py-4 px-3">
 <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
 Management
 </p>
 <div className="space-y-1">
 {NAV_ITEMS.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setSidebarOpen(false)}
 className={`
 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
 ${isActive(item.href)
 ?"bg-sidebar-active text-sidebar-active-text"
 :"text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
 }
`}
 >
 <svg className="w-5 h-5 shrink-0"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d={item.icon} />
 </svg>
 {item.label}
 </Link>
 ))}
 </div>
 </nav>

 {/* Bottom */}
 <div className="border-t border-border p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium text-sm">
 A
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-foreground truncate">{getUserDisplayName(user) || "Admin"}</p>
 <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@easeyourestate.com"}</p>
 </div>
 </div>
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error hover:bg-error transition-colors"
 >
 <svg className="w-4 h-4"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
 </svg>
 Sign Out
 </button>
 </div>
 </aside>

 {/* Main content */}
 <div className="lg:pl-64 min-h-screen">
 {/* Top bar */}
 <header className="h-14 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
 <div className="flex items-center">
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
 >
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M4 6h16M4 12h16M4 18h16"/>
 </svg>
 </button>
 <h1 className="text-sm font-medium text-foreground ml-2 lg:ml-0">
 {NAV_ITEMS.find((n) => isActive(n.href))?.label ||"Admin"}
 </h1>
 </div>
 {/* Live indicator */}
 <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
 realtime.connected
 ?"bg-success text-success"
 :"bg-muted text-muted-foreground"
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 realtime.connected ?"bg-success animate-pulse":"bg-muted"
 }`} />
 {realtime.connected
 ?`Live${realtime.mode ==="polling"?"(polling)":""}`
 :"Connecting..."
 }
 </div>
 </header>

 <AdminRealtimeContext.Provider value={{
 connected: realtime.connected,
 mode: realtime.mode,
 lastEvent: realtime.lastEvent,
 refreshKey,
 }}>
 {children}
 </AdminRealtimeContext.Provider>
 </div>
 </div>
 );
}
