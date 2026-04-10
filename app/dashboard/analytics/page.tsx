"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Home, MessageSquare, Eye, CheckCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import toast from "react-hot-toast";

type AnalyticsData = {
  kpis: {
    activeListings: number;
    totalViews: number;
    totalInquiries: number;
    leadsThisMonth: number;
    siteVisitsThisMonth: number;
    conversionRate: number;
  };
  leadStatusDistribution: Record<string, number>;
  topListings: Array<{
    id: string;
    title: string;
    slug?: string;
    views: number;
    inquiries: number;
  }>;
  trends: {
    leadsTimeline: Array<{ date: string; count: number }>;
    viewsTimeline: Array<{ date: string; views: number }>;
  };
};

export default function AnalyticsPage() {
  const [user, setUser] = useState<{ name?: { first?: string; last?: string } | string; email?: string } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/agent/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to load analytics");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setAnalytics(data);
      } catch {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const userName =
    user && typeof user.name === "object"
      ? `${user.name?.first || ""} ${user.name?.last || ""}`.trim()
      : (user?.name as string) || "User";
  const userEmail = user?.email || "";

  if (loading) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Analytics" />
        <main className="p-6 flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Analytics" />
        <main className="p-6">
          <div className="bg-card rounded-2xl border border-error/30 p-8 text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </main>
      </>
    );
  }

  if (!analytics) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Analytics" />
        <main className="p-6">
          <div className="text-center text-muted-foreground">No data available</div>
        </main>
      </>
    );
  }

  const kpis = [
    {
      label: "Active Listings",
      value: analytics.kpis.activeListings,
      icon: Home,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Views",
      value: analytics.kpis.totalViews,
      icon: Eye,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Total Leads",
      value: analytics.kpis.totalInquiries,
      icon: MessageSquare,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Conversion Rate",
      value: `${analytics.kpis.conversionRate}%`,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Analytics" />
      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-card rounded-xl border border-border p-6 hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{kpi.value}</p>
                  </div>
                  <div className={`${kpi.bgColor} rounded-lg p-3`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Status Distribution */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Lead Status Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.leadStatusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{status.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{
                          width: `${
                            Object.values(analytics.leadStatusDistribution).reduce((a, b) => a + b, 0) > 0
                              ? (count / Object.values(analytics.leadStatusDistribution).reduce((a, b) => a + b, 0)) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Listings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Top Performing Listings
            </h3>
            <div className="space-y-3">
              {analytics.topListings.length > 0 ? (
                analytics.topListings.map((listing, idx) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 bg-hover rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {idx + 1}. {listing.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.views} views • {listing.inquiries} inquiries
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No listings yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Charts (Simple text representation) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Timeline */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Leads (Last 7 Days)</h3>
            <div className="space-y-2">
              {analytics.trends.leadsTimeline.map((item) => (
                <div key={item.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-border rounded h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-warning"
                        style={{
                          width: `${Math.max(item.count * 20, 5)}%`,
                        }}
                      />
                    </div>
                    <span className="text-foreground font-medium w-6">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Views Timeline */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Views (Last 7 Days)</h3>
            <div className="space-y-2">
              {analytics.trends.viewsTimeline.map((item) => (
                <div key={item.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-border rounded h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-info"
                        style={{
                          width: `${Math.max(item.views * 10, 5)}%`,
                        }}
                      />
                    </div>
                    <span className="text-foreground font-medium w-6">{item.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
