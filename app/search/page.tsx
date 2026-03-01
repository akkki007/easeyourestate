"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, ChevronRight, SlidersHorizontal, Loader2, Home, Star as LucideStar, LayoutGrid, List } from "lucide-react";
import Navbar from "@/components/Navbar";
import AdvancedPropertyCard from "@/components/AdvancedPropertyCard";
import SearchSidebar from "@/components/SearchSidebar";

function SearchResults() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<any[]>([]);
    const [suggested, setSuggested] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filters state from URL
    const city = searchParams.get("city") || "Bangalore";
    const query = searchParams.get("query") || "";
    const purpose = searchParams.get("purpose") || "Rent";

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/properties/search?${searchParams.toString()}`);
                const data = await res.json();
                setListings(data.listings || []);
                setTotal(data.pagination?.total || 0);

                if (!data.listings || data.listings.length === 0) {
                    const sugRes = await fetch(`/api/properties/search?city=${city}&limit=3`);
                    const sugData = await sugRes.json();
                    setSuggested(sugData.listings || []);
                }
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchParams, city]);

    const handleFilterChange = (newFilters: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value as string);
            } else {
                params.delete(key);
            }
        });
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <SearchSidebar
                        initialFilters={Object.fromEntries(searchParams.entries())}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Results Area */}
                    <div className="flex-1 space-y-6">
                        {/* Breadcrumbs & Sorting */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <nav className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                                <a href="/" className="hover:text-teal-600">Home</a>
                                <span className="text-gray-300">/</span>
                                <span className="hover:text-teal-600 cursor-pointer">{city}</span>
                                {query && (
                                    <>
                                        <span className="text-gray-300">/</span>
                                        <span className="text-gray-900">{query}</span>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Results Title */}
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                {total} - Flats, Apartments for {purpose?.toLowerCase() === "rent" ? "Rent" : "Sale"} in {query || city} | Flats in {query || city}
                            </h1>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Finding the best properties for you...</p>
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {listings.map((listing) => (
                                    <AdvancedPropertyCard key={listing.id} {...listing} />
                                ))}

                                {/* Top Builder Projects Section */}
                                <div className="mt-12">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Top Builder Projects</h2>
                                        <button className="text-teal-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                            View All
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="group cursor-pointer">
                                                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-2">
                                                    <img
                                                        src={`https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80&sig=${i}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        alt="Builder project"
                                                    />
                                                </div>
                                                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">Premium Residency {i}</h3>
                                                <p className="text-xs text-gray-500">By Apex Builders</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* No Results State */
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
                                <p className="text-gray-500 mb-10 max-w-md mx-auto">
                                    We couldn't find any properties matching your exact criteria in {query || city}.
                                    Try adjusting your filters or search in a broader area.
                                </p>

                                {suggested.length > 0 && (
                                    <div className="text-left mt-16 pt-16 border-t border-gray-50">
                                        <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                            <LucideStar className="w-5 h-5 text-amber-400 fill-amber-400" />
                                            Suggested Properties in {city}
                                        </h3>
                                        <div className="flex flex-col gap-6">
                                            {suggested.map((listing) => (
                                                <AdvancedPropertyCard key={listing.id} {...listing} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Helper icons for no-results
function StarIcon({ className, fill }: { className?: string; fill?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={fill || "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
