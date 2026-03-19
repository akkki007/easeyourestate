import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAdmin } from"@/lib/auth/adminAuth";
import User from"@/lib/db/models/User";
import mongoose from"mongoose";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/users/:id — Get user details
export async function GET(req: NextRequest, { params }: Params) {
 const admin = await requireAdmin(req);
 if (!admin) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;
 if (!mongoose.Types.ObjectId.isValid(id)) {
 return NextResponse.json({ error:"Invalid user ID"}, { status: 400 });
 }

 await dbConnect();

 const user = await User.findById(id).select("-password -__v").lean();
 if (!user) {
 return NextResponse.json({ error:"User not found"}, { status: 404 });
 }

 return NextResponse.json({ user });
}

// DELETE /api/admin/users/:id — Delete user (hard delete)
export async function DELETE(req: NextRequest, { params }: Params) {
 const admin = await requireAdmin(req);
 if (!admin) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;
 if (!mongoose.Types.ObjectId.isValid(id)) {
 return NextResponse.json({ error:"Invalid user ID"}, { status: 400 });
 }

 await dbConnect();

 const user = await User.findById(id);
 if (!user) {
 return NextResponse.json({ error:"User not found"}, { status: 404 });
 }

 if (user.role ==="admin") {
 return NextResponse.json({ error:"Cannot delete admin user"}, { status: 403 });
 }

 await User.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

 return NextResponse.json({ message:"User deleted"});
}
