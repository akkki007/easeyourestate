"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [userRole, setUserRole] = useState("buyer");
    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const raw = localStorage.getItem("user");
        if (!token || !raw) {
            router.replace("/demoone");
            return;
        }
        try {
            const user = JSON.parse(raw);
            setUserName(
                typeof user.name === "object"
                    ? user.name.first || "User"
                    : user.name || "User"
            );
            setUserEmail(user.email || "");
            setUserRole(user.role || "buyer");
        } catch {
            router.replace("/demoone");
            return;
        }
        setReady(true);
    }, [router]);

    if (!ready) return null;

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
