import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/demoone");

  const user = await currentUser();
  const isOnboarded = user?.unsafeMetadata?.onboarded === true;
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background-dark p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-400">Welcome! You are signed in.</p>
          </div>
          <DashboardClient />
        </div>
      </div>
    </div>
  );
}
