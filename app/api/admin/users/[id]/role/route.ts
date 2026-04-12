import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAdmin } from"@/lib/auth/adminAuth";
import User from"@/lib/db/models/User";
import mongoose from"mongoose";

const VALID_ROLES = ["buyer","tenant","owner","employee","admin"] as const;

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/users/:id/role — Change user role
export async function PUT(req: NextRequest, { params }: Params) {
 const admin = await requireAdmin(req);
 if (!admin) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;
 if (!mongoose.Types.ObjectId.isValid(id)) {
 return NextResponse.json({ error:"Invalid user ID"}, { status: 400 });
 }

 let body: { role?: string };
 try {
 body = await req.json();
 } catch {
 return NextResponse.json({ error:"Invalid JSON"}, { status: 400 });
 }

 const role = body.role;
 if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
 return NextResponse.json({ error:`Invalid role. Must be: ${VALID_ROLES.join(",")}`}, { status: 400 });
 }

 await dbConnect();

 const user = await User.findByIdAndUpdate(
 id,
 { $set: { role } },
 { new: true, runValidators: true }
 )
 .select("-password -__v")
 .lean();

 if (!user) {
 return NextResponse.json({ error:"User not found"}, { status: 404 });
 }

 return NextResponse.json({ user });
}
