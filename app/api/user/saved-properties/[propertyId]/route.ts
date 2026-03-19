import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import Property from"@/lib/db/models/Property";
import { requireAuth } from"@/lib/auth/auth";
import mongoose from"mongoose";

type Params = { params: Promise<{ propertyId: string }> };

// POST /api/user/saved-properties/:propertyId — Save a property
export async function POST(req: NextRequest, { params }: Params) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { propertyId } = await params;

 if (!mongoose.Types.ObjectId.isValid(propertyId)) {
 return NextResponse.json({ error:"Invalid property ID"}, { status: 400 });
 }

 await dbConnect();

 const property = await Property.findById(propertyId).select("_id").lean();
 if (!property) {
 return NextResponse.json({ error:"Property not found"}, { status: 404 });
 }

 await User.findByIdAndUpdate(user._id, {
 $addToSet: {"preferences.favoriteProperties": propertyId },
 });

 return NextResponse.json({ message:"Property saved"});
}

// DELETE /api/user/saved-properties/:propertyId — Unsave a property
export async function DELETE(req: NextRequest, { params }: Params) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { propertyId } = await params;

 if (!mongoose.Types.ObjectId.isValid(propertyId)) {
 return NextResponse.json({ error:"Invalid property ID"}, { status: 400 });
 }

 await dbConnect();

 await User.findByIdAndUpdate(user._id, {
 $pull: {"preferences.favoriteProperties": propertyId },
 });

 return NextResponse.json({ message:"Property unsaved"});
}
