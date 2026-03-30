import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import AgentTeamMember from "@/lib/db/models/AgentTeamMember";
import AgentSubscription from "@/lib/db/models/AgentSubscription";
import User from "@/lib/db/models/User";

/**
 * GET /api/agent/team
 * Fetch all active team members for the agent
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const members = await AgentTeamMember.find({
    agentId: user._id,
    status: "active",
  })
    .populate("memberUserId", "name email avatar")
    .populate("invitedBy", "name email")
    .lean();

  return NextResponse.json({
    members: members.map((m) => ({
      id: m._id.toString(),
      memberUserId: m.memberUserId._id.toString(),
      memberName: [m.memberUserId.name?.first, m.memberUserId.name?.last].filter(Boolean).join(" "),
      memberEmail: m.memberUserId.email,
      role: m.role,
      permissions: m.permissions,
      status: m.status,
      invitedAt: m.invitedAt,
      joinedAt: m.joinedAt,
    })),
  });
}

/**
 * POST /api/agent/team/invite
 * Send team invite to another user
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const { email, role } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!role || !["admin", "editor", "viewer"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be admin, editor, or viewer" },
      { status: 400 }
    );
  }

  // Check subscription seat limits
  const subscription = await AgentSubscription.findOne({ agentId: user._id }).lean();
  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const currentMembers = await AgentTeamMember.countDocuments({
    agentId: user._id,
    status: { $in: ["active", "pending"] },
  });

  // +1 for the agent owner
  if (currentMembers + 1 >= subscription.teamSeatLimit) {
    return NextResponse.json(
      {
        error: `Team seat limit reached. Your plan allows ${subscription.teamSeatLimit} total seats.`,
      },
      { status: 403 }
    );
  }

  // Check if already a member
  const existing = await AgentTeamMember.findOne({
    agentId: user._id,
    memberEmail: email.toLowerCase(),
  });

  if (existing) {
    return NextResponse.json(
      { error: "User is already a team member" },
      { status: 409 }
    );
  }

  // For now, we'll create a placeholder entry since we don't have email sending setup
  // In production, you'd send an actual invite email with a signup link
  const member = await AgentTeamMember.create({
    agentId: user._id,
    memberUserId: new mongoose.Types.ObjectId(), // Placeholder
    role,
    permissions: {
      viewListings: true,
      editListings: role !== "viewer",
      deleteListings: role === "admin",
      viewLeads: true,
      updateLeads: role !== "viewer",
      deleteLeads: role === "admin",
      manageTeam: role === "admin",
    },
    status: "pending", // Will become active when user accepts
    invitedBy: user._id,
    invitedAt: new Date(),
  });

  return NextResponse.json(
    {
      message: "Invite sent successfully",
      member: {
        id: member._id.toString(),
        email,
        role: member.role,
        status: member.status,
        invitedAt: member.invitedAt,
      },
    },
    { status: 201 }
  );
}
