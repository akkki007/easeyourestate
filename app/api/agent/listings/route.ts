import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { requireRole } from "@/lib/auth/roles";
import { createPropertySchema } from "@/lib/validations/property";
import { propertySlug } from "@/lib/helpers/slug";

/**
 * GET /api/agent/listings
 * Fetch agent's listings with filtering and pagination
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    listedBy: user._id,
    listingType: "agent",
    deletedAt: null,
  };

  if (status) {
    filter.status = status;
  }

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("slug title status price location media metrics specs propertyType purpose category createdAt updatedAt")
      .lean(),
    Property.countDocuments(filter),
  ]);

  const listings = properties.map((p) => ({
    id: p._id.toString(),
    slug: p.slug,
    title: p.title,
    status: p.status,
    purpose: p.purpose,
    category: p.category,
    propertyType: p.propertyType,
    price: p.price,
    location: {
      locality: p.location?.locality,
      city: p.location?.city,
    },
    metrics: p.metrics,
    media: p.media?.images?.[0] ? { primary: p.media.images[0].url } : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return NextResponse.json({
    listings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/agent/listings
 * Create a new property listing as an agent
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [lng, lat] = [data.location.coordinates.lng, data.location.coordinates.lat];

  let slug = propertySlug(data.title, data.location.locality);
  const existing = await Property.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const property = await Property.create({
    slug,
    listedBy: user._id,
    listingType: "agent",
    purpose: data.purpose,
    category: data.category,
    propertyType: data.propertyType,
    title: data.title,
    description: data.description,
    price: {
      amount: data.price.amount,
      currency: data.price.currency,
      pricePerSqft: data.price.pricePerSqft,
      negotiable: data.price.negotiable,
      maintenance: data.price.maintenance,
      deposit: data.price.deposit,
    },
    specs: data.specs,
    amenities: data.amenities,
    location: {
      address: data.location.address,
      locality: data.location.locality,
      city: data.location.city,
      state: data.location.state,
      pincode: data.location.pincode,
      coordinates: { type: "Point" as const, coordinates: [lng, lat] },
    },
    media: {
      images: (data.media?.images ?? []).map((img, i) => ({
        url: img.url,
        publicId: img.publicId,
        caption: img.caption,
        isPrimary: i === 0,
        order: i,
      })),
    },
    status: "draft",
  });

  return NextResponse.json(
    {
      id: property._id.toString(),
      slug: property.slug,
      status: property.status,
    },
    { status: 201 }
  );
}
