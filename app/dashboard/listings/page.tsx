"use client";

import { useEffect, useState } from"react";
import Link from"next/link";
import DashboardHeader from"@/components/dashboard/DashboardHeader";
import { Loader2, Plus, Home, MapPin, Eye, MessageSquare, Edit2, Trash2 } from"lucide-react";
import PropertyCard from"@/components/PropertyCard";
import toast from"react-hot-toast";

type Listing = {
 id: string;
 slug: string;
 title: string;
 purpose: string;
 category: string;
 propertyType: string;
 status: string;
 price: { amount: number; currency: string };
 location: { city: string; locality: string };
 media: { primary: string } | null;
 metrics?: { views?: number; inquiries?: number };
 createdAt: string;
 updatedAt: string;
};

export default function ListingsPage() {
 const [storedUser, setStoredUser] = useState<{ _id: string; name: { first: string; last: string } | string; email: string; role: string } | null>(null);
 const [listings, setListings] = useState<Listing[]>([]);
 const [loading, setLoading] = useState(true);
 const [statusFilter, setStatusFilter] = useState<string>("");
 const [error, setError] = useState<string | null>(null);
 const [deleting, setDeleting] = useState<string | null>(null);

 useEffect(() => {
 const raw = localStorage.getItem("user");
 if (raw) {
 try { setStoredUser(JSON.parse(raw)); } catch { /* ignore */ }
 }
 }, []);

 const isAgent = storedUser?.role === "agent";

 useEffect(() => {
 const fetchListings = async () => {
 setLoading(true);
 setError(null);
 const token = localStorage.getItem("token");
 if (!token) {
 setListings([]);
 setError("You are not logged in. Please login again.");
 setLoading(false);
 return;
 }

 // Use agent-specific endpoint if user is agent, otherwise use general endpoint
 const baseUrl = isAgent ? "/api/agent/listings" : "/api/properties/my-listings";
 const url = statusFilter ?`${baseUrl}?status=${statusFilter}`:baseUrl;

 try {
 const res = await fetch(url, {
 headers: {
 Authorization:`Bearer ${token}`,
 },
 });
 const data = await res.json().catch(() => ({}));

 if (!res.ok) {
 setListings([]);
 setError(data.error ||"Failed to load listings.");
 return;
 }

 // Handle both pagination structures
 const items = data.listings || (data.items ? data.items : []);
 setListings(Array.isArray(items) ? items : []);
 } catch {
 setListings([]);
 setError("Failed to load listings.");
 } finally {
 setLoading(false);
 }
 };

 fetchListings();
 }, [statusFilter, isAgent]);

 const handleDelete = async (id: string) => {
 if (!isAgent) {
 toast.error("Only agents can delete listings");
 return;
 }

 if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
 return;
 }

 setDeleting(id);
 const token = localStorage.getItem("token");

 try {
 const res = await fetch(`/api/agent/listings/${id}`, {
 method: "DELETE",
 headers: {
 Authorization: `Bearer ${token}`,
 },
 });

 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 toast.error(data.error ||"Failed to delete listing");
 setDeleting(null);
 return;
 }

 setListings((current) => current.filter((l) => l.id !== id));
 toast.success("Listing deleted successfully");
 } catch {
 toast.error("Failed to delete listing");
 } finally {
 setDeleting(null);
 }
 };

 const userName = storedUser ? (typeof storedUser.name ==="object"? storedUser.name.first : storedUser.name) ||"User":"User";
 const userEmail = storedUser?.email ??"";

 return (
 <>
 <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="My Listings"/>
 <main className="p-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
 <div>
 <p className="text-muted-foreground text-sm">Manage your property listings</p>
 </div>
 <div className="flex items-center gap-3">
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-4 py-2 rounded-xl theme-input border border-border text-sm"
 >
 <option value="">All statuses</option>
 <option value="draft">Draft</option>
 <option value="active">Active</option>
 <option value="pending_review">Pending review</option>
 <option value="sold">Sold</option>
 <option value="rented">Rented</option>
 <option value="archived">Archived</option>
 </select>
 {isAgent && (
 <Link
 href="/dashboard/listings/bulk-upload"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-hover transition-colors"
 >
 <svg className="w-4 h-4"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
 </svg>
 Bulk Upload
 </Link>
 )}
 <Link
 href="/dashboard/properties/new"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-primary-foreground font-medium text-sm hover:bg-accent-hover transition-colors"
 >
 <Plus className="w-4 h-4"/>
 Add Property
 </Link>
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-16">
 <Loader2 className="w-8 h-8 animate-spin text-accent"/>
 </div>
 ) : error ? (
 <div className="bg-card rounded-2xl border border-error/30 p-8 text-center">
 <h3 className="text-lg font-semibold text-primary mb-2">Couldn&apos;t load listings</h3>
 <p className="text-muted-foreground text-sm">{error}</p>
 </div>
 ) : listings.length === 0 ? (
 <div className="bg-card rounded-2xl border border-border p-12 text-center">
 <div className="w-16 h-16 rounded-2xl bg-hover flex items-center justify-center mx-auto mb-4">
 <Home className="w-8 h-8 text-tertiary"/>
 </div>
 <h3 className="text-lg font-semibold text-primary mb-2">No listings yet</h3>
 <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
 Add your first property to start receiving inquiries from buyers and tenants.
 </p>
 <Link
 href="/dashboard/properties/new"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-primary-foreground font-medium text-sm hover:bg-accent-hover"
 >
 <Plus className="w-4 h-4"/>
 Add Property
 </Link>
 </div>
 ) : (
 isAgent ? (
 // Agent listings view with metrics and actions
 <div className="space-y-3">
 {listings.map((listing) => {
 const views = listing.metrics?.views || 0;
 const inquiries = listing.metrics?.inquiries || 0;
 const statusColors: Record<string, string> = {
 draft: "bg-warning-bg text-warning",
 active: "bg-success-bg text-success",
 sold: "bg-secondary-bg text-muted-foreground",
 inactive: "bg-error/15 text-error",
 };

 return (
 <div
 key={listing.id}
 className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-accent/50 transition-colors"
 >
 <Link
 href={`/property/${listing.slug}`}
 className="flex gap-3 flex-1 min-w-0 hover:opacity-80"
 >
 {listing.media?.primary && (
 <img src={listing.media.primary} alt={listing.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
 )}
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
 <p className="text-sm text-muted-foreground truncate">
 {listing.location.locality}, {listing.location.city}
 </p>
 <div className="flex items-center gap-2 mt-2 text-sm">
 <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[listing.status] || statusColors.inactive}`}>
 {listing.status}
 </span>
 <span className="text-foreground font-semibold">
 ₹{new Intl.NumberFormat("en-IN").format(listing.price.amount)}
 </span>
 </div>
 </div>
 </Link>

 <div className="flex items-center gap-6 sm:gap-8">
 <div className="flex items-center gap-4 text-sm">
 <div className="text-center">
 <div className="flex items-center gap-1 text-muted-foreground">
 <Eye className="w-4 h-4"/>
 <span>{views}</span>
 </div>
 <p className="text-xs text-tertiary mt-0.5">Views</p>
 </div>
 <div className="text-center">
 <div className="flex items-center gap-1 text-muted-foreground">
 <MessageSquare className="w-4 h-4"/>
 <span>{inquiries}</span>
 </div>
 <p className="text-xs text-tertiary mt-0.5">Leads</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 title="Edit listing"
 className="p-2 rounded-lg hover:bg-hover text-muted-foreground transition-colors"
 >
 <Edit2 className="w-4 h-4"/>
 </button>
 <button
 onClick={() => handleDelete(listing.id)}
 disabled={deleting === listing.id}
 title="Delete listing"
 className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors disabled:opacity-50"
 >
 {deleting === listing.id ? (
 <Loader2 className="w-4 h-4 animate-spin"/>
 ) : (
 <Trash2 className="w-4 h-4"/>
 )}
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 // Generic listings view with PropertyCard
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {listings.map((listing) => (
 <PropertyCard
 key={listing.id}
 id={listing.id}
 slug={listing.slug}
 title={listing.title}
 purpose={listing.purpose}
 category={listing.category}
 propertyType={listing.propertyType}
 status={listing.status}
 price={listing.price}
 location={listing.location}
 media={listing.media}
 />
 ))}
 </div>
 )
 )}
 </main>
 </>
 );
}
