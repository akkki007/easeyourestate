import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAdmin } from"@/lib/auth/adminAuth";
import Property from"@/lib/db/models/Property";
import mongoose from"mongoose";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/listings/:id/reject — Reject listing with reason
export async function PUT(req: NextRequest, { params }: Params) {
 const admin = await requireAdmin(req);
 if (!admin) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;
 if (!mongoose.Types.ObjectId.isValid(id)) {
 return NextResponse.json({ error:"Invalid listing ID"}, { status: 400 });
 }

 let body: { reason?: string };
 try {
 body = await req.json();
 } catch {
 return NextResponse.json({ error:"Invalid JSON"}, { status: 400 });
 }

 if (!body.reason?.trim()) {
 return NextResponse.json({ error:"Rejection reason is required"}, { status: 400 });
 }

 await dbConnect();

 const listing = await Property.findById(id);
 if (!listing || listing.deletedAt) {
 return NextResponse.json({ error:"Listing not found"}, { status: 404 });
 }

 listing.status ="rejected";
 listing.rejectionReason = body.reason.trim();
 await listing.save();

 return NextResponse.json({ message:"Listing rejected", status: listing.status });
}
