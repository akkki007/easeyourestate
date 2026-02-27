import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { requireAuth } from "@/lib/auth/auth";
import { createPropertySchema } from "@/lib/validations/property";
import { propertySlug } from "@/lib/utils/slug";

// ── Search / List properties ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { status: "active", deletedAt: null };

  const city = sp.get("city");
  if (city) filter["location.city"] = new RegExp(`^${city}$`, "i");

  const purpose = sp.get("purpose");
  if (purpose) filter.purpose = purpose;

  const category = sp.get("category");
  if (category) filter.category = category;

  const propertyType = sp.get("propertyType");
  if (propertyType) filter.propertyType = propertyType;

  const bedrooms = sp.get("bedrooms");
  if (bedrooms) {
    const num = parseInt(bedrooms, 10);
    if (num >= 4) {
      filter["specs.bedrooms"] = { $gte: 4 };
    } else if (num > 0) {
      filter["specs.bedrooms"] = num;
    }
  }

  const furnishing = sp.get("furnishing");
  if (furnishing) filter["specs.furnishing"] = furnishing;

  const possessionStatus = sp.get("possessionStatus");
  if (possessionStatus) filter["specs.possessionStatus"] = possessionStatus;

  const listingType = sp.get("listingType");
  if (listingType) filter.listingType = listingType;

  const priceMin = sp.get("priceMin");
  const priceMax = sp.get("priceMax");
  if (priceMin || priceMax) {
    filter["price.amount"] = {};
    if (priceMin) filter["price.amount"].$gte = parseInt(priceMin, 10);
    if (priceMax) filter["price.amount"].$lte = parseInt(priceMax, 10);
  }

  // Text search on locality / title
  const q = sp.get("q");
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { "location.locality": new RegExp(escaped, "i") },
      { title: new RegExp(escaped, "i") },
    ];
  }

  // Sort
  const sort = sp.get("sort");
  let sortObj: Record<string, 1 | -1> = { publishedAt: -1 };
  if (sort === "price_asc") sortObj = { "price.amount": 1 };
  else if (sort === "price_desc") sortObj = { "price.amount": -1 };
  else if (sort === "newest") sortObj = { publishedAt: -1 };

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select("slug title price specs location media purpose category propertyType amenities listingType featured publishedAt")
      .lean(),
    Property.countDocuments(filter),
  ]);

  return NextResponse.json({
    properties,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  });
}

// ── Create property ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const dbUser = await requireAuth(req);
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const role = dbUser.role;
  if (role !== "owner" && role !== "agent" && role !== "builder") {
    return NextResponse.json({ error: "Only owners, agents, and builders can create listings." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const [lng, lat] = [data.location.coordinates.lng, data.location.coordinates.lat];

  let slug = propertySlug(data.title, data.location.locality);
  const existing = await Property.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const property = await Property.create({
    slug,
    listedBy: dbUser._id,
    listingType: role as "owner" | "agent" | "builder",
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

  return NextResponse.json({
    id: property._id.toString(),
    slug: property.slug,
    status: property.status,
  });
}
