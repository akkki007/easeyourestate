import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city");
        const query = searchParams.get("query");

        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        const filter: any = {
            deletedAt: { $exists: false },
        };

        if (city) {
            filter["location.city"] = { $regex: new RegExp(city, "i") };
        }

        // Search in locality, title, or address
        filter.$or = [
            { "location.locality": { $regex: new RegExp(query, "i") } },
            { title: { $regex: new RegExp(query, "i") } },
            { "location.address.line1": { $regex: new RegExp(query, "i") } },
        ];

        // Note: We are allowing 'draft' status for testing purposes as per user feedback
        // In a real production app, this would likely be restricted to 'active'
        filter.status = { $in: ["active", "draft"] };

        const matchingProperties = await Property.find(filter)
            .limit(10)
            .select("title location propertyType")
            .lean();

        const suggestions = matchingProperties.map((p: any) => ({
            id: p._id.toString(),
            title: p.title,
            locality: p.location.locality,
            city: p.location.city,
            state: p.location.state,
            pincode: p.location.pincode,
            address: p.location.address?.line1 || "",
            type: "Society", // Defaulting to Society as per image, can be refined based on propertyType
        }));

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Locality API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
