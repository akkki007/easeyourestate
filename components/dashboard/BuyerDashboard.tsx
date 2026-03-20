"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Home } from "lucide-react";
import EnquiryCard from "./EnquiryCard";
import SiteVisitCard from "./SiteVisitCard";

interface BuyerDashboardProps {
 user: any;
}

export default function BuyerDashboard({ user }: BuyerDashboardProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("search");
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [savedProperties, setSavedProperties] = useState<any[]>([]);
    const [savedSearches, setSavedSearches] = useState<any[]>([]);
    const [siteVisits, setSiteVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search tab state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [selectedBhk, setSelectedBhk] = useState("");

    const getToken = () => localStorage.getItem("token");

 const fetchData = useCallback(async () => {
 setLoading(true);
 const token = getToken();
 if (!token) return;

 try {
 const headers = { Authorization:`Bearer ${token}`};

 const [enquiriesRes, visitsRes, savedRes, searchesRes] = await Promise.all([
 fetch("/api/leads", { headers }),
 fetch("/api/site-visits", { headers }),
 fetch("/api/user/saved-properties", { headers }),
 fetch("/api/user/saved-searches", { headers }),
 ]);

 const [enquiriesData, visitsData, savedData, searchesData] = await Promise.all([
 enquiriesRes.json(),
 visitsRes.json(),
 savedRes.json(),
 searchesRes.json(),
 ]);

 setEnquiries(enquiriesData.leads || []);
 setSiteVisits(visitsData.siteVisits || []);
 setSavedProperties(savedData.properties || []);
 setSavedSearches(searchesData.savedSearches || []);
 } catch (error) {
 console.error("Error fetching buyer dashboard data:", error);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 if (user) fetchData();
 }, [user, fetchData]);

 const handleUnsave = async (propertyId: string) => {
 const token = getToken();
 if (!token) return;
 try {
 const res = await fetch(`/api/user/saved-properties/${propertyId}`, {
 method:"DELETE",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (res.ok) {
 setSavedProperties((prev) => prev.filter((p) => p._id !== propertyId));
 }
 } catch (error) {
 console.error("Unsave error:", error);
 }
 };

 const handleDeleteSearch = async (searchId: string) => {
 const token = getToken();
 if (!token) return;
 try {
 const res = await fetch(`/api/user/saved-searches/${searchId}`, {
 method:"DELETE",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (res.ok) {
 setSavedSearches((prev) => prev.filter((s) => s._id !== searchId));
 }
 } catch (error) {
 console.error("Delete search error:", error);
 }
 };

 const handleViewSearchResults = (search: any) => {
 const filters = search.filters || {};
 const params = new URLSearchParams();
 for (const [key, value] of Object.entries(filters)) {
 if (value !== undefined && value !== null && value !=="") {
 params.set(key, String(value));
 }
 }
 router.push(`/search?${params.toString()}`);
 };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (selectedCity) params.set("city", selectedCity);
        if (selectedPurpose) params.set("purpose", selectedPurpose);
        if (selectedBhk) params.set("bhk", selectedBhk);
        router.push(`/search?${params.toString()}`);
    };

    const handleCityChip = (city: string) => {
        setSelectedCity(city);
        const params = new URLSearchParams();
        params.set("city", city);
        if (selectedPurpose) params.set("purpose", selectedPurpose);
        if (selectedBhk) params.set("bhk", selectedBhk);
        router.push(`/search?${params.toString()}`);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    const popularCities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai"];
    const bhkOptions = ["1", "2", "3", "4+"];
    const purposeOptions = ["Buy", "Rent"];

    const tabs: { id: string; label: string; count?: number }[] = [
        { id: "search", label: "Search" },
        { id: "enquiries", label: "My Enquiries", count: enquiries.length },
        { id: "saved", label: "Saved Properties", count: savedProperties.length },
        { id: "visits", label: "Scheduled Visits", count: siteVisits.length },
        { id: "searches", label: "Saved Searches", count: savedSearches.length },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                            ${activeTab === tab.id
                                ? "border-accent text-accent"
                                : "border-transparent text-secondary hover:text-primary hover:border-border"
                            }
                        `}
                    >
                        {tab.label}
                        {tab.count != null && tab.count > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-hover text-tertiary text-xs">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                ) : (
                    <>
                        {/* Search Tab */}
                        {activeTab === "search" && (
                            <div className="space-y-6">
                                {/* Search Bar */}
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                                        <Search className="w-5 h-5 text-accent" />
                                        Find Your Perfect Property
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative grow">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                                            <input
                                                type="text"
                                                placeholder="Search by locality, project, or landmark..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                                className="w-full pl-10 pr-4 py-3 bg-hover border border-border rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm"
                                            />
                                        </div>
                                        <div className="relative sm:w-48">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => setSelectedCity(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-hover border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">All Cities</option>
                                                {popularCities.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleSearch}
                                            className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors font-medium text-sm flex items-center justify-center gap-2 sm:w-auto"
                                        >
                                            <Search className="w-4 h-4" />
                                            Search
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                                    {/* Purpose */}
                                    <div>
                                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2.5 block">
                                            Purpose
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {purposeOptions.map((purpose) => (
                                                <button
                                                    key={purpose}
                                                    onClick={() =>
                                                        setSelectedPurpose(
                                                            selectedPurpose === purpose.toLowerCase() ? "" : purpose.toLowerCase()
                                                        )
                                                    }
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                                        selectedPurpose === purpose.toLowerCase()
                                                            ? "bg-accent text-white border-accent"
                                                            : "bg-hover text-secondary border-border hover:border-accent/50 hover:text-primary"
                                                    }`}
                                                >
                                                    <Home className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                                                    {purpose}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* BHK */}
                                    <div>
                                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2.5 block">
                                            BHK
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {bhkOptions.map((bhk) => (
                                                <button
                                                    key={bhk}
                                                    onClick={() =>
                                                        setSelectedBhk(selectedBhk === bhk ? "" : bhk)
                                                    }
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                                        selectedBhk === bhk
                                                            ? "bg-accent text-white border-accent"
                                                            : "bg-hover text-secondary border-border hover:border-accent/50 hover:text-primary"
                                                    }`}
                                                >
                                                    {bhk} BHK
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Popular Cities */}
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Popular Cities
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {popularCities.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => handleCityChip(city)}
                                                className="group flex items-center gap-2 px-4 py-2.5 bg-hover border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all"
                                            >
                                                <MapPin className="w-3.5 h-3.5 text-tertiary group-hover:text-accent transition-colors" />
                                                <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                                                    {city}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Saved Searches */}
                                {savedSearches.length > 0 && (
                                    <div className="bg-card border border-border rounded-2xl p-6">
                                        <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Search className="w-3.5 h-3.5" />
                                            Recent Searches
                                        </h4>
                                        <div className="space-y-2">
                                            {savedSearches.slice(0, 5).map((search: any) => {
                                                const filters = search.filters || {};
                                                const summary = Object.entries(filters)
                                                    .filter(([, v]) => v !== undefined && v !== null && v !== "")
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(" | ");
                                                return (
                                                    <button
                                                        key={search._id}
                                                        onClick={() => handleViewSearchResults(search)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-hover hover:bg-accent/5 border border-transparent hover:border-accent/30 transition-all text-left group"
                                                    >
                                                        <Search className="w-4 h-4 text-tertiary group-hover:text-accent transition-colors shrink-0" />
                                                        <div className="min-w-0 grow">
                                                            <p className="text-sm font-medium text-primary truncate group-hover:text-accent transition-colors">
                                                                {search.name}
                                                            </p>
                                                            {summary && (
                                                                <p className="text-xs text-tertiary truncate mt-0.5">
                                                                    {summary}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <svg className="w-4 h-4 text-tertiary group-hover:text-accent transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Enquiries Tab */}
                        {activeTab === "enquiries" && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {enquiries.length > 0 ? (
                                    enquiries.map((enquiry: any) => (
                                        <EnquiryCard key={enquiry._id} enquiry={enquiry} />
                                    ))
                                ) : (
                                    <EmptyState
                                        message="No enquiries yet"
                                        description="Submit an enquiry on a property to see it here"
                                    />
                                )}
                            </div>
                        )}

 {/* Saved Properties Tab */}
 {activeTab ==="saved"&& (
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 {savedProperties.length > 0 ? (
 savedProperties.map((property: any) => (
 <SavedPropertyCard
 key={property._id}
 property={property}
 onUnsave={handleUnsave}
 />
 ))
 ) : (
 <EmptyState
 message="No saved properties"
 description="Save properties while browsing to see them here"
 />
 )}
 </div>
 )}

 {/* Site Visits Tab */}
 {activeTab ==="visits"&& (
 <div className="grid md:grid-cols-2 gap-4">
 {siteVisits.length > 0 ? (
 siteVisits.map((visit: any) => (
 <SiteVisitCard key={visit._id} visit={visit} onUpdate={fetchData} />
 ))
 ) : (
 <EmptyState
 message="No scheduled visits"
 description="Schedule a site visit on a property to see it here"
 />
 )}
 </div>
 )}

 {/* Saved Searches Tab */}
 {activeTab ==="searches"&& (
 <div className="space-y-4">
 {savedSearches.length > 0 ? (
 savedSearches.map((search: any) => (
 <SavedSearchCard
 key={search._id}
 search={search}
 onDelete={handleDeleteSearch}
 onView={handleViewSearchResults}
 />
 ))
 ) : (
 <EmptyState
 message="No saved searches"
 description="Save a search from the search results page to get quick access here"
 />
 )}
 </div>
 )}
 </>
 )}
 </div>
 </div>
 );
}

/* ── Saved Property Card ── */
function SavedPropertyCard({ property, onUnsave }: { property: any; onUnsave: (id: string) => void }) {
 const thumbnail =
 property.media?.images?.find((img: any) => img.isPrimary)?.url
 || property.media?.images?.[0]?.url
 ||"/placeholder-property.jpg";

 const formatPrice = (n: number) => {
 if (n >= 1_00_00_000) return`₹${(n / 1_00_00_000).toFixed(1)} Cr`;
 if (n >= 1_00_000) return`₹${(n / 1_00_000).toFixed(1)} L`;
 return`₹${(n / 1000).toFixed(0)}K`;
 };

 return (
 <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-border transition-colors group relative">
 <Link href={`/property/${property.slug}`}>
<div className="aspect-16/10 relative overflow-hidden bg-accent">
 <Image
 src={thumbnail}
 alt={property.title ||"Property"}
 fill
 className="object-cover group-hover:scale-105 transition-transform duration-500"
 />
 {property.purpose && (
 <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-card text-foreground text-[10px] font-semibold capitalize">
 For {property.purpose}
 </span>
 )}
 </div>
 <div className="p-4">
 <h4 className="font-semibold text-foreground truncate group-hover:text-muted-foreground transition-colors">
 {property.title}
 </h4>
 <p className="text-xs text-muted-foreground truncate mt-1">
 {property.location?.locality}, {property.location?.city}
 </p>
 <div className="flex items-center justify-between mt-3">
 <span className="text-lg font-bold text-foreground">
 {property.price?.amount ? formatPrice(property.price.amount) :"Price on Request"}
 </span>
 <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
 {property.propertyType?.replace(/_/g,"")}
 </span>
 </div>
 </div>
 </Link>
 <button
 onClick={(e) => { e.preventDefault(); onUnsave(property._id); }}
 className="absolute top-2 right-2 p-1.5 rounded-full bg-card text-foreground hover:bg-error-bg transition-colors flex items-center justify-center"
 title="Remove from saved"
 >
 <svg className="w-4 h-4"fill="currentColor"viewBox="0 0 24 24">
 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
 </svg>
 </button>
 </div>
 );
}

/* ── Saved Search Card ── */
function SavedSearchCard({
 search,
 onDelete,
 onView,
}: {
 search: any;
 onDelete: (id: string) => void;
 onView: (search: any) => void;
}) {
 const filters = search.filters || {};
 const filterBadges = Object.entries(filters)
 .filter(([, v]) => v !== undefined && v !== null && v !=="")
 .map(([key, value]) => (
 <span
 key={key}
 className="inline-flex px-2 py-0.5 rounded-full bg-accent text-muted-foreground text-[10px] font-medium capitalize"
 >
 {key.replace(/_/g,"")}: {String(value)}
 </span>
 ));

 return (
 <div className="p-4 bg-card border border-border rounded-xl hover:border-border transition-colors">
 <div className="flex justify-between items-start gap-4">
<div className="min-w-0 grow">
 <h4 className="font-semibold text-foreground">{search.name}</h4>
 <p className="text-[10px] text-muted-foreground mt-0.5">
 Saved on {new Date(search.createdAt).toLocaleDateString()}
 </p>
 {filterBadges.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mt-2">
 {filterBadges}
 </div>
 )}
 </div>
<div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => onView(search)}
 className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
 >
 View Results
 </button>
 <button
 onClick={() => onDelete(search._id)}
 className="p-1.5 text-muted-foreground hover:text-error transition-colors rounded-lg hover:bg-error-bg"
 title="Delete saved search"
 >
 <svg className="w-4 h-4"fill="none"viewBox="0 0 24 24"stroke="currentColor">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
 </svg>
 </button>
 </div>
 </div>
 </div>
 );
}

/* ── Empty State ── */
function EmptyState({ message, description }: { message: string; description?: string }) {
 return (
 <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-border">
 <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
 <svg className="w-8 h-8 text-muted-foreground"fill="none"viewBox="0 0 24 24"stroke="currentColor">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
 </svg>
 </div>
 <p className="text-foreground font-medium">{message}</p>
 <p className="text-muted-foreground text-sm mt-1">{description ||"Start exploring properties to see results here"}</p>
 </div>
 );
}
