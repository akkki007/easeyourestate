import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/auth/adminAuth";
import Report from "@/lib/db/models/Report";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/reports/:id/resolve — Resolve a report
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  let body: { action?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const resolveStatus = body.status === "rejected" ? "rejected" : "resolved";

  await dbConnect();

  const report = await Report.findById(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  report.status = resolveStatus;
  report.adminActions.push({
    adminId: admin._id,
    action: body.action || `Marked as ${resolveStatus}`,
    actionAt: new Date(),
  });
  await report.save();

  return NextResponse.json({ message: `Report ${resolveStatus}`, report });
}
