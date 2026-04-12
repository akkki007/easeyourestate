import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/auth";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import ContactRequest from "@/lib/db/models/ContactRequest";

// POST — buyer/tenant submits a request for owner details
export async function POST(req: NextRequest) {
  const dbUser = await requireAuth(req);
  if (!dbUser) {
    return NextResponse.json(
      { error: "Please login to request owner details" },
      { status: 401 }
    );
  }

  await dbConnect();

  let body: { propertySlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { propertySlug } = body;
  if (!propertySlug) {
    return NextResponse.json(
      { error: "Property slug is required" },
      { status: 400 }
    );
  }

  // Check for existing pending/approved request
  const property = await Property.findOne({
    slug: propertySlug,
    status: "active",
    deletedAt: null,
  })
    .select("title slug listedBy location")
    .lean();

  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }

  const existing = await ContactRequest.findOne({
    buyerId: dbUser._id,
    propertyId: property._id,
  }).lean();

  if (existing) {
    return NextResponse.json({
      message:
        existing.status === "approved"
          ? "Your request has already been approved. Check your SMS."
          : "Your request is already submitted and under review.",
      status: existing.status,
    });
  }

  // Get owner info
  const owner = await User.findById(property.listedBy)
    .select("name phone email")
    .lean();
  if (!owner) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  // Get buyer info
  const buyer = await User.findById(dbUser._id)
    .select("name phone email")
    .lean();
  if (!buyer) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const contactRequest = await ContactRequest.create({
    buyerId: dbUser._id,
    ownerId: property.listedBy,
    propertyId: property._id,
    buyerName: `${buyer.name.first} ${buyer.name.last}`.trim(),
    buyerPhone: buyer.phone || "",
    buyerEmail: buyer.email,
    ownerName: `${owner.name.first} ${owner.name.last}`.trim(),
    ownerPhone: owner.phone || "",
    ownerEmail: owner.email,
    propertyTitle: property.title,
    propertySlug: property.slug,
    propertyLocality: (property as any).location?.locality || "",
    propertyCity: (property as any).location?.city || "",
  });

  return NextResponse.json(
    {
      message:
        "Your request has been submitted. Our team will verify and share the owner details with you shortly.",
      id: contactRequest._id.toString(),
      status: "pending",
    },
    { status: 201 }
  );
}

// GET — buyer checks their request status for a property
export async function GET(req: NextRequest) {
  const dbUser = await requireAuth(req);
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const propertySlug = searchParams.get("propertySlug");

  if (!propertySlug) {
    return NextResponse.json(
      { error: "propertySlug is required" },
      { status: 400 }
    );
  }

  const request = await ContactRequest.findOne({
    buyerId: dbUser._id,
    propertySlug,
  })
    .select("status createdAt")
    .lean();

  return NextResponse.json({ request: request || null });
}
