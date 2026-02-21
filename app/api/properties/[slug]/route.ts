import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Property from "@/lib/db/models/Property";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    await dbConnect();

    const property = await Property.findOne({
      slug,
      deletedAt: { $exists: false },
    })
      .populate("listedBy", "name email avatar")
      .lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count
    await Property.updateOne({ slug }, { $inc: { "metrics.views": 1 } });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
