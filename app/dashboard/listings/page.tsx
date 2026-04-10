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
 rejectionReason?: string | null;
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

 const isOwner = storedUser?.role === "owner";

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

 const baseUrl = "/api/properties/my-listings";
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
 }, [statusFilter]);

 const handleDelete = async (id: string) => {
 if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
 return;
 }

 setDeleting(id);
 const token = localStorage.getItem("token");

 try {
 const res = await fetch(`/api/properties/my-listings?deleteId=${id}`, {
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
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {listings.map((listing) => (
 <div key={listing.id} className="flex flex-col gap-0">
 {listing.status === "rejected" && (
 <div className="bg-error/10 border border-error/20 rounded-t-xl px-4 py-3">
 <p className="text-sm font-semibold text-error">Listing Rejected</p>
 {listing.rejectionReason && (
 <p className="text-xs text-error/80 mt-1">Reason: {listing.rejectionReason}</p>
 )}
 </div>
 )}
 {listing.status === "pending_review" && (
 <div className="bg-warning/10 border border-warning/20 rounded-t-xl px-4 py-3">
 <p className="text-sm font-semibold text-warning">Under Review</p>
 <p className="text-xs text-warning/80 mt-1">Your property is being reviewed and will go live within 48 hours.</p>
 </div>
 )}
 <PropertyCard
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
 </div>
 ))}
 </div>
 )}
 </main>
 </>
 );
}
