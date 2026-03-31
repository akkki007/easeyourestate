import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import Lead from "@/lib/db/models/Lead";
import { isValidObjectId } from "@/lib/helpers/sanitize";
import { agentLeadUpdateSchema } from "@/lib/validations/agent";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = agentLeadUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();

  const lead = await Lead.findOne({
    _id: id,
    $or: [
      { recipientId: user._id },
      { assignedToUserId: user._id },
      { ownerId: user._id },
    ],
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { status, note, followUpDate } = parsed.data;
  const trimmedNote = note?.trim();
  const nextFollowUpDate = followUpDate?.trim();

  if (trimmedNote) {
    lead.notes.push({
      authorId: user._id,
      text: trimmedNote,
      createdAt: new Date(),
    });
  }

  if (status && status !== lead.status) {
    lead.status = status;
    lead.statusHistory.push({
      status,
      changedBy: user._id,
      note: trimmedNote,
      changedAt: new Date(),
    });

    if (status === "contacted" || status === "follow_up" || status === "visited") {
      lead.lastContactedAt = new Date();
    }

    if (status === "converted") {
      lead.convertedAt = new Date();
    }
  } else if (trimmedNote) {
    lead.statusHistory.push({
      status: lead.status,
      changedBy: user._id,
      note: trimmedNote,
      changedAt: new Date(),
    });
  }

  if (followUpDate !== undefined) {
    lead.followUpDate = nextFollowUpDate || undefined;
  }

  await lead.save();

  const populatedLead = await Lead.findById(id)
    .populate("propertyId", "title slug location price media status")
    .populate("buyerId", "name email phone avatar")
    .populate("assignedToUserId", "name email")
    .lean();

  return NextResponse.json({ lead: populatedLead });
}
