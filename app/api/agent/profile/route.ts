import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import AgentProfile from "@/lib/db/models/AgentProfile";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import { requireRole } from "@/lib/auth/roles";
import { agentProfileUpdateSchema } from "@/lib/validations/agent";
import { slugify } from "@/lib/helpers/slug";

function buildDefaultProfile(user: { _id: string; name?: { first?: string; last?: string }; email?: string; phone?: string; avatar?: string }) {
  const displayName = [user.name?.first, user.name?.last].filter(Boolean).join(" ").trim() || "Agent";
  const baseSlug = slugify(displayName) || `agent-${user._id.slice(-6)}`;

  return {
    slug: baseSlug,
    displayName,
    agencyName: "",
    bio: "",
    phone: user.phone || "",
    email: user.email || "",
    avatar: user.avatar || "",
    bannerImage: "",
    experienceYears: 0,
    serviceAreas: [] as string[],
    specialties: [] as string[],
    languages: [] as string[],
    officeAddress: {
      line1: "",
      line2: "",
      locality: "",
      city: "",
      state: "",
      pincode: "",
    },
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
    },
    isPublic: true,
    ratingSnapshot: {
      average: 0,
      count: 0,
    },
  };
}

async function resolveUniqueSlug(baseValue: string, userId: string) {
  const baseSlug = slugify(baseValue) || `agent-${userId.slice(-6)}`;
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await AgentProfile.findOne({ slug: candidate }).select("userId").lean();
    if (!existing || existing.userId?.toString() === userId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

export async function GET(req: NextRequest) {
  const user = await requireRole(req, ["agent"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const [dbUser, existingProfile, activeListings, totalListings] = await Promise.all([
    User.findById(user._id).select("name email phone avatar").lean(),
    AgentProfile.findOne({ userId: user._id }).lean(),
    Property.countDocuments({ listedBy: user._id, listingType: "agent", status: "active", deletedAt: null }),
    Property.countDocuments({ listedBy: user._id, listingType: "agent", deletedAt: null }),
  ]);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const defaults = buildDefaultProfile({
    _id: user._id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    avatar: dbUser.avatar,
  });

  return NextResponse.json({
    profile: {
      ...defaults,
      ...existingProfile,
      userId: user._id.toString(),
      activeListings,
      totalListings,
    },
  });
}

export async function PUT(req: NextRequest) {
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

  const parsed = agentProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const dbUser = await User.findById(user._id).select("name email phone avatar").lean();
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const input = parsed.data;
  const baseDisplayName = input.displayName || [dbUser.name?.first, dbUser.name?.last].filter(Boolean).join(" ").trim() || "Agent";
  const slug = await resolveUniqueSlug(input.agencyName || baseDisplayName, user._id.toString());

  const updates = {
    slug,
    displayName: baseDisplayName,
    agencyName: input.agencyName || "",
    bio: input.bio || "",
    phone: input.phone || dbUser.phone || "",
    email: input.email || dbUser.email || "",
    avatar: input.avatar || dbUser.avatar || "",
    bannerImage: input.bannerImage || "",
    experienceYears: input.experienceYears ?? 0,
    serviceAreas: input.serviceAreas ?? [],
    specialties: input.specialties ?? [],
    languages: input.languages ?? [],
    officeAddress: {
      line1: input.officeAddress?.line1 || "",
      line2: input.officeAddress?.line2 || "",
      locality: input.officeAddress?.locality || "",
      city: input.officeAddress?.city || "",
      state: input.officeAddress?.state || "",
      pincode: input.officeAddress?.pincode || "",
    },
    socialLinks: {
      website: input.socialLinks?.website || "",
      instagram: input.socialLinks?.instagram || "",
      facebook: input.socialLinks?.facebook || "",
      linkedin: input.socialLinks?.linkedin || "",
      youtube: input.socialLinks?.youtube || "",
    },
    isPublic: input.isPublic ?? true,
  };

  const profile = await AgentProfile.findOneAndUpdate(
    { userId: user._id },
    { $set: { userId: user._id, ...updates } },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  return NextResponse.json({ profile });
}
