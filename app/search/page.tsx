"use client";

import { useState, useEffect, Suspense } from"react";
import { useSearchParams, useRouter } from"next/navigation";
import { Search, MapPin, ChevronDown, ChevronRight, SlidersHorizontal, Loader2, Home, Star as LucideStar, LayoutGrid, List } from"lucide-react";
import Navbar from"@/components/Navbar";
import AdvancedPropertyCard from"@/components/AdvancedPropertyCard";
import SearchSidebar from"@/components/SearchSidebar";
import dynamic from"next/dynamic";

const PropertyMap = dynamic(
 () => import("@/components/PropertyMap"),
 { ssr: false }
);

function SearchResults() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [listings, setListings] = useState<any[]>([]);
 const [mapProperties, setMapProperties] = useState<any[]>([]);
 const [suggested, setSuggested] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const sort = searchParams.get("sort") ||"";
 const [viewMode, setViewMode] = useState("list");


 // Filters state from URL
 const city = searchParams.get("city") ||"Bangalore";
 const query = searchParams.get("query") ||"";
 const purpose = searchParams.get("purpose") ||"Rent";

 useEffect(() => {
 const fetchResults = async () => {
 setLoading(true);
 try {
 const res = await fetch(`/api/properties/search?${searchParams.toString()}`);
 const data = await res.json();
 setListings(data.listings || []);
 setTotal(data.pagination?.total || 0);

 const mapRes = await fetch(`/api/properties/map?${searchParams.toString()}`);
 const mapData = await mapRes.json();
 setMapProperties(mapData.properties || []);

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

 const handleSortChange = (value: string) => {
 const params = new URLSearchParams(searchParams.toString());

 if (value) {
 params.set("sort", value);
 } else {
 params.delete("sort");
 }

 router.push(`/search?${params.toString()}`);
 };

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
 <div className="min-h-screen bg-background flex flex-col">
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
 <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <nav className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
 <a href="/"className="hover:text-primary">Home</a>
 <span className="text-muted-foreground">/</span>
 <span className="hover:text-primary cursor-pointer">{city}</span>
 {query && (
 <>
 <span className="text-muted-foreground">/</span>
 <span className="text-foreground">{query}</span>
 </>
 )}
 </nav>
 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground font-medium">Sort by:</span>

 <select
 value={sort}
 onChange={(e) => handleSortChange(e.target.value)}
 className="border border-border rounded-md px-3 py-1 text-sm bg-card text-foreground"
 >
 <option value="">Relevance</option>
 <option value="price_asc">Price Low → High</option>
 <option value="price_desc">Price High → Low</option>
 <option value="date">Newest</option>
 <option value="popularity">Most Popular</option>
 </select>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => setViewMode("list")}
 className="px-3 py-1 border rounded bg-black text-primary-foreground"
 >
 List
 </button>

 <button
 onClick={() => setViewMode("map")}
 className="px-3 py-1 border rounded bg-black text-primary-foreground"
 >
 Map
 </button>
 </div>


 </div>



 {/* Results Title */}
 <div>
 <h1 className="text-lg font-bold text-foreground leading-tight">
 {total} - Flats, Apartments for {purpose?.toLowerCase() ==="rent"?"Rent":"Sale"} in {query || city} | Flats in {query || city}
 </h1>
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border shadow-sm">
 <Loader2 className="w-10 h-10 text-primary animate-spin mb-4"/>
 <p className="text-muted-foreground font-medium">Finding the best properties for you...</p>
 </div>
 ) : viewMode ==="map"? (

 <PropertyMap properties={mapProperties} />
 ) : listings.length > 0 ? (

 <div className="flex flex-col gap-6">
 {listings.map((listing) => (
 <AdvancedPropertyCard key={listing.id} {...listing} />
 ))}

 {/* Top Builder Projects Section */}
 <div className="mt-12">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-foreground">Top Builder Projects</h2>
 <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
 View All
 <ChevronRight className="w-4 h-4"/>
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="group cursor-pointer">
 <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-2">
 <img
 src={`https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80&sig=${i}`}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform"
 alt="Builder project"
 />
 </div>
 <h3 className="font-bold text-foreground text-sm line-clamp-1">Premium Residency {i}</h3>
 <p className="text-xs text-muted-foreground">By Apex Builders</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 ) : (
 /* No Results State */
 <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
 <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
 <Search className="w-10 h-10 text-muted-foreground"/>
 </div>
 <h2 className="text-2xl font-bold text-foreground mb-2">No Properties Found</h2>
 <p className="text-muted-foreground mb-10 max-w-md mx-auto">
 We couldn't find any properties matching your exact criteria in {query || city}.
 Try adjusting your filters or search in a broader area.
 </p>

 {suggested.length > 0 && (
 <div className="text-left mt-16 pt-16 border-t border-border">
 <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2">
 <LucideStar className="w-5 h-5 text-warning fill-warning"/>
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
 fill={fill ||"none"}
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 className={className}
 >
 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
 </svg>
 );
}

export default function SearchPage() {
 return (
 <Suspense fallback={
 <div className="flex items-center justify-center min-h-screen">
 <Loader2 className="w-10 h-10 text-primary animate-spin"/>
 </div>
 }>
 <SearchResults />
 </Suspense>
 );
}
