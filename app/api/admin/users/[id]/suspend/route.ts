import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAdmin } from"@/lib/auth/adminAuth";
import User from"@/lib/db/models/User";
import mongoose from"mongoose";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/users/:id/suspend — Suspend user
export async function PUT(req: NextRequest, { params }: Params) {
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
 return NextResponse.json({ error:"Cannot suspend admin"}, { status: 403 });
 }

 await User.findByIdAndUpdate(id, { $set: { isSuspended: true } });

 return NextResponse.json({ message:"User suspended"});
}
