import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import ViewedProperty from"@/lib/db/models/ViewedProperty";
import { requireAuth } from"@/lib/auth/auth";

// GET /api/user/viewed-properties — Get recently viewed properties
export async function GET(req: NextRequest) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 await dbConnect();

 const sp = req.nextUrl.searchParams;
 const page = Math.max(1, parseInt(sp.get("page") ||"1", 10));
 const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ||"20", 10)));
 const skip = (page - 1) * limit;

 const [items, total] = await Promise.all([
 ViewedProperty.find({ userId: user._id })
 .sort({ viewedAt: -1 })
 .skip(skip)
 .limit(limit)
 .populate({
 path:"propertyId",
 select:"slug title price specs location media purpose category propertyType status publishedAt",
 })
 .lean(),
 ViewedProperty.countDocuments({ userId: user._id }),
 ]);

 const properties = items
 .filter((item) => item.propertyId !== null)
 .map((item) => ({
 ...(item.propertyId as Record<string, unknown>),
 viewedAt: item.viewedAt,
 }));

 return NextResponse.json({
 properties,
 total,
 page,
 totalPages: Math.ceil(total / limit),
 limit,
 });
}
