import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import mongoose from "mongoose";
import { sendSMS } from "@/lib/sms";

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

  // Send SMS notification to the property owner
  try {
    const owner = await User.findById(listing.listedBy).select("phone").lean();
    if (owner?.phone) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easeyourestate.vercel.app";
      const propertyLink = `${baseUrl}/property/${listing.slug}`;
      const message = `Congratulations! Your property "${listing.title}" has been successfully listed on EaseYourEstate. View here: ${propertyLink}`;
      await sendSMS(owner.phone, message);
    }
  } catch (err) {
    // Don't fail the approval if SMS fails
    console.error("Failed to send approval SMS:", (err as Error).message);
  }

  return NextResponse.json({ message: "Listing approved", status: listing.status });
}
