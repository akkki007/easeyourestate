import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import User from"@/lib/db/models/User";
import Property from"@/lib/db/models/Property";
import ViewedProperty from"@/lib/db/models/ViewedProperty";
import { requireAuth } from"@/lib/auth/auth";

export async function GET(req: NextRequest) {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 await dbConnect();

 const role = user.role;

 if (role ==="buyer"|| role ==="tenant") {
 const [dbUser, viewedCount] = await Promise.all([
 User.findById(user._id)
 .select("preferences.favoriteProperties preferences.savedSearches")
 .lean(),
 ViewedProperty.countDocuments({ userId: user._id }),
 ]);

 const savedCount = dbUser?.preferences?.favoriteProperties?.length || 0;
 const savedSearchesCount = dbUser?.preferences?.savedSearches?.length || 0;

 return NextResponse.json({
 stats: {
 viewedProperties: viewedCount,
 savedProperties: savedCount,
 savedSearches: savedSearchesCount,
 appointments: 0, // placeholder until site-visits module is built
 },
 });
 }

 if (role ==="owner"|| role ==="agent"|| role ==="builder") {
 const [activeListings, totalViews] = await Promise.all([
 Property.countDocuments({ listedBy: user._id, status:"active", deletedAt: null }),
 Property.aggregate([
 { $match: { listedBy: user._id, deletedAt: null } },
 { $group: { _id: null, totalViews: { $sum:"$metrics.views"}, totalInquiries: { $sum:"$metrics.inquiries"} } },
 ]),
 ]);

 const aggregated = totalViews[0] || { totalViews: 0, totalInquiries: 0 };

 return NextResponse.json({
 stats: {
 activeListings,
 totalViews: aggregated.totalViews,
 totalInquiries: aggregated.totalInquiries,
 appointments: 0, // placeholder until site-visits module is built
 },
 });
 }

 return NextResponse.json({
 stats: {
 viewedProperties: 0,
 savedProperties: 0,
 savedSearches: 0,
 appointments: 0,
 },
 });
}
