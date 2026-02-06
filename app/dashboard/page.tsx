import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import OnboardingProfile from "@/models/OnboardingProfile";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2, Briefcase } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await connectDB();
  const profile = await OnboardingProfile.findOne({ clerkUserId: userId });
  const role = profile?.role ?? "tenant";

  const roleConfig = {
    tenant: {
      title: "Find your next home",
      description: "Browse properties that match your preferences.",
      icon: Home,
      tips: ["Save your favorite listings", "Schedule viewings", "Get alerts for new matches"],
    },
    owner: {
      title: "Manage your listing",
      description: "Your property is one step closer to the right tenant or buyer.",
      icon: Building2,
      tips: ["Complete your listing", "Respond to inquiries", "Track views and interest"],
    },
    agent: {
      title: "Your dashboard",
      description: "Manage your listings and connect with clients.",
      icon: Briefcase,
      tips: ["Add new listings", "View analytics", "Manage your profile"],
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here’s an overview of your account.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your role
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">{role}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {config.description}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card md:col-span-2">
            <CardHeader>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {config.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of easeyourestate.ai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Your onboarding is complete</p>
                <p className="text-sm text-muted-foreground">
                  We’ve saved your preferences. You can update them anytime from Profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
