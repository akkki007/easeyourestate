"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { unlockOwnerDetail, MAX_UNLOCKS } from "@/store/creditSlice";
import { useAuth } from "@/lib/auth/AuthContext";
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
  Lock,
} from "lucide-react";
import PropertyActions from "@/components/property/PropertyActions";
import PriceTrendChart from "@/components/property/PriceTrendChart";
import toast from "react-hot-toast";

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
  const dispatch = useDispatch();
  const slug = params?.slug as string;
  const { token, user, isAuthenticated } = useAuth();

  const ownerUnlocks = useSelector((state: RootState) => state.credits.ownerUnlocks);
  const unlockedProperties = useSelector((state: RootState) => state.credits.unlockedProperties);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [ownerDetails, setOwnerDetails] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState("");
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const isAlreadyUnlocked = unlockedProperties.includes(slug);
  const remainingUnlocks = MAX_UNLOCKS - ownerUnlocks;
  const canUnlock = remainingUnlocks > 0 || isAlreadyUnlocked;

  // Persist credits to localStorage
  useEffect(() => {
    localStorage.setItem("ownerUnlocks", ownerUnlocks.toString());
    localStorage.setItem("unlockedProperties", JSON.stringify(unlockedProperties));
  }, [ownerUnlocks, unlockedProperties]);

  const handleGetOwnerDetails = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!canUnlock) {
      setShowLimitPopup(true);
      return;
    }

    setOwnerLoading(true);
    setOwnerError("");

    try {
      const res = await fetch(`/api/properties/${slug}/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setOwnerError(data.error || "Failed to get owner details.");
        return;
      }

      setOwnerDetails(data.owner);
      if (!isAlreadyUnlocked) {
        dispatch(unlockOwnerDetail(slug));
      }
    } catch {
      setOwnerError("Failed to get owner details.");
    } finally {
      setOwnerLoading(false);
    }
  };

  useEffect(() => {
    if (!property) return;

    // Fetch similar properties in the same locality/city
    const fetchSimilar = async () => {
      try {
        const params = new URLSearchParams({
          city: property.location.city,
          query: property.location.locality,
          limit: "3"
        });
        const res = await fetch(`/api/properties/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out the current property
          setSimilarProperties(data.listings.filter((p: any) => p.slug !== slug));
        }
      } catch (err) {
        console.error("Failed to fetch similar properties", err);
      }
    };

    fetchSimilar();
  }, [property, slug]);

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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all font-semibold"
          >
            <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span>Back to Search</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-full border transition-all ${isLiked
                ? "bg-purple-50 border-purple-100 text-purple-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-100 hover:bg-purple-50"
                }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-100 hover:bg-purple-50 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Upper Content - Title & Image */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-full uppercase tracking-widest border border-purple-100">
                      {property.propertyType.replace(/_/g, " ")}
                    </span>
                    <span className="px-3 py-1 bg-violet-50 text-violet-700 text-[11px] font-bold rounded-full uppercase tracking-widest border border-violet-100">
                      For {property.purpose}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <span>{property.location.address.line1}, {property.location.locality}, {property.location.city}</span>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Total Price</p>
                  <p className="text-4xl font-black text-purple-600">₹{formatPrice(property.price.amount)}</p>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-[21/10]">
                <div className="md:col-span-3 relative rounded-2xl overflow-hidden group">
                  {hasImages ? (
                    <img
                      src={images[currentImageIndex]?.url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={property.title}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Home className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  {hasImages && (
                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={prevImage} className="p-3 rounded-full bg-white/90 text-gray-800 shadow-xl hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button onClick={nextImage} className="p-3 rounded-full bg-white/90 text-gray-800 shadow-xl hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex flex-col gap-4">
                  {images.slice(1, 4).map((img, i) => (
                    <div key={i} className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setCurrentImageIndex(images.indexOf(img))}>
                      <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      {i === 2 && images.length > 4 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Specs Bar */}
            <div className="bg-gray-50/50 rounded-3xl p-2 border border-gray-100 flex flex-wrap gap-2">
              {[
                { icon: Bed, label: `${property.specs.bedrooms} BHK`, sub: "Bedrooms" },
                { icon: Bath, label: `${property.specs.bathrooms}`, sub: "Bathrooms" },
                { icon: Square, label: `${property.specs.area?.builtUp || property.specs.area?.superBuiltUp}`, sub: property.specs.area?.unit || "sqft" },
                { icon: Car, label: totalParking > 0 ? `${totalParking}` : "No", sub: "Parking" },
              ].map((spec, i) => (
                <div key={i} className="flex-1 min-w-[120px] bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-50 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <spec.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 leading-none mb-1">{spec.label}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{spec.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Overview / Description */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                Overview
              </h2>
              <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed text-lg">
                {property.description}
              </div>
            </div>

            {/* Detailed Specs Grid */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
              <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12">
                {[
                  { label: "Property Type", value: property.propertyType, icon: Building2 },
                  { label: "Category", value: property.category, icon: Sparkles },
                  { label: "Furnishing", value: property.specs.furnishing || "None", icon: Home },
                  { label: "Facing", value: property.specs.facing || "N/A", icon: MapPin },
                  { label: "Total Floors", value: property.specs.totalFloors || "N/A", icon: Building2 },
                  { label: "Floor Number", value: property.specs.floorNumber || "N/A", icon: ArrowLeft },
                  { label: "Age of Property", value: property.specs.age || "New", icon: Calendar },
                  { label: "Possession", value: property.specs.possessionStatus?.replace(/_/g, ' ') || "Ready", icon: Check },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <div className="flex items-center gap-2 group">
                      <item.icon className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-gray-800 capitalize leading-none">{item.value.toString().replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Section */}
            {property.amenities.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-purple-100 hover:bg-white transition-all flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 capitalize">
                        {amenity.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Trends */}
            <PriceTrendChart
              localitySlug={property.location.locality.toLowerCase().replace(/\s+/g, '-')}
              localityName={property.location.locality}
            />
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 space-y-8">
                <div>
                  <div className="flex items-end gap-1 mb-1">
                    <p className="text-4xl font-black text-gray-900">₹{formatPrice(property.price.amount)}</p>
                    {property.price.pricePerSqft && (
                      <span className="text-sm text-gray-400 font-bold mb-1">/ Month</span>
                    )}
                  </div>
                  {property.price.negotiable && (
                    <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold border border-purple-100 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Negotiable Price
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Estimated EMI</span>
                      <span className="text-gray-900 font-bold">₹{Math.round(property.price.amount * 0.0075).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Monthly Maintenance</span>
                      <span className="text-gray-900 font-bold">₹{property.price.maintenance || 0}</span>
                    </div>
                  </div>
                </div>

                {ownerDetails ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                      <Check className="w-4 h-4" />
                      Owner Details Unlocked
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <a href={`tel:${ownerDetails.phone}`} className="text-sm font-bold text-gray-900 hover:text-purple-600">
                            {ownerDetails.phone}
                          </a>
                        </div>
                      </div>
                      {ownerDetails.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <a href={`mailto:${ownerDetails.email}`} className="text-sm font-bold text-gray-900 hover:text-purple-600">
                              {ownerDetails.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleGetOwnerDetails}
                      disabled={ownerLoading}
                      className="w-full py-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-black rounded-2xl shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3 group"
                    >
                      {ownerLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : !canUnlock ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        <Phone className="w-6 h-6 animate-pulse group-hover:animate-none" />
                      )}
                      {ownerLoading
                        ? "Loading..."
                        : `Get ${property.listingType === "owner" ? "Owner" : "Agent"} Details`}
                    </button>
                    {!isAlreadyUnlocked && (
                      <p className="text-center text-xs text-gray-400">
                        {remainingUnlocks > 0
                          ? `${remainingUnlocks} of ${MAX_UNLOCKS} free unlocks remaining`
                          : "You've used all free unlocks"}
                      </p>
                    )}
                    {ownerError && (
                      <p className="text-center text-xs text-red-500">{ownerError}</p>
                    )}
                  </div>
                )}

                {/* Buyer Actions */}
                {user?.role === "buyer" && (
                  <div className="pt-6 border-t border-gray-100">
                    <PropertyActions
                      property={property}
                      token={token}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                )}

                {/* Limit reached popup */}
                {showLimitPopup && (
                  <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-[9999]">
                    <div className="bg-white/95 p-8 rounded-2xl w-96 text-center shadow-2xl border border-gray-200">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-purple-600" />
                      </div>
                      <h2 className="text-lg font-semibold mb-2">Unlock Limit Reached</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        You have used all {MAX_UNLOCKS} free owner detail unlocks. Upgrade to premium for unlimited access.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowLimitPopup(false)}
                          className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => setShowLimitPopup(false)}
                          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-xl overflow-hidden border border-purple-100">
                    {property.listedBy.avatar ? (
                      <img src={property.listedBy.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span>{property.listedBy.name?.first?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 leading-none mb-1">
                      {property.listedBy.name ? `${property.listedBy.name.first} ${property.listedBy.name.last}` : "Property Owner"}
                    </p>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest leading-none">{property.listingType} Profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section (Dynamic) */}
        {similarProperties.length > 0 && (
          <div className="mt-24 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-gray-900">Similar Properties Nearby</h2>
              <Link href={`/search?city=${property.location.city}&query=${property.location.locality}`} className="text-purple-600 font-black text-sm hover:underline flex items-center gap-1 group">
                View All Suggested
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((p) => (
                <Link key={p.id} href={`/property/${p.slug}`} className="group cursor-pointer space-y-4">
                  <div className="aspect-[4/3] rounded-3xl bg-gray-100 overflow-hidden relative border border-gray-100">
                    {p.media?.primary ? (
                      <img src={p.media.primary} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Home className="w-12 h-12 text-gray-200" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-xs font-black text-gray-900 shadow-sm">
                      {formatPrice(p.price.amount)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      <p className="text-sm text-gray-500 font-medium truncate">{p.location.locality}, {p.location.city}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
