"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAdminRealtimeContext } from "../layout";
import toast from "react-hot-toast";

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

const STATUS_OPTIONS = ["", "draft", "pending_review", "active", "sold", "rented", "expired", "rejected", "archived"];

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
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("q", search);

    try {
      const res = await fetch(`/api/admin/listings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Listing deleted");
      fetchListings();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const formatPrice = (n: number) => {
    if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)} Cr`;
    if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)} L`;
    return `${(n / 1000).toFixed(0)}K`;
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-400",
      draft: "bg-gray-500/10 text-gray-400",
      pending_review: "bg-amber-500/10 text-amber-400",
      sold: "bg-blue-500/10 text-blue-400",
      rented: "bg-cyan-500/10 text-cyan-400",
      rejected: "bg-red-500/10 text-red-400",
      expired: "bg-gray-600/10 text-gray-500",
      archived: "bg-gray-700/10 text-gray-500",
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${colors[s] || "bg-gray-800 text-gray-400"}`}>
        {s.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Listings</h2>
          <p className="text-sm text-gray-500">{total} total listings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, slug, locality..."
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 focus:border-accent focus:outline-none"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Listed By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No listings found</td></tr>
              ) : (
                listings.map((l) => (
                  <tr key={l._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium truncate max-w-[200px]">{l.title}</p>
                      <p className="text-gray-500 text-xs">{l.location.locality}, {l.location.city} &middot; {l.propertyType} &middot; For {l.purpose}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{formatPrice(l.price.amount)}</td>
                    <td className="px-4 py-3">
                      {l.listedBy ? (
                        <>
                          <p className="text-gray-300 text-xs">{l.listedBy.name.first} {l.listedBy.name.last}</p>
                          <p className="text-gray-500 text-xs capitalize">{l.listingType}</p>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{statusBadge(l.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(l.status === "pending_review" || l.status === "draft") && (
                          <button
                            onClick={() => handleApprove(l._id)}
                            className="px-2 py-1 rounded text-xs text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {l.status !== "rejected" && (
                          <button
                            onClick={() => { setRejectTarget(l._id); setRejectReason(""); }}
                            className="px-2 py-1 rounded text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(l._id)}
                          className="px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded text-xs text-gray-400 hover:bg-gray-800 disabled:opacity-30 transition-colors">Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-xs text-gray-400 hover:bg-gray-800 disabled:opacity-30 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setRejectTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">Reject Listing</h3>
            <p className="text-sm text-gray-400 mb-4">Provide a reason for rejection</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter reason..."
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 mb-4 focus:border-accent focus:outline-none resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition-colors"
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
