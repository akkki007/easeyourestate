import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import AgentSubscription from "@/lib/db/models/AgentSubscription";
import Property from "@/lib/db/models/Property";
import AgentTeamMember from "@/lib/db/models/AgentTeamMember";

/**
 * Plan definitions with limits
 */
const PLAN_DEFINITIONS = {
  free: {
    name: "Free",
    listingLimit: 1,
    teamSeatLimit: 1,
    featuredSlotLimit: 0,
    bulkUploadEnabled: false,
  },
  basic: {
    name: "Basic",
    listingLimit: 5,
    teamSeatLimit: 2,
    featuredSlotLimit: 1,
    bulkUploadEnabled: true,
  },
  pro: {
    name: "Professional",
    listingLimit: 25,
    teamSeatLimit: 5,
    featuredSlotLimit: 5,
    bulkUploadEnabled: true,
  },
  premium: {
    name: "Premium",
    listingLimit: 100,
    teamSeatLimit: 20,
    featuredSlotLimit: 20,
    bulkUploadEnabled: true,
  },
};

/**
 * GET /api/agent/subscription
 * Fetch agent's current subscription plan and usage
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let subscription = await AgentSubscription.findOne({ agentId: user._id }).lean();

  // Create default free subscription if it doesn't exist
  if (!subscription) {
    subscription = await AgentSubscription.create({
      agentId: user._id,
      planCode: "free",
      status: "active",
      listingLimit: PLAN_DEFINITIONS.free.listingLimit,
      teamSeatLimit: PLAN_DEFINITIONS.free.teamSeatLimit,
      featuredSlotLimit: PLAN_DEFINITIONS.free.featuredSlotLimit,
      bulkUploadEnabled: PLAN_DEFINITIONS.free.bulkUploadEnabled,
      usage: {
        listings: 0,
        teamSeats: 1, // agent counts as 1 seat
        featuredSlots: 0,
      },
    });
  }

  // Calculate current usage
  const [listingCount, teamMemberCount, featuredCount] = await Promise.all([
    Property.countDocuments({
      listedBy: user._id,
      listingType: "agent",
      deletedAt: null,
    }),
    AgentTeamMember.countDocuments({
      agentId: user._id,
      status: "active",
    }),
    Property.countDocuments({
      listedBy: user._id,
      listingType: "agent",
      "featured.isFeatured": true,
      deletedAt: null,
    }),
  ]);

  const planDef = PLAN_DEFINITIONS[subscription.planCode as keyof typeof PLAN_DEFINITIONS] || PLAN_DEFINITIONS.free;

  // Update usage in subscription doc
  await AgentSubscription.updateOne(
    { _id: subscription._id },
    {
      $set: {
        usage: {
          listings: listingCount,
          teamSeats: teamMemberCount + 1, // +1 for the agent owner
          featuredSlots: featuredCount,
        },
      },
    }
  );

  const updatedSubscription = await AgentSubscription.findById(subscription._id).lean();

  return NextResponse.json({
    subscription: {
      _id: updatedSubscription?._id.toString(),
      planCode: updatedSubscription?.planCode,
      planName: planDef.name,
      status: updatedSubscription?.status,
      usage: updatedSubscription?.usage,
      limits: {
        listings: updatedSubscription?.listingLimit,
        teamSeats: updatedSubscription?.teamSeatLimit,
        featuredSlots: updatedSubscription?.featuredSlotLimit,
      },
      features: {
        bulkUploadEnabled: updatedSubscription?.bulkUploadEnabled,
      },
      startsAt: updatedSubscription?.startsAt,
      endsAt: updatedSubscription?.endsAt,
      autoRenew: updatedSubscription?.autoRenew,
    },
    available: {
      listings: Math.max(0, (updatedSubscription?.listingLimit || 1) - (updatedSubscription?.usage?.listings || 0)),
      teamSeats: Math.max(0, (updatedSubscription?.teamSeatLimit || 1) - (updatedSubscription?.usage?.teamSeats || 1)),
      featuredSlots: Math.max(0, (updatedSubscription?.featuredSlotLimit || 0) - (updatedSubscription?.usage?.featuredSlots || 0)),
    },
  });
}
