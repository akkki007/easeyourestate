import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import ContactRequest from "@/lib/db/models/ContactRequest";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/contact-requests/:id/reject
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: { note?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  await dbConnect();

  const contactReq = await ContactRequest.findById(id);
  if (!contactReq) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  contactReq.status = "rejected";
  contactReq.rejectedAt = new Date();
  if (body.note) contactReq.adminNote = body.note.trim();
  await contactReq.save();

  return NextResponse.json({ message: "Request rejected." });
}
