import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { escapeRegex } from "@/lib/helpers/sanitize";

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
      filter["location.city"] = { $regex: new RegExp(escapeRegex(city), "i") };
    }

    const escapedQuery = escapeRegex(query);
    filter.$or = [
      { "location.locality": { $regex: new RegExp(escapedQuery, "i") } },
      { title: { $regex: new RegExp(escapedQuery, "i") } },
      { "location.address.line1": { $regex: new RegExp(escapedQuery, "i") } },
    ];

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
      type: "Society",
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Locality API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
