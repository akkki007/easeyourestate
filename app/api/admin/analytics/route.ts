import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import User from "@/lib/db/models/User";
import Property from "@/lib/db/models/Property";
import Report from "@/lib/db/models/Report";

// GET /api/admin/analytics — Platform KPIs
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsersToday,
    activeListings,
    totalListings,
    pendingApprovals,
    totalReports,
    pendingReports,
    usersByRole,
    listingsByStatus,
    recentUsers,
    recentListings,
    pendingListings,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: todayStart }, deletedAt: null }),
    Property.countDocuments({ status: "active", deletedAt: null }),
    Property.countDocuments({ deletedAt: null }),
    Property.countDocuments({ status: "pending_review", deletedAt: null }),
    Report.countDocuments({}),
    Report.countDocuments({ status: "pending" }),
    User.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    Property.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    // Recent 8 users
    User.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name email phone role createdAt deletedAt")
      .lean(),
    // Recent 6 listings
    Property.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("listedBy", "name email role")
      .select("slug title price location purpose propertyType status listingType listedBy createdAt")
      .lean(),
    // Pending approval listings (up to 5)
    Property.find({ status: "pending_review", deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("listedBy", "name email role")
      .select("slug title price location purpose propertyType status listingType listedBy createdAt")
      .lean(),
  ]);

  const roleMap: Record<string, number> = {};
  for (const r of usersByRole) roleMap[r._id] = r.count;

  const statusMap: Record<string, number> = {};
  for (const s of listingsByStatus) statusMap[s._id] = s.count;

  return NextResponse.json({
    totalUsers,
    newUsersToday,
    activeListings,
    totalListings,
    pendingApprovals,
    totalReports,
    pendingReports,
    usersByRole: roleMap,
    listingsByStatus: statusMap,
    recentUsers,
    recentListings,
    pendingListings,
  });
}
