import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import PropertyCard, { type PropertyCardProps } from "./PropertyCard";

type RawProperty = {
  _id: { toString(): string };
  slug: string;
  title: string;
  purpose: string;
  category: string;
  propertyType: string;
  price?: { amount: number; currency?: string };
  rental_details?: { monthly_rent: number; security_deposit?: number };
  pg_details?: { monthly_rent: number; security_deposit?: number };
  location: { city: string; locality: string };
  media?: { images?: { url: string; isPrimary?: boolean }[] };
};

async function getFeaturedProperties(): Promise<PropertyCardProps[]> {
  try {
    await dbConnect();
    const docs = (await Property.find({ status: "active", deletedAt: null })
      .sort({ publishedAt: -1 })
      .limit(8)
      .select(
        "slug title purpose category propertyType price rental_details pg_details location media",
      )
      .lean()) as unknown as RawProperty[];

    return docs.map((p) => {
      const primary =
        p.media?.images?.find((i) => i.isPrimary)?.url ??
        p.media?.images?.[0]?.url ??
        null;
      return {
        id: p._id.toString(),
        slug: p.slug,
        title: p.title,
        purpose: p.purpose,
        category: p.category,
        propertyType: p.propertyType,
        price: p.price,
        rental_details: p.rental_details,
        pg_details: p.pg_details,
        location: { city: p.location.city, locality: p.location.locality },
        media: { primary },
      };
    });
  } catch {
    return [];
  }
}

export default async function FeaturedProperties() {
  const properties = await getFeaturedProperties();

  return (
    <section className="py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              Trending Listings
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Newest properties on EaseYourEstate
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Hand-picked, verified homes ready for you to explore — directly from owners, no brokerage.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            View all properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No properties listed yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
