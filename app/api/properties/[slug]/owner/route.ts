import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const dbUser = await requireAuth(req);
  if (!dbUser) {
    return NextResponse.json({ error: "Please login to view owner details" }, { status: 401 });
  }

  await dbConnect();

  const { slug } = await params;
  const property = await Property.findOne({ slug, status: "active" }).select("listedBy").lean();
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const owner = await User.findById(property.listedBy).select("name phone email").lean();
  if (!owner) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  // Increment phone reveals metric
  await Property.updateOne({ slug }, { $inc: { "metrics.phoneReveals": 1 } });

  return NextResponse.json({
    owner: {
      name: `${owner.name.first} ${owner.name.last}`.trim(),
      phone: owner.phone || "Not available",
      email: owner.email,
    },
  });
}
