import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import Property from"@/lib/db/models/Property";
import { requireAuth } from"@/lib/auth/auth";

export async function GET(req: NextRequest) {
 const dbUser = await requireAuth(req);
 if (!dbUser) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 await dbConnect();

 const { searchParams } = new URL(req.url);
 const status = searchParams.get("status") || undefined;
 const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
 const page = Math.max(Number(searchParams.get("page")) || 1, 1);
 const skip = (page - 1) * limit;

 const filter: { listedBy: typeof dbUser._id; deletedAt?: null; status?: string } = {
 listedBy: dbUser._id,
 deletedAt: null,
 };
 if (status) filter.status = status;

 const [list, total] = await Promise.all([
 Property.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
 Property.countDocuments(filter),
 ]);

 const listings = list.map((p) => ({
 id: p._id.toString(),
 slug: p.slug,
 title: p.title,
 purpose: p.purpose,
 category: p.category,
 propertyType: p.propertyType,
 status: p.status,
 price: p.price,
 location: { city: p.location.city, locality: p.location.locality },
 media: p.media?.images?.[0] ? { primary: p.media.images[0].url } : null,
 createdAt: p.createdAt,
 updatedAt: p.updatedAt,
 }));

 return NextResponse.json({
 listings,
 pagination: { page, limit, total, pages: Math.ceil(total / limit) },
 });
}
