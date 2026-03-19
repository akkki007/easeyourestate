"use client";

import { useEffect, useState, useCallback } from"react";
import { useAuth } from"@/lib/auth/AuthContext";
import { useAdminRealtimeContext } from"../layout";
import toast from"react-hot-toast";

interface ReportRow {
 _id: string;
 reason: string;
 description?: string;
 status: string;
 reportedBy?: { name: { first: string; last: string }; email?: string };
 propertyId?: { slug: string; title: string; status: string };
 createdAt: string;
}

export default function AdminReportsPage() {
 const { token } = useAuth();
 const { refreshKey } = useAdminRealtimeContext();
 const [reports, setReports] = useState<ReportRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);
 const [statusFilter, setStatusFilter] = useState("");

 const fetchReports = useCallback(async () => {
 if (!token) return;
 setLoading(true);
 const params = new URLSearchParams({ page: String(page), limit:"15"});
 if (statusFilter) params.set("status", statusFilter);

 try {
 const res = await fetch(`/api/admin/reports?${params}`, {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 const data = await res.json();
 setReports(data.reports);
 setTotal(data.total);
 setTotalPages(data.totalPages);
 } catch {
 toast.error("Failed to load reports");
 } finally {
 setLoading(false);
 }
 }, [token, page, statusFilter]);

 useEffect(() => { fetchReports(); }, [fetchReports]);
 useEffect(() => { if (refreshKey > 0) fetchReports(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [refreshKey]);
 useEffect(() => { setPage(1); }, [statusFilter]);

 const handleResolve = async (id: string, status:"resolved"|"rejected") => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/reports/${id}/resolve`, {
 method:"PUT",
 headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
 body: JSON.stringify({ status }),
 });
 if (!res.ok) throw new Error();
 toast.success(`Report ${status}`);
 fetchReports();
 } catch {
 toast.error("Failed to update report");
 }
 };

 const statusBadge = (s: string) => {
 const colors: Record<string, string> = {
 pending:"bg-warning text-warning",
 reviewed:"bg-primary text-primary",
 resolved:"bg-success text-success",
 rejected:"bg-error text-error",
 };
 return (
 <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${colors[s] ||"bg-muted text-muted-foreground"}`}>
 {s}
 </span>
 );
 };

 return (
 <main className="p-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h2 className="text-lg font-semibold text-primary-foreground">Reports</h2>
 <p className="text-sm text-muted-foreground">{total} total reports</p>
 </div>
 </div>

 {/* Filter */}
 <div className="flex gap-3 mb-5">
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-muted-foreground focus:border-accent focus:outline-none"
 >
 <option value="">All Status</option>
 <option value="pending">Pending</option>
 <option value="reviewed">Reviewed</option>
 <option value="resolved">Resolved</option>
 <option value="rejected">Rejected</option>
 </select>
 </div>

 {/* Reports list */}
 {loading ? (
 <div className="flex items-center justify-center py-20">
 <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"/>
 </div>
 ) : reports.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
 <svg className="w-8 h-8 text-muted-foreground"fill="none"viewBox="0 0 24 24"stroke="currentColor"strokeWidth="1.5">
 <path strokeLinecap="round"strokeLinejoin="round"d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
 </svg>
 </div>
 <p className="text-primary-foreground font-medium mb-1">No reports</p>
 <p className="text-muted-foreground text-sm">All clear!</p>
 </div>
 ) : (
 <div className="space-y-3">
 {reports.map((r) => (
 <div key={r._id} className="bg-muted border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="text-primary-foreground text-sm font-medium">{r.reason}</h3>
 {statusBadge(r.status)}
 </div>
 {r.description && (
 <p className="text-muted-foreground text-xs mb-2">{r.description}</p>
 )}
 <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
 {r.propertyId && (
 <span>Property: <span className="text-muted-foreground">{r.propertyId.title}</span></span>
 )}
 {r.reportedBy && (
 <span>By: <span className="text-muted-foreground">{r.reportedBy.name.first} {r.reportedBy.name.last}</span></span>
 )}
 <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric"})}</span>
 </div>
 </div>
 {r.status ==="pending"&& (
 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => handleResolve(r._id,"resolved")}
 className="px-3 py-1.5 rounded-lg text-xs font-medium text-success bg-success hover:bg-success transition-colors"
 >
 Resolve
 </button>
 <button
 onClick={() => handleResolve(r._id,"rejected")}
 className="px-3 py-1.5 rounded-lg text-xs font-medium text-error bg-error hover:bg-error transition-colors"
 >
 Dismiss
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 mt-6">
 <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">Prev</button>
 <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
 <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">Next</button>
 </div>
 )}
 </main>
 );
}
