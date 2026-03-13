import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {
    try {

        await dbConnect();

        const { searchParams } = new URL(req.url);

        const city = searchParams.get("city");

        const filter: any = {
            status: "active",
            deletedAt: { $exists: false }
        };

        if (city) {
            filter["location.city"] = city;
        }

        const properties = await Property.find(filter)
            .select(
                "title slug price location.coordinates location.locality specs.bedrooms media.images"
            )
            .limit(100)
            .lean();

        const results = properties.map((p: any) => ({
            id: p._id,
            title: p.title,
            price: p.price?.amount,
            bhk: p.specs?.bedrooms,
            locality: p.location?.locality,
            lat: p.location?.coordinates?.coordinates[1],
            lng: p.location?.coordinates?.coordinates[0],
            image: p.media?.images?.[0]?.url || null,
            slug: p.slug
        }));

        return NextResponse.json({ properties: results });

    } catch (error) {

        console.error("Map API error", error);

        return NextResponse.json(
            { error: "Failed to fetch map properties" },
            { status: 500 }
        );
    }
}