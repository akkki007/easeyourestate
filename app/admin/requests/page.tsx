"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAdminRealtimeContext } from "../layout";
import { Loader2, Download, Check, X } from "lucide-react";
import toast from "react-hot-toast";

type ContactRequest = {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  propertyTitle: string;
  propertySlug: string;
  propertyLocality: string;
  propertyCity: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-error/15 text-error",
};

export default function AdminRequestsPage() {
  const { token } = useAuth();
  const { refreshKey } = useAdminRealtimeContext();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/contact-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data.requests || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, refreshKey]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/contact-requests/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to approve");
        return;
      }
      toast.success(data.message || "Approved");
      fetchRequests();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const note = prompt("Rejection reason (optional):");
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/contact-requests/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: note || "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to reject");
        return;
      }
      toast.success("Request rejected");
      fetchRequests();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Request Date",
      "Status",
      "Buyer Name",
      "Buyer Phone",
      "Buyer Email",
      "Owner Name",
      "Owner Phone",
      "Owner Email",
      "Property Title",
      "Locality",
      "City",
      "Approved At",
      "Admin Note",
    ];

    const rows = requests.map((r) => [
      new Date(r.createdAt).toLocaleDateString("en-IN"),
      r.status,
      r.buyerName,
      r.buyerPhone,
      r.buyerEmail,
      r.ownerName,
      r.ownerPhone,
      r.ownerEmail,
      r.propertyTitle,
      r.propertyLocality,
      r.propertyCity,
      r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-IN") : "",
      r.adminNote,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contact-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Contact Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total request{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No requests yet</h3>
          <p className="text-muted-foreground text-sm">
            Contact requests from buyers will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-semibold text-muted-foreground">Date</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Buyer</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Owner</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Property</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Status</th>
                  <th className="pb-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 pr-4 whitespace-nowrap text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-foreground">{r.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{r.buyerPhone}</p>
                      {r.buyerEmail && (
                        <p className="text-xs text-muted-foreground">{r.buyerEmail}</p>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-foreground">{r.ownerName}</p>
                      <p className="text-xs text-muted-foreground">{r.ownerPhone}</p>
                    </td>
                    <td className="py-4 pr-4 max-w-[200px]">
                      <p className="font-medium text-foreground truncate">{r.propertyTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.propertyLocality}, {r.propertyCity}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_COLORS[r.status] || ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {r.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-semibold hover:bg-success/25 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === r.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={actionLoading === r.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error/15 text-error text-xs font-semibold hover:bg-error/25 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {r.status === "approved" && r.approvedAt
                            ? `Approved ${new Date(r.approvedAt).toLocaleDateString("en-IN")}`
                            : r.status === "rejected"
                              ? "Rejected"
                              : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
