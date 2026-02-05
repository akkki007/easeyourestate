"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function SyncRolePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const syncRole = async () => {
            try {
                const role = sessionStorage.getItem("wisteria_role");
                if (role && (role === "tenant" || role === "owner" || role === "agent")) {
                    // Check if role is already set to avoid redundant updates
                    if (user.unsafeMetadata?.role !== role) {
                        await user.update({
                            unsafeMetadata: {
                                role: role,
                                onboarded: true,
                            },
                        });
                    }
                    // Clear storage after sync
                    sessionStorage.removeItem("wisteria_role");
                }
            } catch (error) {
                console.error("Failed to sync role:", error);
            } finally {
                setIsSyncing(false);
                router.push("/");
            }
        };

        syncRole();
    }, [isLoaded, user, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white-99 dark:bg-grey-08">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-60" />
                <p className="text-lg font-medium text-grey-08 dark:text-white-99">
                    Setting up your profile...
                </p>
            </div>
        </div>
    );
}
