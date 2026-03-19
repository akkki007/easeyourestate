"use client";

import Link from"next/link";
import { usePathname } from"next/navigation";

interface SidebarProps {
 userRole: string;
 userName: string;
 userEmail: string;
 collapsed?: boolean;
 onToggle?: () => void;
}

interface NavItem {
 label: string;
 href: string;
 icon: React.ReactNode;
 roles?: string[];
}

const navItems: NavItem[] = [
 {
 label:"Overview",
 href:"/dashboard",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
 </svg>
 ),
 },
 {
 label:"Profile",
 href:"/dashboard/profile",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
 </svg>
 ),
 },
 {
 label:"Properties",
 href:"/dashboard/properties/new",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
 </svg>
 ),
 roles: ["owner","agent","builder"],
 },
 {
 label:"Search",
 href:"/dashboard/search",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
 </svg>
 ),
 roles: ["buyer","tenant"],
 },
 {
 label:"Saved Properties",
 href:"/dashboard/saved",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
 </svg>
 ),
 roles: ["buyer","tenant"],
 },
 {
 label:"Recently Viewed",
 href:"/dashboard/viewed",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
 <path strokeLinecap="round"strokeLinejoin="round"d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
 </svg>
 ),
 roles: ["buyer","tenant"],
 },
 {
 label:"Saved Searches",
 href:"/dashboard/saved-searches",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
 </svg>
 ),
 roles: ["buyer","tenant"],
 },
 {
 label:"Listings",
 href:"/dashboard/listings",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
 </svg>
 ),
 roles: ["owner","agent","builder"],
 },
 {
 label:"Projects",
 href:"/dashboard/projects",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
 </svg>
 ),
 roles: ["builder"],
 },
 {
 label:"Leads",
 href:"/dashboard/leads",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
 </svg>
 ),
 roles: ["agent","builder"],
 },
 {
 label:"Messages",
 href:"/dashboard/messages",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
 </svg>
 ),
 },
 {
 label:"Appointments",
 href:"/dashboard/appointments",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
 </svg>
 ),
 },
 {
 label:"Documents",
 href:"/dashboard/documents",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
 </svg>
 ),
 roles: ["owner","agent","builder"],
 },
];

const bottomNavItems: NavItem[] = [
 {
 label:"Settings",
 href:"/dashboard/settings",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
 <path strokeLinecap="round"strokeLinejoin="round"d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
 </svg>
 ),
 },
 {
 label:"Help & Support",
 href:"/dashboard/support",
 icon: (
 <svg className="w-5 h-5"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
 </svg>
 ),
 },
];

export default function Sidebar({ userRole, userName, userEmail, collapsed = false }: SidebarProps) {
 const pathname = usePathname();

 const filteredNavItems = navItems.filter(
 (item) => !item.roles || item.roles.includes(userRole)
 );

 const isActive = (href: string) => {
 if (href ==="/dashboard") {
 return pathname ==="/dashboard";
 }
 // Exact match, or pathname continues with"/"
 // Prevents /dashboard/saved matching /dashboard/saved-searches
 return pathname === href || pathname.startsWith(href +"/");
 };

 const getRoleLabel = (role: string) => {
 const labels: Record<string, string> = {
 buyer:"Buyer",
 tenant:"Tenant",
 owner:"Property Owner",
 agent:"Agent / Broker",
 builder:"Builder / Developer",
 };
 return labels[role] ||"User";
 };

 return (
 <aside
 className={`
 fixed left-0 top-0 h-screen bg-sidebar-bg border-r border-border
 flex flex-col z-40 transition-all duration-300
 ${collapsed ?"w-20":"w-64"}
`}
 >
 {/* Logo */}
 <div className="h-16 flex items-center px-5 border-b border-border">
 <Link href="/"className="flex items-center gap-3">
 <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
 <svg className="w-5 h-5 text-primary-foreground"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
 </svg>
 </div>
 {!collapsed && (
 <span className="font-semibold text-primary text-sm">
 easeyourestate
 </span>
 )}
 </Link>
 </div>

 {/* User Profile Mini */}
 {!collapsed && (
 <div className="px-4 py-4 border-b border-border">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground font-medium">
 {userName.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-foreground truncate">
 {userName}
 </p>
 <p className="text-xs text-muted-foreground truncate">
 {getRoleLabel(userRole)}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Navigation */}
 <nav className="flex-1 overflow-y-auto py-4 px-3">
 <div className="space-y-1">
 {!collapsed && (
 <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Main
 </p>
 )}
 {filteredNavItems.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className={`
 flex items-center gap-3 px-3 py-2.5 rounded-lg
 transition-all duration-150 group
 ${isActive(item.href)
 ?"bg-sidebar-active text-sidebar-active-text"
 :"text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
 }
 ${collapsed ?"justify-center":""}
`}
 >
 <span className={`flex-shrink-0 ${isActive(item.href) ?"":"text-muted-foreground group-hover:text-foreground"}`}>
 {item.icon}
 </span>
 {!collapsed && (
 <span className="text-sm font-medium">{item.label}</span>
 )}
 </Link>
 ))}
 </div>
 </nav>

 {/* Bottom Navigation */}
 <div className="border-t border-border py-4 px-3">
 <div className="space-y-1">
 {bottomNavItems.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className={`
 flex items-center gap-3 px-3 py-2.5 rounded-lg
 transition-all duration-150 group
 ${isActive(item.href)
 ?"bg-sidebar-active text-sidebar-active-text"
 :"text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
 }
 ${collapsed ?"justify-center":""}
`}
 >
 <span className={`flex-shrink-0 ${isActive(item.href) ?"":"text-muted-foreground group-hover:text-foreground"}`}>
 {item.icon}
 </span>
 {!collapsed && (
 <span className="text-sm font-medium">{item.label}</span>
 )}
 </Link>
 ))}
 </div>
 </div>
 </aside>
 );
}
