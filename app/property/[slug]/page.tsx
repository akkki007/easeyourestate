"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
    Share2,
    ChevronLeft,
    ChevronRight,
    Home,
    Sparkles,
    Check,
    Lock,
} from "lucide-react";
import PropertyActions from "@/components/property/PropertyActions";
import SavedPropertyButton from "@/components/SavedPropertyButton";
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
    rental_details?: {
        monthly_rent: number;
        security_deposit: number;
        available_from: Date;
        pet_friendly: boolean;
    };
    pg_details?: {
        monthly_rent: number;
        security_deposit: number;
        sharing_type: string[];
        meals_included: boolean;
        gender_preference: string;
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
    const { token, user, isAuthenticated } = useAuth();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [similarProperties, setSimilarProperties] = useState<any[]>([]);

    // Contact request flow
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState("");

    // Check existing request status on load
    useEffect(() => {
        if (!token || !slug) return;
        fetch(`/api/contact-requests?propertySlug=${slug}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.request) setRequestStatus(data.request.status);
            })
            .catch(() => {});
    }, [token, slug]);

    const handleGetOwnerDetails = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/property/${slug}`);
            return;
        }
        setShowConsentModal(true);
    };

    const handleSubmitRequest = async () => {
        setRequestLoading(true);
        setRequestError("");
        try {
            const res = await fetch("/api/contact-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ propertySlug: slug }),
            });
            const data = await res.json();
            if (!res.ok && res.status !== 200) {
                setRequestError(data.error || "Failed to submit request.");
                return;
            }
            setRequestStatus(data.status || "pending");
            setShowConsentModal(false);
            toast.success(data.message || "Request submitted successfully!");
        } catch {
            setRequestError("Something went wrong. Please try again.");
        } finally {
            setRequestLoading(false);
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

    // Log property view for authenticated users
    useEffect(() => {
        if (!property?._id || !token) return;
        fetch(`/api/user/viewed-properties/${property._id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
    }, [property?._id, token]);

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
                <Home className="w-16 h-16 text-text-tertiary" />
                <h1 className="text-2xl font-bold text-foreground">Property Not Found</h1>
                <p className="text-muted-foreground">{error || "The property you're looking for doesn't exist."}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-accent text-primary-foreground rounded-xl hover:bg-accent-hover transition-colors"
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
        <div className="min-h-screen bg-secondary/30 text-foreground transition-colors duration-300">
            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-semibold"
                    >
                        <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span>Back to Search</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <SavedPropertyButton
                            propertyId={property._id}
                            inline
                            className="relative top-auto right-auto bg-card border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10"
                        />
                        <button className="p-2.5 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10 transition-all">
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
                                        <span className="px-3 py-1 bg-primary text-primary-foreground text-[11px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                                            {property.propertyType.replace(/_/g, " ")}
                                        </span>
                                        <span className="px-3 py-1 bg-secondary text-secondary-foreground text-[11px] font-bold rounded-full uppercase tracking-widest border border-border">
                                            For {property.purpose}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span>{property.location.address.line1}, {property.location.locality}, {property.location.city}</span>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">
                                        {property.purpose === "sell" ? "Total Price" : "Monthly Rent"}
                                    </p>
                                    <p className="text-4xl font-black text-primary">
                                        ₹{formatPrice(property.purpose === "sell" ? property.price.amount : property.rental_details?.monthly_rent || property.pg_details?.monthly_rent || 0)}
                                    </p>
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
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <Home className="w-20 h-20 text-muted-foreground" />
                                        </div>
                                    )}
                                    {hasImages && (
                                        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={prevImage} className="p-3 rounded-full bg-card/90 text-foreground shadow-xl hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-110">
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button onClick={nextImage} className="p-3 rounded-full bg-card/90 text-foreground shadow-xl hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-110">
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
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-primary-foreground font-bold text-lg">
                                                    +{images.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Specs Bar */}
                        <div className="bg-background/50 rounded-3xl p-2 border border-border flex flex-wrap gap-2">
                            {[
                                { icon: Bed, label: `${property.specs.bedrooms} BHK`, sub: "Bedrooms" },
                                { icon: Bath, label: `${property.specs.bathrooms}`, sub: "Bathrooms" },
                                { icon: Square, label: `${property.specs.area?.builtUp || property.specs.area?.superBuiltUp}`, sub: property.specs.area?.unit || "sqft" },
                                { icon: Car, label: totalParking > 0 ? `${totalParking}` : "No", sub: "Parking" },
                            ].map((spec, i) => (
                                <div key={i} className="flex-1 min-w-[120px] bg-card rounded-2xl p-4 flex items-center gap-4 border border-border shadow-sm">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-inner">
                                        <spec.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-foreground leading-none mb-1">{spec.label}</p>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{spec.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overview / Description */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                Overview
                            </h2>
                            <div className="prose prose-purple max-w-none text-muted-foreground leading-relaxed text-lg">
                                {property.description}
                            </div>
                        </div>

                        {/* Detailed Specs Grid */}
                        <div className="bg-card rounded-3xl border border-border p-8 space-y-8">
                            <h2 className="text-xl font-bold text-foreground">Property Details</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12">
                                {[
                                    { label: "Property Type", value: property.propertyType, icon: Building2 },
                                    { label: "Category", value: property.category, icon: Sparkles },
                                    { label: "Furnishing", value: property.specs.furnishing || "None", icon: Home },
                                    { label: "Facing", value: property.specs.facing || "N/A", icon: MapPin },
                                    { label: "Total Floors", value: property.specs.totalFloors || "N/A", icon: Building2 },
                                    { label: "Floor Number", value: property.specs.floorNumber || "N/A", icon: ArrowLeft },
                                    { label: "Age of Property", value: property.specs.age || "New", icon: Calendar },
                                    { label: "Possession", value: property.specs.possessionStatus?.replace(/_/g, '') || "Ready", icon: Check },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                        <div className="flex items-center gap-2 group">
                                            <item.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                            <p className="text-sm font-bold text-foreground capitalize leading-none">{item.value.toString().replace(/_/g, '')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenities Section */}
                        {property.amenities.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                    Amenities
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {property.amenities.map((amenity, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-background border border-transparent hover:border-primary hover:bg-card transition-all flex items-center gap-3 group">
                                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-sm border border-border group-hover:scale-110 transition-transform">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {amenity.replace(/_/g, "")}
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
                            <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl p-8 space-y-8">
                                <div>
                                    <div className="flex items-end gap-1 mb-1">
                                        <p className="text-4xl font-black text-foreground">
                                            ₹{formatPrice(property.purpose === "sell" ? property.price.amount : property.rental_details?.monthly_rent || property.pg_details?.monthly_rent || 0)}
                                        </p>
                                        {property.purpose !== "sell" && (
                                            <span className="text-sm text-muted-foreground font-bold mb-1">/ Month</span>
                                        )}
                                    </div>
                                    {property.price.negotiable && (
                                        <div className="flex items-center gap-1.5 text-primary-foreground bg-primary w-fit px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3" />
                                            Negotiable Price
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                                        {property.purpose === "sell" ? (
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Estimated EMI</span>
                                                    <span className="text-foreground font-bold">₹{Math.round(property.price.amount * 0.0075).toLocaleString()}/mo</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Monthly Maintenance</span>
                                                    <span className="text-foreground font-bold">₹{property.price.maintenance || 0}</span>
                                                </div>
                                            </>
                                        ) : property.purpose === "pg" ? (
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Security Deposit</span>
                                                    <span className="text-foreground font-bold">₹{formatPrice(property.pg_details?.security_deposit || 0)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Sharing Type</span>
                                                    <span className="text-foreground font-bold">{property.pg_details?.sharing_type?.join(", ")}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Meals Included</span>
                                                    <span className="text-foreground font-bold">{property.pg_details?.meals_included ? "Yes" : "No"}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Security Deposit</span>
                                                    <span className="text-foreground font-bold">₹{formatPrice(property.rental_details?.security_deposit || 0)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Pet Friendly</span>
                                                    <span className="text-foreground font-bold">{property.rental_details?.pet_friendly ? "Yes" : "No"}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground font-medium">Available From</span>
                                                    <span className="text-foreground font-bold">{property.rental_details?.available_from ? new Date(property.rental_details.available_from).toLocaleDateString() : "Immediate"}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {requestStatus === "pending" ? (
                                    <div className="bg-warning/10 border border-warning/30 rounded-2xl p-5 space-y-2">
                                        <div className="flex items-center gap-2 text-warning font-bold text-sm">
                                            <Loader2 className="w-4 h-4" />
                                            Request Under Review
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Your request has been submitted. Our team will verify and share the owner details via SMS shortly.
                                        </p>
                                    </div>
                                ) : requestStatus === "approved" ? (
                                    <div className="bg-success/10 border border-success/30 rounded-2xl p-5 space-y-2">
                                        <div className="flex items-center gap-2 text-success font-bold text-sm">
                                            <Check className="w-4 h-4" />
                                            Request Approved
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Owner details have been sent to your registered mobile number via SMS.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleGetOwnerDetails}
                                            className="w-full py-3 bg-primary hover:bg-primary text-primary-foreground font-black rounded-2xl transition-all flex items-center justify-center gap-3 group"
                                        >
                                            <Phone className="w-6 h-6 animate-pulse group-hover:animate-none" />
                                            Get Owner Details
                                        </button>
                                        <p className="text-center text-xs text-muted-foreground">
                                            Our team will verify and share the details with you
                                        </p>
                                    </div>
                                )}

                                {/* Buyer Actions */}
                                {(!user || user.role === "buyer" || user.role === "tenant") && (
                                    <div className="pt-6 border-t border-border">
                                        <PropertyActions
                                            property={property}
                                            token={token}
                                            isAuthenticated={isAuthenticated}
                                        />
                                    </div>
                                )}

                                {/* Consent Modal */}
                                {showConsentModal && (
                                    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-[9999]">
                                        <div className="bg-card p-8 rounded-2xl w-[420px] max-w-[95vw] shadow-2xl border border-border">
                                            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Phone className="w-7 h-7 text-primary" />
                                            </div>
                                            <h2 className="text-lg font-bold text-foreground text-center mb-2">
                                                Request Owner Details
                                            </h2>
                                            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                                                By clicking &quot;Yes, I agree&quot;, you consent to share your contact details with the EaseYourEstate team. Our team will verify and contact you with the owner details shortly.
                                            </p>
                                            {requestError && (
                                                <p className="text-xs text-error text-center mb-4">{requestError}</p>
                                            )}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setShowConsentModal(false);
                                                        setRequestError("");
                                                    }}
                                                    className="flex-1 py-3 border border-border text-foreground rounded-xl hover:bg-muted text-sm font-medium transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSubmitRequest}
                                                    disabled={requestLoading}
                                                    className="flex-1 py-3 bg-primary hover:bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                                                >
                                                    {requestLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                    Yes, I agree
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-4 border-t border-border">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl overflow-hidden shadow-sm">
                                        {property.listedBy.avatar ? (
                                            <img src={property.listedBy.avatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span>{property.listedBy.name?.first?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-foreground leading-none mb-1">
                                            {property.listedBy.name ? `${property.listedBy.name.first} ${property.listedBy.name.last}` : "Property Owner"}
                                        </p>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none">{property.listingType} Profile</p>
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
                            <h2 className="text-3xl font-extrabold text-foreground">Similar Properties Nearby</h2>
                            <Link href={`/search?city=${property.location.city}&query=${property.location.locality}`} className="text-primary font-black text-sm hover:underline flex items-center gap-1 group">
                                View All Suggested
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {similarProperties.map((p) => (
                                <Link key={p.id} href={`/property/${p.slug}`} className="group cursor-pointer space-y-4">
                                    <div className="aspect-[4/3] rounded-3xl bg-muted overflow-hidden relative border border-border">
                                        {p.media?.primary ? (
                                            <img src={p.media.primary} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-background">
                                                <Home className="w-12 h-12 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur rounded-xl text-xs font-black text-foreground shadow-sm">
                                            {formatPrice(p.purpose === "sell" ? p.price.amount : p.rental_details?.monthly_rent || p.pg_details?.monthly_rent || 0)}
                                            {p.purpose !== "sell" && " / Mo"}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                            {p.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                            <p className="text-sm text-muted-foreground font-medium truncate">{p.location.locality}, {p.location.city}</p>
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
