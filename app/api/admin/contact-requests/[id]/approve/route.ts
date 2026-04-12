import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import ContactRequest from "@/lib/db/models/ContactRequest";
import mongoose from "mongoose";
import { sendSMS } from "@/lib/sms";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/contact-requests/:id/approve
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await dbConnect();

  const contactReq = await ContactRequest.findById(id);
  if (!contactReq) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (contactReq.status === "approved") {
    return NextResponse.json({ message: "Already approved" });
  }

  contactReq.status = "approved";
  contactReq.approvedAt = new Date();
  await contactReq.save();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://easeyourestate.vercel.app";
  const propertyLink = `${baseUrl}/property/${contactReq.propertySlug}`;

  // SMS to buyer with owner details
  if (contactReq.buyerPhone) {
    const buyerMsg = `Hi ${contactReq.buyerName}, your request for "${contactReq.propertyTitle}" has been approved! Owner: ${contactReq.ownerName}, Phone: ${contactReq.ownerPhone}. View: ${propertyLink}`;
    await sendSMS(contactReq.buyerPhone, buyerMsg).catch((err) =>
      console.error("Buyer SMS failed:", err)
    );
  }

  // SMS to owner that someone is interested
  if (contactReq.ownerPhone) {
    const ownerMsg = `Hi ${contactReq.ownerName}, ${contactReq.buyerName} has requested details for your property "${contactReq.propertyTitle}" in ${contactReq.propertyLocality}, ${contactReq.propertyCity}. They will contact you soon. View: ${propertyLink}`;
    await sendSMS(contactReq.ownerPhone, ownerMsg).catch((err) =>
      console.error("Owner SMS failed:", err)
    );
  }

  return NextResponse.json({
    message: "Request approved. SMS sent to both buyer and owner.",
  });
}
