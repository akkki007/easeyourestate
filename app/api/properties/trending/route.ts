import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sp = req.nextUrl.searchParams;
    const city = sp.get("city");
    const limit = Math.min(Number(sp.get("limit")) || 10, 30);

    // Trending properties: highest views + inquiries in recent period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      status: "active",
      deletedAt: null,
    };

    if (city) {
      filter["location.city"] = { $regex: new RegExp(city, "i") };
    }

    // Get top properties by engagement (views + inquiries + favorites)
    const trendingProperties = await Property.find(filter)
      .sort({ "metrics.views": -1, "metrics.inquiries": -1, "metrics.favorites": -1 })
      .limit(limit)
      .select("slug title purpose category propertyType price location specs media metrics")
      .lean();

    const properties = trendingProperties.map((p: any) => ({
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
      metrics: {
        views: p.metrics?.views || 0,
        inquiries: p.metrics?.inquiries || 0,
        favorites: p.metrics?.favorites || 0,
      },
    }));

    // Also get trending localities
    const trendingLocalities = await Property.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { locality: "$location.locality", city: "$location.city" },
          totalViews: { $sum: "$metrics.views" },
          totalInquiries: { $sum: "$metrics.inquiries" },
          propertyCount: { $sum: 1 },
          avgPrice: { $avg: "$price.amount" },
        },
      },
      { $sort: { totalViews: -1, totalInquiries: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          locality: "$_id.locality",
          city: "$_id.city",
          totalViews: 1,
          totalInquiries: 1,
          propertyCount: 1,
          avgPrice: { $round: ["$avgPrice", 0] },
        },
      },
    ]);

    return NextResponse.json({
      properties,
      localities: trendingLocalities,
    });
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
