"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Calendar,
  Building2,
  Phone,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles,
  Check,
} from "lucide-react";

type Property = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  purpose: string;
  category: string;
  propertyType: string;
  listingType: string;
  status: string;
  price: {
    amount: number;
    currency: string;
    pricePerSqft?: number;
    negotiable: boolean;
    maintenance?: number;
    deposit?: number;
  };
  specs: {
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;
    totalFloors?: number;
    floorNumber?: number;
    facing?: string;
    furnishing?: string;
    parking?: { covered: number; open: number };
    area?: { superBuiltUp?: number; builtUp?: number; carpet?: number; unit?: string };
    age?: string;
    possessionStatus?: string;
    possessionDate?: string;
  };
  amenities: string[];
  location: {
    address: { line1: string; line2?: string; landmark?: string };
    locality: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { coordinates: [number, number] };
  };
  media: {
    images: Array<{ url: string; caption?: string; isPrimary: boolean }>;
    videos?: Array<{ url: string; thumbnail: string }>;
    floorPlan?: { url: string };
  };
  listedBy: {
    _id: string;
    name: { first: string; last: string };
    email: string;
    avatar?: string;
  };
  metrics: {
    views: number;
    inquiries: number;
    favorites: number;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const amenityIcons: Record<string, string> = {
  power_backup: "bolt",
  lift: "elevator",
  security: "shield",
  parking: "local_parking",
  gym: "fitness_center",
  pool: "pool",
  garden: "park",
  clubhouse: "holiday_village",
  play_area: "sports_soccer",
  water_supply: "water_drop",
  gas_pipeline: "propane_tank",
  internet: "wifi",
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/properties/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Property not found");
        return res.json();
      })
      .then((data) => {
        setProperty(data.property);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const formatPrice = (n: number) => {
    if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)} Cr`;
    if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(2)} L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const nextImage = () => {
    if (!property?.media?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === property.media.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!property?.media?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.media.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Home className="w-16 h-16 text-tertiary" />
        <h1 className="text-2xl font-bold text-primary">Property Not Found</h1>
        <p className="text-secondary">{error || "The property you're looking for doesn't exist."}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = property.media?.images || [];
  const hasImages = images.length > 0;
  const totalParking = (property.specs?.parking?.covered || 0) + (property.specs?.parking?.open || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full border transition-colors ${
                isLiked
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-border text-tertiary hover:text-primary hover:border-border-hover"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button className="p-2 rounded-full border border-border text-tertiary hover:text-primary hover:border-border-hover transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-hover aspect-[16/10]">
              {hasImages ? (
                <>
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={images[currentImageIndex]?.caption || property.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-20 h-20 text-tertiary" />
                </div>
              )}
              {/* Purpose Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium capitalize">
                  For {property.purpose}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Location */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-secondary">
                <MapPin className="w-5 h-5 text-tertiary" />
                <span>
                  {property.location.address.line1}
                  {property.location.address.line2 && `, ${property.location.address.line2}`}
                  , {property.location.locality}, {property.location.city},{" "}
                  {property.location.state} - {property.location.pincode}
                </span>
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.specs?.bedrooms !== undefined && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Bed className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-lg font-semibold text-primary">{property.specs.bedrooms}</p>
                  <p className="text-sm text-tertiary">Bedrooms</p>
                </div>
              )}
              {property.specs?.bathrooms !== undefined && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Bath className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-lg font-semibold text-primary">{property.specs.bathrooms}</p>
                  <p className="text-sm text-tertiary">Bathrooms</p>
                </div>
              )}
              {property.specs?.area?.superBuiltUp && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Square className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-lg font-semibold text-primary">
                    {property.specs.area.superBuiltUp}
                  </p>
                  <p className="text-sm text-tertiary">{property.specs.area.unit || "sqft"}</p>
                </div>
              )}
              {totalParking > 0 && (
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Car className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-lg font-semibold text-primary">{totalParking}</p>
                  <p className="text-sm text-tertiary">Parking</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Description</h2>
              <p className="text-secondary whitespace-pre-line wrap-break-word">{property.description}</p>
            </div>

            {/* Property Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Property Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-tertiary">Property Type</span>
                  <span className="text-primary font-medium capitalize">
                    {property.propertyType.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-tertiary">Category</span>
                  <span className="text-primary font-medium capitalize">{property.category}</span>
                </div>
                {property.specs?.furnishing && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-tertiary">Furnishing</span>
                    <span className="text-primary font-medium capitalize">
                      {property.specs.furnishing === "semi"
                        ? "Semi-Furnished"
                        : property.specs.furnishing === "fully"
                        ? "Fully Furnished"
                        : "Unfurnished"}
                    </span>
                  </div>
                )}
                {property.specs?.facing && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-tertiary">Facing</span>
                    <span className="text-primary font-medium uppercase">{property.specs.facing}</span>
                  </div>
                )}
                {property.specs?.floorNumber !== undefined && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-tertiary">Floor</span>
                    <span className="text-primary font-medium">
                      {property.specs.floorNumber}
                      {property.specs.totalFloors ? ` of ${property.specs.totalFloors}` : ""}
                    </span>
                  </div>
                )}
                {property.specs?.balconies !== undefined && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-tertiary">Balconies</span>
                    <span className="text-primary font-medium">{property.specs.balconies}</span>
                  </div>
                )}
                {property.specs?.possessionStatus && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-tertiary">Possession</span>
                    <span className="text-primary font-medium capitalize">
                      {property.specs.possessionStatus === "ready"
                        ? "Ready to Move"
                        : "Under Construction"}
                    </span>
                  </div>
                )}
                {property.specs?.age && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-tertiary">Property Age</span>
                    <span className="text-primary font-medium">{property.specs.age}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-tertiary">Listed By</span>
                  <span className="text-primary font-medium capitalize">{property.listingType}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-3 rounded-xl bg-hover"
                    >
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm text-primary capitalize">
                        {amenity.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price & Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-tertiary mb-1">Price</p>
                <p className="text-3xl font-bold text-accent">
                  ₹{formatPrice(property.price.amount)}
                </p>
                {property.price.pricePerSqft && (
                  <p className="text-sm text-secondary mt-1">
                    ₹{property.price.pricePerSqft.toLocaleString("en-IN")}/sqft
                  </p>
                )}
                {property.price.negotiable && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-success-bg text-success text-xs">
                    <Sparkles className="w-3 h-3" />
                    Price Negotiable
                  </span>
                )}
              </div>

              {/* Additional Costs for Rent */}
              {(property.purpose === "rent" || property.purpose === "lease" || property.purpose === "pg") && (
                <div className="border-t border-border pt-4 mb-6 space-y-2">
                  {property.price.deposit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-tertiary">Security Deposit</span>
                      <span className="text-primary font-medium">
                        ₹{property.price.deposit.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {property.price.maintenance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-tertiary">Maintenance</span>
                      <span className="text-primary font-medium">
                        ₹{property.price.maintenance.toLocaleString("en-IN")}/month
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Button */}
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors">
                <Phone className="w-5 h-5" />
                Contact {property.listingType === "owner" ? "Owner" : property.listingType === "agent" ? "Agent" : "Builder"}
              </button>

              {/* Listed By Info */}
              {property.listedBy && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-tertiary mb-3">Listed by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-hover flex items-center justify-center overflow-hidden">
                      {property.listedBy.avatar ? (
                        <img
                          src={property.listedBy.avatar}
                          alt={`${property.listedBy.name.first} ${property.listedBy.name.last}`.trim()}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-tertiary">
                          {property.listedBy.name?.first?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-primary">{property.listedBy.name ? `${property.listedBy.name.first} ${property.listedBy.name.last}`.trim() : "User"}</p>
                      <p className="text-sm text-tertiary capitalize">{property.listingType}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-primary">{property.metrics?.views || 0}</p>
                  <p className="text-xs text-tertiary">Views</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{property.metrics?.inquiries || 0}</p>
                  <p className="text-xs text-tertiary">Inquiries</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{property.metrics?.favorites || 0}</p>
                  <p className="text-xs text-tertiary">Favorites</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
