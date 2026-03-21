import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { isValidObjectId } from "@/lib/helpers/sanitize";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsString = searchParams.get("ids");

    if (!idsString) {
      return NextResponse.json({ error: "Property IDs are required" }, { status: 400 });
    }

    const ids = idsString.split(",").map((id) => id.trim()).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "Invalid Property IDs" }, { status: 400 });
    }

    if (ids.length > 3) {
      return NextResponse.json({ error: "Maximum 3 properties can be compared" }, { status: 400 });
    }

    if (!ids.every(isValidObjectId)) {
      return NextResponse.json({ error: "One or more invalid property IDs" }, { status: 400 });
    }

    await dbConnect();

    const properties = await Property.find({ _id: { $in: ids } })
      .select("title price specs amenities location media listedBy propertyType")
      .populate("listedBy", "name phone email avatar role");

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("GET /api/properties/compare error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
