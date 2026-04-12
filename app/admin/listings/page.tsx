"use client";

import { useEffect, useState, useCallback } from"react";
import { useAuth } from"@/lib/auth/AuthContext";
import { useAdminRealtimeContext } from"../layout";
import toast from"react-hot-toast";

interface ListingRow {
 _id: string;
 slug: string;
 title: string;
 purpose: string;
 category: string;
 propertyType: string;
 status: string;
 listingType: string;
 price: { amount: number; currency: string };
 location: { city: string; locality: string };
 listedBy?: { name: { first: string; last: string }; email?: string; role: string };
 createdAt: string;
 publishedAt?: string;
}

const STATUS_OPTIONS = ["","draft","pending_review","active","sold","rented","expired","rejected","archived"];

export default function AdminListingsPage() {
 const { token } = useAuth();
 const { refreshKey } = useAdminRealtimeContext();
 const [listings, setListings] = useState<ListingRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);
 const [statusFilter, setStatusFilter] = useState("");
 const [search, setSearch] = useState("");

 // Rejection modal
 const [rejectTarget, setRejectTarget] = useState<string | null>(null);
 const [rejectReason, setRejectReason] = useState("");

 const fetchListings = useCallback(async () => {
 if (!token) return;
 setLoading(true);
 const params = new URLSearchParams({ page: String(page), limit:"15"});
 if (statusFilter) params.set("status", statusFilter);
 if (search) params.set("q", search);

 try {
 const res = await fetch(`/api/admin/listings?${params}`, {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 const data = await res.json();
 setListings(data.listings);
 setTotal(data.total);
 setTotalPages(data.totalPages);
 } catch {
 toast.error("Failed to load listings");
 } finally {
 setLoading(false);
 }
 }, [token, page, statusFilter, search]);

 useEffect(() => { fetchListings(); }, [fetchListings]);
 useEffect(() => { if (refreshKey > 0) fetchListings(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [refreshKey]);
 useEffect(() => { setPage(1); }, [statusFilter, search]);

 const handleApprove = async (id: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/listings/${id}/approve`, {
 method:"PUT",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 toast.success("Listing approved");
 fetchListings();
 } catch {
 toast.error("Failed to approve");
 }
 };

 const handleReject = async () => {
 if (!token || !rejectTarget || !rejectReason.trim()) {
 toast.error("Rejection reason is required");
 return;
 }
 try {
 const res = await fetch(`/api/admin/listings/${rejectTarget}/reject`, {
 method:"PUT",
 headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
 body: JSON.stringify({ reason: rejectReason.trim() }),
 });
 if (!res.ok) throw new Error();
 toast.success("Listing rejected");
 setRejectTarget(null);
 setRejectReason("");
 fetchListings();
 } catch {
 toast.error("Failed to reject");
 }
 };

 const handleDelete = async (id: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/listings/${id}`, {
 method:"DELETE",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 toast.success("Listing deleted");
 fetchListings();
 } catch {
 toast.error("Failed to delete");
 }
 };

 const formatPrice = (n: number) => {
 if (n >= 1_00_00_000) return`${(n / 1_00_00_000).toFixed(1)} Cr`;
 if (n >= 1_00_000) return`${(n / 1_00_000).toFixed(1)} L`;
 return`${(n / 1000).toFixed(0)}K`;
 };

 const statusBadge = (s: string) => {
 const colors: Record<string, string> = {
 active:"bg-success text-success",
 draft:"bg-muted/10 text-muted-foreground",
 pending_review:"bg-warning text-warning",
 sold:"bg-primary text-primary",
 rented:"bg-info text-info",
 rejected:"bg-error text-error",
 expired:"bg-muted/10 text-muted-foreground",
 archived:"bg-muted/10 text-muted-foreground",
 };
 return (
 <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${colors[s] ||"bg-muted text-muted-foreground"}`}>
 {s.replace(/_/g,"")}
 </span>
 );
 };

 return (
 <main className="p-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h2 className="text-lg font-semibold text-foreground">Listings</h2>
 <p className="text-sm text-muted-foreground">{total} total listings</p>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-3 mb-5">
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search title, slug, locality..."
 className="px-4 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none w-64"
 />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-muted-foreground focus:border-accent focus:outline-none"
 >
 <option value="">All Status</option>
 {STATUS_OPTIONS.filter(Boolean).map((s) => (
 <option key={s} value={s}>{s.replace(/_/g,"")}</option>
 ))}
 </select>
 </div>

 {/* Table */}
 <div className="bg-muted border border-border rounded-xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Listed By</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
 <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
 ) : listings.length === 0 ? (
 <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No listings found</td></tr>
 ) : (
 listings.map((l) => (
 <tr key={l._id} className="border-b border-border/50 hover:bg-accent/30">
 <td className="px-4 py-3">
 <p className="text-foreground font-medium truncate max-w-[200px]">{l.title}</p>
 <p className="text-muted-foreground text-xs">{l.location.locality}, {l.location.city} &middot; {l.propertyType} &middot; For {l.purpose}</p>
 </td>
 <td className="px-4 py-3 text-foreground font-medium">{formatPrice(l.price.amount)}</td>
 <td className="px-4 py-3">
 {l.listedBy ? (
 <>
 <p className="text-muted-foreground text-xs">{l.listedBy.name.first} {l.listedBy.name.last}</p>
 <p className="text-muted-foreground text-xs capitalize">{l.listingType}</p>
 </>
 ) : (
 <span className="text-muted-foreground text-xs">-</span>
 )}
 </td>
 <td className="px-4 py-3">{statusBadge(l.status)}</td>
 <td className="px-4 py-3 text-muted-foreground text-xs">
 {new Date(l.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short"})}
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center justify-end gap-1">
 {(l.status ==="pending_review"|| l.status ==="draft") && (
 <button
 onClick={() => handleApprove(l._id)}
 className="px-2 py-1 rounded text-xs text-success hover:bg-success transition-colors"
 >
 Approve
 </button>
 )}
 {l.status !=="rejected"&& (
 <button
 onClick={() => { setRejectTarget(l._id); setRejectReason(""); }}
 className="px-2 py-1 rounded text-xs text-warning hover:bg-warning transition-colors"
 >
 Reject
 </button>
 )}
 <button
 onClick={() => handleDelete(l._id)}
 className="px-2 py-1 rounded text-xs text-error hover:bg-error transition-colors"
 >
 Delete
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {totalPages > 1 && (
 <div className="flex items-center justify-between px-4 py-3 border-t border-border">
 <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
 <div className="flex gap-2">
 <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">Prev</button>
 <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">Next</button>
 </div>
 </div>
 )}
 </div>

 {/* Reject Modal */}
 {rejectTarget && (
 <>
 <div className="fixed inset-0 bg-black/70 z-50"onClick={() => setRejectTarget(null)} />
 <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-card border border-border rounded-2xl p-6">
 <h3 className="text-foreground font-semibold mb-1">Reject Listing</h3>
 <p className="text-sm text-muted-foreground mb-4">Provide a reason for rejection</p>
 <textarea
 value={rejectReason}
 onChange={(e) => setRejectReason(e.target.value)}
 rows={3}
 placeholder="Enter reason..."
 className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground mb-4 focus:border-accent focus:outline-none resize-none"
 />
 <div className="flex gap-3">
 <button
 onClick={handleReject}
 className="flex-1 py-2 rounded-lg bg-error text-foreground text-sm font-medium hover:bg-error transition-colors"
 >
 Reject
 </button>
 <button
 onClick={() => setRejectTarget(null)}
 className="flex-1 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-accent transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 </>
 )}
 </main>
 );
}
