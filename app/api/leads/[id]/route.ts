import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/auth";
import Lead from "@/lib/db/models/Lead";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const lead = await Lead.findById(id)
            .populate("propertyId", "title location price media")
            .populate("ownerId", "name phone email avatar");

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Only buyer or owner can view the lead
        if (
            lead.buyerId.toString() !== user._id.toString() &&
            lead.ownerId.toString() !== user._id.toString()
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ lead });
    } catch (error) {
        console.error("GET /api/leads/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
