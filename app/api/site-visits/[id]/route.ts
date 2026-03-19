import { NextRequest, NextResponse } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { requireAuth } from"@/lib/auth/auth";
import SiteVisit from"@/lib/db/models/SiteVisit";

export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;
 const body = await req.json();
 const { preferredDate, preferredTime, notes, status } = body;

 await dbConnect();

 const siteVisit = await SiteVisit.findById(id);
 if (!siteVisit) {
 return NextResponse.json({ error:"Site visit not found"}, { status: 404 });
 }

 if (siteVisit.buyerId.toString() !== user._id.toString()) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 if (preferredDate) siteVisit.preferredDate = preferredDate;
 if (preferredTime) siteVisit.preferredTime = preferredTime;
 if (notes) siteVisit.notes = notes;
 if (status) siteVisit.status = status;

 await siteVisit.save();

 return NextResponse.json({ siteVisit });
 } catch (error) {
 console.error("PUT /api/site-visits/[id] error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}

export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const user = await requireAuth(req);
 if (!user) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { id } = await params;

 await dbConnect();

 const siteVisit = await SiteVisit.findById(id);
 if (!siteVisit) {
 return NextResponse.json({ error:"Site visit not found"}, { status: 404 });
 }

 if (siteVisit.buyerId.toString() !== user._id.toString()) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 // Instead of hard delete, maybe just mark as cancelled?
 // But the PRD says DELETE /site-visits/:id | Cancel visit
 // I'll mark it as cancelled for data retention, or just delete if that's what's expected.
 // I'll delete it to follow the endpoint strictly.
 await SiteVisit.findByIdAndDelete(id);

 return NextResponse.json({ message:"Site visit cancelled successfully"});
 } catch (error) {
 console.error("DELETE /api/site-visits/[id] error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}
