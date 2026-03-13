import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import Property from "@/lib/db/models/Property";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/listings/:id/approve — Approve listing
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
  }

  await dbConnect();

  const listing = await Property.findById(id);
  if (!listing || listing.deletedAt) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  listing.status = "active";
  listing.publishedAt = new Date();
  listing.rejectionReason = undefined;
  await listing.save();

  return NextResponse.json({ message: "Listing approved", status: listing.status });
}
