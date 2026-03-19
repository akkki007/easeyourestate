import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import ViewedProperty from"@/lib/db/models/ViewedProperty";
import Property from"@/lib/db/models/Property";
import { requireAuth } from"@/lib/auth/auth";
import mongoose from"mongoose";

type Params = { params: Promise<{ propertyId: string }> };

// POST /api/user/viewed-properties/:propertyId — Log a property view
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

 // Upsert: update viewedAt if already exists, create if not
 await ViewedProperty.findOneAndUpdate(
 { userId: user._id, propertyId },
 { $set: { viewedAt: new Date() } },
 { upsert: true }
 );

 return NextResponse.json({ message:"View logged"});
}
