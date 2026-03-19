import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import { requireAuth } from"@/lib/auth/auth";

const VALID_ROLES = ["buyer","tenant","owner","agent","builder"] as const;

// PUT /api/user/role — Set/update user role
export async function PUT(req: NextRequest) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 await dbConnect();

 let body: { role?: string };
 try {
 body = await req.json();
 } catch {
 return NextResponse.json({ error:"Invalid JSON"}, { status: 400 });
 }

 const role = body.role;
 if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
 return NextResponse.json(
 { error:`Invalid role. Must be one of: ${VALID_ROLES.join(",")}`},
 { status: 400 }
 );
 }

 const updated = await User.findByIdAndUpdate(
 user._id,
 { $set: { role } },
 { new: true, runValidators: true }
 )
 .select("-password -deletedAt -__v")
 .lean();

 return NextResponse.json({ user: updated });
}
