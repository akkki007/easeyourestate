import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const city = sp.get("city");

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match: Record<string, any> = {
    status: "active",
    $or: [
      { "location.locality": new RegExp(escaped, "i") },
      { title: new RegExp(escaped, "i") },
    ],
  };
  if (city) match["location.city"] = new RegExp(`^${city}$`, "i");

  const results = await Property.aggregate([
    { $match: match },
    {
      $group: {
        _id: { locality: "$location.locality", city: "$location.city" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
    {
      $project: {
        _id: 0,
        locality: "$_id.locality",
        city: "$_id.city",
        count: 1,
      },
    },
  ]);

  return NextResponse.json({ suggestions: results });
}
