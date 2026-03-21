import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/auth";
import SiteVisit from "@/lib/db/models/SiteVisit";
import { isValidObjectId } from "@/lib/helpers/sanitize";

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid site visit ID" }, { status: 400 });
    }

    const body = await req.json();
    const { preferredDate, preferredTime, notes, status } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await dbConnect();

    const siteVisit = await SiteVisit.findById(id);
    if (!siteVisit) {
      return NextResponse.json({ error: "Site visit not found" }, { status: 404 });
    }

    if (siteVisit.buyerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (preferredDate) siteVisit.preferredDate = preferredDate;
    if (preferredTime) siteVisit.preferredTime = preferredTime;
    if (notes !== undefined) siteVisit.notes = String(notes).slice(0, 1000);
    if (status) siteVisit.status = status;

    await siteVisit.save();

    return NextResponse.json({ siteVisit });
  } catch (error) {
    console.error("PUT /api/site-visits/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid site visit ID" }, { status: 400 });
    }

    await dbConnect();

    const siteVisit = await SiteVisit.findById(id);
    if (!siteVisit) {
      return NextResponse.json({ error: "Site visit not found" }, { status: 404 });
    }

    if (siteVisit.buyerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await SiteVisit.findByIdAndDelete(id);

    return NextResponse.json({ message: "Site visit cancelled successfully" });
  } catch (error) {
    console.error("DELETE /api/site-visits/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
