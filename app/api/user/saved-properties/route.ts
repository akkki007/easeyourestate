import mongoose from"mongoose";
import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import Property from"@/lib/db/models/Property";
import { requireAuth } from"@/lib/auth/auth";

// GET /api/user/saved-properties — List saved/favourite properties
export async function GET(req: NextRequest) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 await dbConnect();

 const sp = req.nextUrl.searchParams;
 const idsOnly = sp.get("idsOnly") === "1";
 const page = Math.max(1, parseInt(sp.get("page") ||"1", 10));
 const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ||"20", 10)));

 const dbUser = await User.findById(user._id).select("preferences.favoriteProperties").lean();
 const favoriteIds = dbUser?.preferences?.favoriteProperties ?? [];

 if (idsOnly) {
 return NextResponse.json({
 propertyIds: favoriteIds.map((id: mongoose.Types.ObjectId) => id.toString()),
 total: favoriteIds.length,
 });
 }

 if (favoriteIds.length === 0) {
 return NextResponse.json({ properties: [], total: 0, page, totalPages: 0, limit });
 }

 const total = favoriteIds.length;
 const skip = (page - 1) * limit;

 // Paginate the IDs, then fetch
 const paginatedIds = favoriteIds.slice(skip, skip + limit);

 const properties = await Property.find({
 _id: { $in: paginatedIds },
 deletedAt: null,
 })
 .select("slug title price specs location media purpose category propertyType status publishedAt")
 .lean();

 const propertyMap = new Map(
   properties.map((property) => [property._id.toString(), property]),
 );
 const orderedProperties = paginatedIds
   .map((id: mongoose.Types.ObjectId) => propertyMap.get(id.toString()))
   .filter(Boolean);

 return NextResponse.json({
 properties: orderedProperties,
 total,
 page,
 totalPages: Math.ceil(total / limit),
 limit,
 });
}
