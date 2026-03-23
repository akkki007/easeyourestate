"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, ArrowLeft, Star } from "lucide-react";
import Navbar from "@/components/Navbar";

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            const ids = searchParams.get("ids");
            if (!ids) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/properties/compare?ids=${ids}`);
                const data = await res.json();
                setProperties(data.properties || []);
            } catch (error) {
                console.error("Error fetching comparison properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">No properties to compare</h1>
                <p className="text-secondary mb-8">Select up to 3 properties from the search results to compare them side-by-side.</p>
                <Link href="/search" className="btn-primary">
                    Go to Search
                </Link>
            </div>
        );
    }

    const allAmenities = Array.from(new Set(properties.flatMap(p => p.amenities || []))).slice(0, 6);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 pt-24">
                <div className="mb-10 w-full max-w-3xl">
                    <button onClick={() => router.back()} className="mb-6 flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to previous
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">The Property Portfolio</h1>
                    <p className="text-muted-foreground text-lg">A side-by-side evaluation of your shortlisted architectural selections.</p>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
                    {properties.map((property) => (
                        <div key={property._id} className="min-w-[320px] w-[350px] sm:w-[380px] shrink-0 snap-start bg-card rounded-[2rem] border border-border p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            {/* Image Section */}
                            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-5">
                                <Image
                                    src={property.media?.images?.find((img: any) => img.isPrimary)?.url || property.media?.images?.[0]?.url || "/placeholder-property.jpg"}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                />
                                <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                    Featured Selection
                                </span>
                            </div>

                            {/* Details Section */}
                            <div className="px-3 pb-3 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-foreground leading-tight mb-1">{property.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4 truncate">
                                    {property.location.locality}, {property.location.city}
                                </p>

                                <div className="mb-6">
                                    <div className="text-3xl font-bold text-accent">₹{(property.price.amount / 10000000).toFixed(2)} Cr</div>
                                </div>

                                {/* Property Specs List */}
                                <div className="space-y-1 mb-8">
                                    <div className="flex justify-between items-center py-3 border-b border-border">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Area</span>
                                        <span className="text-sm font-bold text-foreground">
                                            {property.specs?.area?.carpet || property.specs?.area?.builtUp || "N/A"} {property.specs?.area?.unit || "sq.ft"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-border">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bedrooms</span>
                                        <span className="text-sm font-bold text-foreground">{property.specs?.bedrooms || "N/A"} Suites</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-border">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bathrooms</span>
                                        <span className="text-sm font-bold text-foreground">
                                            {property.specs?.bathrooms || property.specs?.bedrooms || "N/A"} Baths
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-border">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property Type</span>
                                        <span className="text-sm font-bold text-foreground capitalize">
                                            {property.propertyType?.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-border">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Listed By</span>
                                        <span className="text-sm font-bold text-foreground capitalize">
                                            {property.listedBy?.name?.first || "N/A"} {property.listedBy?.name?.last || ""}
                                        </span>
                                    </div>
                                </div>

                                {/* Key Amenities Chips */}
                                {property.amenities && property.amenities.length > 0 && (
                                    <div className="mb-8 flex-1">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-3">Key Amenities</span>
                                        <div className="flex flex-wrap gap-2">
                                            {property.amenities.slice(0, 4).map((amenity: string) => (
                                                <span key={amenity} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
                                                    <Star className="w-3 h-3 mr-1.5 fill-accent/40" />
                                                    {amenity}
                                                </span>
                                            ))}
                                            {property.amenities.length > 4 && (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs font-semibold">
                                                    +{property.amenities.length - 4} More
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Link href={`/property/${property.slug || property._id}`} className="mt-auto w-full py-4 bg-accent text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center hover:bg-accent-hover transition-colors shadow-sm">
                                    View Full Dossier
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompareContent />
        </Suspense>
    );
}
