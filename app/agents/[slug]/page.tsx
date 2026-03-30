import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, BriefcaseBusiness, Globe2, MapPin, Languages } from "lucide-react";
import { dbConnect } from "@/lib/db/connection";
import AgentProfile from "@/lib/db/models/AgentProfile";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import PropertyCard from "@/components/PropertyCard";

export default async function AgentPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await dbConnect();

  const profile = await AgentProfile.findOne({ slug, isPublic: true }).lean();
  if (!profile) {
    notFound();
  }

  const [user, listings] = await Promise.all([
    User.findById(profile.userId).select("name avatar email phone").lean(),
    Property.find({
      listedBy: profile.userId,
      listingType: "agent",
      status: "active",
      deletedAt: null,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(12)
      .select("slug title purpose category propertyType status price location media")
      .lean(),
  ]);

  const fullName = profile.displayName || [user?.name?.first, user?.name?.last].filter(Boolean).join(" ").trim() || "Agent";
  const subtitle = profile.agencyName || "Independent Real Estate Agent";
  const serviceAreas = Array.isArray(profile.serviceAreas) ? profile.serviceAreas : [];
  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];
  const languages = Array.isArray(profile.languages) ? profile.languages : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-border bg-card text-3xl font-semibold text-primary shadow-sm">
              {profile.avatar || user?.avatar ? (
                <img src={profile.avatar || user?.avatar || ""} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Agent Profile</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">{fullName}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Listings</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{listings.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{profile.experienceYears || 0} yrs</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Rating</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {profile.ratingSnapshot?.average ? profile.ratingSnapshot.average.toFixed(1) : "New"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {profile.bio || "This agent has not added a public bio yet."}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Highlights</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Specialties</p>
                  <p className="text-sm text-muted-foreground">{specialties.length ? specialties.join(", ") : "Residential buying and selling"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Service Areas</p>
                  <p className="text-sm text-muted-foreground">{serviceAreas.length ? serviceAreas.join(", ") : "Area details coming soon"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Languages className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Languages</p>
                  <p className="text-sm text-muted-foreground">{languages.length ? languages.join(", ") : "English"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Contact</p>
                  <p className="text-sm text-muted-foreground">{profile.email || user?.email || "Email unavailable"}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Inventory</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Active Listings</h2>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No public listings yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This agent profile is live, but there are no active listings to show right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <PropertyCard
                  key={listing._id.toString()}
                  id={listing._id.toString()}
                  slug={listing.slug}
                  title={listing.title}
                  purpose={listing.purpose}
                  category={listing.category}
                  propertyType={listing.propertyType}
                  status={listing.status}
                  price={listing.price}
                  location={{ city: listing.location.city, locality: listing.location.locality }}
                  media={listing.media?.images?.[0] ? { primary: listing.media.images[0].url } : null}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
