import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import { createPropertySchema } from "@/lib/validations/property";
import { propertySlug } from "@/lib/utils/slug";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const dbUser = await User.findOne({ clerkId: userId, deletedAt: null });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found. Complete onboarding first." }, { status: 404 });
  }

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
