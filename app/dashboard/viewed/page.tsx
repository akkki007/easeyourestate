"use client";

import { useEffect, useState, useCallback } from"react";
import { useAuth, getUserDisplayName } from"@/lib/auth/AuthContext";
import DashboardHeader from"@/components/dashboard/DashboardHeader";
import PropertyCard from"@/components/PropertyCard";
import toast from"react-hot-toast";

interface ViewedProperty {
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
 viewedAt: string;
}

export default function ViewedPropertiesPage() {
 const { token, user } = useAuth();
 const [properties, setProperties] = useState<ViewedProperty[]>([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);

 const fetchViewed = useCallback(async () => {
 if (!token) return;
 setLoading(true);
 try {
 const res = await fetch(`/api/user/viewed-properties?page=${page}&limit=12`, {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error("Failed to load viewed properties");
 const data = await res.json();
 setProperties(data.properties);
 setTotal(data.total);
 setTotalPages(data.totalPages);
 } catch {
 toast.error("Failed to load viewed properties");
 } finally {
 setLoading(false);
 }
 }, [token, page]);

 useEffect(() => {
 fetchViewed();
 }, [fetchViewed]);

 const userName = getUserDisplayName(user);
 const userEmail = typeof user?.email ==="string"? user.email :"";

 const getPrimaryImage = (media?: ViewedProperty["media"]) => {
 if (!media?.images?.length) return null;
 const primary = media.images.find((img) => img.isPrimary);
 return primary?.url || media.images[0]?.url || null;
 };

 const formatTimeAgo = (dateStr: string) => {
 const diff = Date.now() - new Date(dateStr).getTime();
 const minutes = Math.floor(diff / 60000);
 if (minutes < 1) return"Just now";
 if (minutes < 60) return`${minutes}m ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return`${hours}h ago`;
 const days = Math.floor(hours / 24);
 if (days < 7) return`${days}d ago`;
 return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short"});
 };

 return (
 <>
 <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Recently Viewed"/>
 <main className="p-6">
 <div className="flex items-center justify-between mb-6">
 <p className="text-sm text-secondary">
 {total} {total === 1 ?"property":"properties"} viewed
 </p>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-20">
 <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
 </div>
 ) : properties.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center mb-4">
 <svg className="w-8 h-8 text-tertiary"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
 <path strokeLinecap="round"strokeLinejoin="round"d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
 </svg>
 </div>
 <p className="text-primary font-medium mb-1">No viewed properties</p>
 <p className="text-tertiary text-sm">Properties you view will appear here</p>
 </div>
 ) : (
 <>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {properties.map((property) => (
 <div key={property._id} className="relative">
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
 <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-primary-foreground text-xs">
 {formatTimeAgo(property.viewedAt)}
 </div>
 </div>
 ))}
 </div>

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
