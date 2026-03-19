import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import { requireAuth } from"@/lib/auth/auth";
import mongoose from"mongoose";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/user/saved-searches/:id — Delete a saved search
export async function DELETE(req: NextRequest, { params }: Params) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;

 if (!mongoose.Types.ObjectId.isValid(id)) {
 return NextResponse.json({ error:"Invalid search ID"}, { status: 400 });
 }

 await dbConnect();

 await User.findByIdAndUpdate(user._id, {
 $pull: {"preferences.savedSearches": { _id: new mongoose.Types.ObjectId(id) } },
 });

 return NextResponse.json({ message:"Search deleted"});
}
