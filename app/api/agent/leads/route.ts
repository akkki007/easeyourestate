import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth/roles";
import Lead from "@/lib/db/models/Lead";

export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim();

  const filter: Record<string, unknown> = {
    $or: [
      { recipientId: user._id },
      { assignedToUserId: user._id },
      { ownerId: user._id },
    ],
  };

  if (status) {
    filter.status = status;
  }

  if (query) {
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$and = [
      {
        $or: [
          { name: regex },
          { phone: regex },
          { message: regex },
        ],
      },
    ];
  }

  const leads = await Lead.find(filter)
    .populate("propertyId", "title slug location price media status")
    .populate("buyerId", "name email phone avatar")
    .populate("assignedToUserId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ leads });
}
