import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import User from "@/lib/db/models/User";

// GET /api/admin/users — List users with filters
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
  const filter: Record<string, any> = {};

  const role = sp.get("role");
  if (role) filter.role = role;

  const status = sp.get("status");
  if (status === "suspended") {
    filter.isSuspended = true;
  } else if (status === "active") {
    filter.isSuspended = { $ne: true };
    filter.deletedAt = null;
  } else if (status === "deleted") {
    filter.deletedAt = { $ne: null };
  }

  const q = sp.get("q");
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { "name.first": new RegExp(escaped, "i") },
      { "name.last": new RegExp(escaped, "i") },
      { email: new RegExp(escaped, "i") },
      { phone: new RegExp(escaped, "i") },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password -__v")
      .lean(),
    User.countDocuments(filter),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  });
}
