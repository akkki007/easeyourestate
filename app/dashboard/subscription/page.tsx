"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, X, Zap, Users, Upload, Award } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import toast from "react-hot-toast";

type SubscriptionData = {
  subscription: {
    _id: string;
    planCode: string;
    planName: string;
    status: string;
    usage: {
      listings: number;
      teamSeats: number;
      featuredSlots: number;
    };
    limits: {
      listings: number;
      teamSeats: number;
      featuredSlots: number;
    };
    features: {
      bulkUploadEnabled: boolean;
    };
    startsAt: string;
    endsAt?: string;
    autoRenew: boolean;
  };
  available: {
    listings: number;
    teamSeats: number;
    featuredSlots: number;
  };
};

const PLAN_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  free: { bg: "bg-gray-50", text: "text-gray-900", badge: "bg-gray-200 text-gray-800" },
  basic: { bg: "bg-blue-50", text: "text-blue-900", badge: "bg-blue-200 text-blue-800" },
  pro: { bg: "bg-purple-50", text: "text-purple-900", badge: "bg-purple-200 text-purple-800" },
  premium: { bg: "bg-yellow-50", text: "text-yellow-900", badge: "bg-yellow-200 text-yellow-800" },
};

export default function SubscriptionPage() {
  const [user, setUser] = useState<{ name?: { first?: string; last?: string } | string; email?: string } | null>(null);
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/agent/subscription", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to load subscription");
          setLoading(false);
          return;
        }

        const respData = await res.json();
        setData(respData);
      } catch {
        setError("Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const userName =
    user && typeof user.name === "object"
      ? `${user.name?.first || ""} ${user.name?.last || ""}`.trim()
      : (user?.name as string) || "User";
  const userEmail = user?.email || "";

  if (loading) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Subscription" />
        <main className="p-6 flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Subscription" />
        <main className="p-6">
          <div className="bg-card rounded-2xl border border-error/30 p-8 text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">Failed to load subscription</h3>
            <p className="text-secondary text-sm">{error}</p>
          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Subscription" />
        <main className="p-6">
          <div className="text-center text-secondary">No subscription data</div>
        </main>
      </>
    );
  }

  const sub = data.subscription;
  const colors = PLAN_COLORS[sub.planCode] || PLAN_COLORS.free;

  const features = [
    {
      icon: Zap,
      label: "Listings",
      used: sub.usage.listings,
      limit: sub.limits.listings,
      available: data.available.listings,
    },
    {
      icon: Users,
      label: "Team Seats",
      used: sub.usage.teamSeats,
      limit: sub.limits.teamSeats,
      available: data.available.teamSeats,
    },
    {
      icon: Award,
      label: "Featured Slots",
      used: sub.usage.featuredSlots,
      limit: sub.limits.featuredSlots,
      available: data.available.featuredSlots,
    },
  ];

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Subscription" />
      <main className="p-6 space-y-6">
        {/* Current Plan Card */}
        <div className={`${colors.bg} rounded-2xl border-2 border-accent p-8`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-secondary text-sm font-medium">Current Plan</p>
              <h2 className="text-4xl font-bold text-foreground mt-1">{sub.planName}</h2>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${colors.badge}`}>{sub.status.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="text-secondary text-sm">Plan Started</p>
              <p className="text-foreground font-semibold">
                {new Date(sub.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            {sub.endsAt && (
              <div>
                <p className="text-secondary text-sm">Renewal Date</p>
                <p className="text-foreground font-semibold">
                  {new Date(sub.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
            <div>
              <p className="text-secondary text-sm">Auto-Renew</p>
              <p className="text-foreground font-semibold">{sub.autoRenew ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </div>

        {/* Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const percentage = feature.limit > 0 ? Math.round((feature.used / feature.limit) * 100) : 0;
            const isWarning = percentage >= 80;
            const isFull = feature.used >= feature.limit;

            return (
              <div key={feature.label} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 rounded-lg p-2.5">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-secondary text-sm font-medium">{feature.label}</p>
                      <p className="text-foreground font-semibold">
                        {feature.used}/{feature.limit}
                      </p>
                    </div>
                  </div>
                  {isFull && <X className="w-5 h-5 text-error" />}
                  {!isFull && isWarning && <Zap className="w-5 h-5 text-warning" />}
                  {!isFull && !isWarning && <Check className="w-5 h-5 text-success" />}
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isFull ? "bg-error" : isWarning ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-secondary">
                    {feature.available} of {feature.limit} available
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Plan Features</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-hover rounded-lg">
              <span className="text-sm text-foreground">Bulk Upload</span>
              <div className="flex items-center gap-2">
                {sub.features.bulkUploadEnabled ? (
                  <>
                    <Check className="w-5 h-5 text-success" />
                    <span className="text-xs text-success font-semibold">Available</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-error" />
                    <span className="text-xs text-error font-semibold">Not Available</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-hover rounded-lg">
              <span className="text-sm text-foreground">Team Management</span>
              <div className="flex items-center gap-2">
                {sub.limits.teamSeats > 1 ? (
                  <>
                    <Check className="w-5 h-5 text-success" />
                    <span className="text-xs text-success font-semibold">Available</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-error" />
                    <span className="text-xs text-error font-semibold">Not Available</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-hover rounded-lg">
              <span className="text-sm text-foreground">Featured Listings</span>
              <div className="flex items-center gap-2">
                {sub.limits.featuredSlots > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-success" />
                    <span className="text-xs text-success font-semibold">
                      {sub.limits.featuredSlots} slots
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-error" />
                    <span className="text-xs text-error font-semibold">Not Available</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-accent/20 p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Ready to upgrade?</h3>
          <p className="text-secondary text-sm mb-6">
            Unlock more listings, team members, and features with a premium plan.
          </p>
          <button className="px-6 py-2.5 rounded-lg bg-accent text-primary-foreground font-medium text-sm hover:bg-accent-hover transition-colors">
            View Plans
          </button>
        </div>
      </main>
    </>
  );
}
