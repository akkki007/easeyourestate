import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import Property from "@/lib/db/models/Property";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/admin/listings/:id — Force delete listing
export async function DELETE(req: NextRequest, { params }: Params) {
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
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  await Property.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

  return NextResponse.json({ message: "Listing deleted" });
}
