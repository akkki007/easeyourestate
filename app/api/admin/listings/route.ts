import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import Property from "@/lib/db/models/Property";

// GET /api/admin/listings — All listings with filters
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { deletedAt: null };

  const status = sp.get("status");
  if (status) filter.status = status;

  const purpose = sp.get("purpose");
  if (purpose) filter.purpose = purpose;

  const city = sp.get("city");
  if (city) filter["location.city"] = new RegExp(`^${city}$`, "i");

  const q = sp.get("q");
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: new RegExp(escaped, "i") },
      { slug: new RegExp(escaped, "i") },
      { "location.locality": new RegExp(escaped, "i") },
    ];
  }

  const [listings, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("listedBy", "name email phone role")
      .select("slug title price location purpose category propertyType status listingType listedBy createdAt publishedAt")
      .lean(),
    Property.countDocuments(filter),
  ]);

  return NextResponse.json({
    listings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  });
}
