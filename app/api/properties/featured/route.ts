import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sp = req.nextUrl.searchParams;
    const city = sp.get("city");
    const limit = Math.min(Number(sp.get("limit")) || 10, 30);
    const page = Math.max(Number(sp.get("page")) || 1, 1);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      status: "active",
      deletedAt: null,
      "featured.isFeatured": true,
      $or: [
        { "featured.featuredUntil": { $gte: new Date() } },
        { "featured.featuredUntil": null },
      ],
    };

    if (city) {
      filter["location.city"] = { $regex: new RegExp(city, "i") };
    }

    const [listings, total] = await Promise.all([
      Property.find(filter)
        .sort({ "featured.featuredUntil": -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("slug title purpose category propertyType price location specs media featured")
        .lean(),
      Property.countDocuments(filter),
    ]);

    const properties = listings.map((p: any) => ({
      id: p._id.toString(),
      slug: p.slug,
      title: p.title,
      purpose: p.purpose,
      category: p.category,
      propertyType: p.propertyType,
      price: p.price,
      location: {
        city: p.location.city,
        locality: p.location.locality,
        address: p.location.address,
      },
      specs: p.specs,
      media: p.media?.images?.[0] ? { primary: p.media.images[0].url } : null,
      featured: p.featured,
    }));

    return NextResponse.json({
      properties,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Featured API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
