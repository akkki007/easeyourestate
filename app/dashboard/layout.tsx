import { requireOnboarded } from "@/lib/auth/proxy";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = await requireOnboarded();

    const userName = user.firstName || "User";
    const userEmail = user.emailAddresses[0]?.emailAddress || "";
    const userRole = (user.unsafeMetadata?.role as string) || "buyer";

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
