import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import PriceTrend from "@/lib/db/models/PriceTrend";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        await dbConnect();

        // Get price trends for the last 12 months
        const trends = await PriceTrend.find({ localitySlug: slug })
            .sort({ month: 1 })
            .limit(12);

        // If no data, return some mock data for demonstration if desired,
        // or just an empty list. The PRD implies we should have this data.
        // For now, I'll return whatever is in the DB.

        return NextResponse.json({ trends });
    } catch (error) {
        console.error("GET /api/localities/[slug]/price-trends error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
