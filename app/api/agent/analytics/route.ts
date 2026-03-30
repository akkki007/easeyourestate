import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import Property from "@/lib/db/models/Property";
import Lead from "@/lib/db/models/Lead";
import SiteVisit from "@/lib/db/models/SiteVisit";

/**
 * GET /api/agent/analytics
 * Fetch agent's performance analytics and KPIs
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get agent's active listings
  const activeListings = await Property.countDocuments({
    listedBy: user._id,
    listingType: "agent",
    status: "active",
    deletedAt: null,
  });

  // Get total views across all agent's listings
  const listingsWithMetrics = await Property.find({
    listedBy: user._id,
    listingType: "agent",
    deletedAt: null,
  })
    .select("_id metrics")
    .lean();

  const totalViews = listingsWithMetrics.reduce((sum, p) => sum + (p.metrics?.views || 0), 0);
  const totalInquiries = listingsWithMetrics.reduce((sum, p) => sum + (p.metrics?.inquiries || 0), 0);

  // Get leads for agent's properties
  const agentLeads = await Lead.find({
    $or: [
      { recipientId: user._id },
      { assignedToUserId: user._id },
      { ownerId: user._id },
    ],
  }).lean();

  // Calculate this month's leads
  const leadsThisMonth = agentLeads.filter((l) => new Date(l.createdAt) >= startOfMonth).length;

  // Calculate conversion rate
  const convertedLeads = agentLeads.filter((l) => l.status === "converted").length;
  const conversionRate = agentLeads.length > 0 ? Math.round((convertedLeads / agentLeads.length) * 100) : 0;

  // Get site visits for agent's properties
  const propertyIds = listingsWithMetrics.map((p) => p._id);
  const siteVisitsThisMonth = await SiteVisit.countDocuments({
    propertyId: { $in: propertyIds },
    createdAt: { $gte: startOfMonth },
  });

  // Get top performing listings (by views)
  const topListings = listingsWithMetrics
    .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
    .slice(0, 5);

  const topListingsEnhanced = await Promise.all(
    topListings.map(async (p) => {
      const prop = await Property.findById(p._id).select("title slug metrics").lean();
      return {
        id: p._id.toString(),
        title: prop?.title || "Unknown",
        slug: prop?.slug,
        views: p.metrics?.views || 0,
        inquiries: p.metrics?.inquiries || 0,
      };
    })
  );

  // Get lead status distribution
  const leadStatuses = {
    new: agentLeads.filter((l) => l.status === "new").length,
    contacted: agentLeads.filter((l) => l.status === "contacted").length,
    follow_up: agentLeads.filter((l) => l.status === "follow_up").length,
    visited: agentLeads.filter((l) => l.status === "visited").length,
    converted: agentLeads.filter((l) => l.status === "converted").length,
    lost: agentLeads.filter((l) => l.status === "lost").length,
  };

  // Get leads timeline (last 7 days)
  const leadsTimeline = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = agentLeads.filter((l) => {
      const leadDate = new Date(l.createdAt);
      return leadDate >= date && leadDate < nextDate;
    }).length;

    leadsTimeline.push({
      date: date.toISOString().split("T")[0],
      count,
    });
  }

  // Get views timeline (last 7 days)
  const viewsTimeline = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // Approximate views by counting from property creation and assumptions
    // In a real system, this would come from a separate views analytics table
    const views = listingsWithMetrics.reduce((sum, p) => {
      // Simple approximation: distribute views evenly over recent days
      const createdAt = new Date(p._id.getTimestamp?.() || new Date());
      if (createdAt <= nextDate && createdAt >= date) {
        return sum + Math.floor((p.metrics?.views || 0) / 7);
      }
      return sum;
    }, 0);

    viewsTimeline.push({
      date: date.toISOString().split("T")[0],
      views,
    });
  }

  return NextResponse.json({
    kpis: {
      activeListings,
      totalViews,
      totalInquiries,
      leadsThisMonth,
      siteVisitsThisMonth,
      conversionRate,
    },
    leadStatusDistribution: leadStatuses,
    topListings: topListingsEnhanced,
    trends: {
      leadsTimeline,
      viewsTimeline,
    },
  });
}
