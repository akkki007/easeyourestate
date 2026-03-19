import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import Property from"@/lib/db/models/Property";

export async function GET(req: NextRequest) {
 try {
 await dbConnect();

 const { searchParams } = new URL(req.url);

 const lat = Number(searchParams.get("lat"));
 const lng = Number(searchParams.get("lng"));

 if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
 return NextResponse.json(
 { error:"Valid lat (-90 to 90) and lng (-180 to 180) are required"},
 { status: 400 }
 );
 }

 const maxDistance = Math.min(
 Math.max(Number(searchParams.get("maxDistance")) || 5000, 100),
 50000
 );

 const properties = await Property.find({
 status:"active",
 deletedAt: null,
"location.coordinates": {
 $near: {
 $geometry: {
 type:"Point",
 coordinates: [lng, lat],
 },
 $maxDistance: maxDistance,
 },
 },
 }).limit(20);

 const formatted = properties.map((p: any) => ({
 _id: p._id,
 title: p.title,
 price: p.price?.amount,
 locality: p.location?.locality,
 slug: p.slug,
 image: p.media?.images?.[0]?.url,
 lat: p.location?.coordinates?.coordinates?.[1],
 lng: p.location?.coordinates?.coordinates?.[0],
 }));

 return NextResponse.json({ properties: formatted });
 } catch (error) {
 console.error("Nearby API error:", error);
 return NextResponse.json(
 { error:"Failed to fetch nearby properties"},
 { status: 500 }
 );
 }
}
