import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAuth } from"@/lib/auth/auth";
import SiteVisit from"@/lib/db/models/SiteVisit";
import Property from"@/lib/db/models/Property";

export async function POST(req: NextRequest) {
 try {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const body = await req.json();
 const { propertyId, preferredDate, preferredTime, notes } = body;

 if (!propertyId || !preferredDate || !preferredTime) {
 return NextResponse.json({ error:"Missing required fields"}, { status: 400 });
 }

 await dbConnect();

 const property = await Property.findById(propertyId);
 if (!property) {
 return NextResponse.json({ error:"Property not found"}, { status: 404 });
 }

 const siteVisit = await SiteVisit.create({
 propertyId,
 buyerId: user._id,
 preferredDate,
 preferredTime,
 notes,
 status:"pending",
 });

 return NextResponse.json({ siteVisit }, { status: 201 });
 } catch (error) {
 console.error("POST /api/site-visits error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}

export async function GET(req: NextRequest) {
 try {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 await dbConnect();

 const siteVisits = await SiteVisit.find({ buyerId: user._id })
 .populate("propertyId","title location price media")
 .sort({ preferredDate: 1, preferredTime: 1 });

 return NextResponse.json({ siteVisits });
 } catch (error) {
 console.error("GET /api/site-visits error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}
