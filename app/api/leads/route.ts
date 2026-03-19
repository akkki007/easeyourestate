import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAuth } from"@/lib/auth/auth";
import Lead from"@/lib/db/models/Lead";
import Property from"@/lib/db/models/Property";

export async function POST(req: NextRequest) {
 try {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const body = await req.json();
 const { propertyId, name, phone, message, intent } = body;

 if (!propertyId || !name || !phone || !message) {
 return NextResponse.json({ error:"Missing required fields"}, { status: 400 });
 }

 await dbConnect();

 const property = await Property.findById(propertyId);
 if (!property) {
 return NextResponse.json({ error:"Property not found"}, { status: 404 });
 }

 const lead = await Lead.create({
 buyerId: user._id,
 ownerId: property.listedBy,
 propertyId,
 name,
 phone,
 message,
 intent: intent ||"info",
 status:"pending",
 messages: [
 {
 senderId: user._id,
 text: message,
 sentAt: new Date(),
 },
 ],
 });

 return NextResponse.json({ lead }, { status: 201 });
 } catch (error) {
 console.error("POST /api/leads error:", error);
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

 // Get own enquiry history (as a buyer)
 const leads = await Lead.find({ buyerId: user._id })
 .populate("propertyId","title location price media")
 .sort({ createdAt: -1 });

 return NextResponse.json({ leads });
 } catch (error) {
 console.error("GET /api/leads error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}
