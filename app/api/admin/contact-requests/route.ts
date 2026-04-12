import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import ContactRequest from "@/lib/db/models/ContactRequest";

// GET — admin lists all contact requests
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (status) filter.status = status;

  const [requests, total] = await Promise.all([
    ContactRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContactRequest.countDocuments(filter),
  ]);

  const items = requests.map((r: any) => ({
    id: r._id.toString(),
    buyerName: r.buyerName,
    buyerPhone: r.buyerPhone,
    buyerEmail: r.buyerEmail || "",
    ownerName: r.ownerName,
    ownerPhone: r.ownerPhone,
    ownerEmail: r.ownerEmail || "",
    propertyTitle: r.propertyTitle,
    propertySlug: r.propertySlug,
    propertyLocality: r.propertyLocality,
    propertyCity: r.propertyCity,
    status: r.status,
    adminNote: r.adminNote || "",
    createdAt: r.createdAt,
    approvedAt: r.approvedAt || null,
    rejectedAt: r.rejectedAt || null,
  }));

  return NextResponse.json({
    requests: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
