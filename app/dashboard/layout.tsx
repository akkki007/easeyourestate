"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getUserDisplayName, useAuth } from "@/lib/auth/AuthContext";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { token, user, isHydrated } = useAuth();

    useEffect(() => {
        if (!isHydrated) return;
        if (!token || !user) {
            router.replace("/login");
            return;
        }
        // Redirect admin users to the admin panel
        if (user.role === "admin") {
            router.replace("/admin");
        }
    }, [isHydrated, router, token, user]);

    if (!isHydrated || !token || !user) return null;

    const userRole = typeof user.role === "string" ? user.role : "buyer";
    const userName = getUserDisplayName(user);
    const userEmail = typeof user.email === "string" ? user.email : "";

    return (
        <DashboardShell
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
        >
            {children}
        </DashboardShell>
    );
}
