import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import AgentTeamMember from "@/lib/db/models/AgentTeamMember";
import { isValidObjectId } from "@/lib/helpers/sanitize";

/**
 * DELETE /api/agent/team/:memberId
 * Remove a team member
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { memberId } = await params;

  if (!isValidObjectId(memberId)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
  }

  const member = await AgentTeamMember.findById(memberId);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Authorization: only the agent can remove team members
  if (member.agentId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark as removed
  member.status = "removed";
  member.removedAt = new Date();
  await member.save();

  return NextResponse.json({
    message: "Team member removed successfully",
  });
}
