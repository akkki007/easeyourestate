"use client";

import { useEffect, useState, useCallback } from"react";
import { useAuth, getUserDisplayName } from"@/lib/auth/AuthContext";
import DashboardHeader from"@/components/dashboard/DashboardHeader";
import PropertyCard from"@/components/PropertyCard";
import toast from"react-hot-toast";

interface SavedProperty {
 _id: string;
 slug: string;
 title: string;
 purpose: string;
 category: string;
 propertyType: string;
 status?: string;
 price: { amount: number; currency: string };
 location: { city: string; locality: string };
 media?: { images?: Array<{ url: string; isPrimary?: boolean }> };
}

export default function SavedPropertiesPage() {
 const { token, user } = useAuth();
 const [properties, setProperties] = useState<SavedProperty[]>([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);

 const fetchSaved = useCallback(async () => {
 if (!token) return;
 setLoading(true);
 try {
 const res = await fetch(`/api/user/saved-properties?page=${page}&limit=12`, {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error("Failed to load saved properties");
 const data = await res.json();
 setProperties(data.properties);
 setTotal(data.total);
 setTotalPages(data.totalPages);
 } catch {
 toast.error("Failed to load saved properties");
 } finally {
 setLoading(false);
 }
 }, [token, page]);

 useEffect(() => {
 fetchSaved();
 }, [fetchSaved]);

 const handleUnsave = async (propertyId: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/user/saved-properties/${propertyId}`, {
 method:"DELETE",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error("Failed to unsave");
 setProperties((prev) => prev.filter((p) => p._id !== propertyId));
 setTotal((prev) => prev - 1);
 toast.success("Property removed from saved");
 } catch {
 toast.error("Failed to unsave property");
 }
 };

 const userName = getUserDisplayName(user);
 const userEmail = typeof user?.email ==="string"? user.email :"";

 const getPrimaryImage = (media?: SavedProperty["media"]) => {
 if (!media?.images?.length) return null;
 const primary = media.images.find((img) => img.isPrimary);
 return primary?.url || media.images[0]?.url || null;
 };

 return (
 <>
 <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Saved Properties"/>
 <main className="p-6">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div>
 <p className="text-sm text-secondary">
 {total} {total === 1 ?"property":"properties"} saved
 </p>
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-20">
 <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
 </div>
 ) : properties.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center mb-4">
 <svg className="w-8 h-8 text-tertiary"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
 </svg>
 </div>
 <p className="text-primary font-medium mb-1">No saved properties</p>
 <p className="text-tertiary text-sm">Properties you save will appear here</p>
 </div>
 ) : (
 <>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {properties.map((property) => (
 <div key={property._id} className="relative group/card">
 <PropertyCard
 id={property._id}
 slug={property.slug}
 title={property.title}
 purpose={property.purpose}
 category={property.category}
 propertyType={property.propertyType}
 status={property.status}
 price={property.price}
 location={property.location}
 media={{ primary: getPrimaryImage(property.media) }}
 />
 <button
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 handleUnsave(property._id);
 }}
 className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-error hover:bg-error transition-colors shadow-sm"
 title="Remove from saved"
 >
 <svg className="w-5 h-5"fill="currentColor"viewBox="0 0 24 24">
 <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
 </svg>
 </button>
 </div>
 ))}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 mt-8">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 className="px-4 py-2 rounded-lg border border-border text-sm text-secondary hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 Previous
 </button>
 <span className="text-sm text-secondary px-3">
 Page {page} of {totalPages}
 </span>
 <button
 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
 disabled={page === totalPages}
 className="px-4 py-2 rounded-lg border border-border text-sm text-secondary hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 >
 Next
 </button>
 </div>
 )}
 </>
 )}
 </main>
 </>
 );
}
