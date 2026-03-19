"use client";

import { useEffect, useState, useCallback } from"react";
import { useAuth } from"@/lib/auth/AuthContext";
import { useAdminRealtimeContext } from"../layout";
import toast from"react-hot-toast";

interface UserRow {
 _id: string;
 name: { first: string; last: string };
 email?: string;
 phone?: string;
 role: string;
 deletedAt?: string;
 createdAt: string;
}

const ROLES = ["","buyer","tenant","owner","agent","builder","admin"];

export default function AdminUsersPage() {
 const { token } = useAuth();
 const { refreshKey } = useAdminRealtimeContext();
 const [users, setUsers] = useState<UserRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);
 const [search, setSearch] = useState("");
 const [roleFilter, setRoleFilter] = useState("");
 const [statusFilter, setStatusFilter] = useState("");

 // Role change modal
 const [roleModalUser, setRoleModalUser] = useState<UserRow | null>(null);
 const [newRole, setNewRole] = useState("");

 const fetchUsers = useCallback(async () => {
 if (!token) return;
 setLoading(true);
 const params = new URLSearchParams({ page: String(page), limit:"15"});
 if (search) params.set("q", search);
 if (roleFilter) params.set("role", roleFilter);
 if (statusFilter) params.set("status", statusFilter);

 try {
 const res = await fetch(`/api/admin/users?${params}`, {
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 const data = await res.json();
 setUsers(data.users);
 setTotal(data.total);
 setTotalPages(data.totalPages);
 } catch {
 toast.error("Failed to load users");
 } finally {
 setLoading(false);
 }
 }, [token, page, search, roleFilter, statusFilter]);

 useEffect(() => {
 fetchUsers();
 }, [fetchUsers]);

 // Re-fetch on realtime changes
 useEffect(() => {
 if (refreshKey > 0) fetchUsers();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [refreshKey]);

 // Reset to page 1 on filter change
 useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

 const handleSuspend = async (id: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/users/${id}/suspend`, {
 method:"PUT",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) {
 const err = await res.json();
 throw new Error(err.error);
 }
 toast.success("User suspended");
 fetchUsers();
 } catch (err: unknown) {
 toast.error(err instanceof Error ? err.message :"Failed");
 }
 };

 const handleActivate = async (id: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/users/${id}/activate`, {
 method:"PUT",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) throw new Error();
 toast.success("User activated");
 fetchUsers();
 } catch {
 toast.error("Failed to activate user");
 }
 };

 const handleRoleChange = async () => {
 if (!token || !roleModalUser || !newRole) return;
 try {
 const res = await fetch(`/api/admin/users/${roleModalUser._id}/role`, {
 method:"PUT",
 headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
 body: JSON.stringify({ role: newRole }),
 });
 if (!res.ok) throw new Error();
 toast.success(`Role updated to ${newRole}`);
 setRoleModalUser(null);
 fetchUsers();
 } catch {
 toast.error("Failed to change role");
 }
 };

 const handleDelete = async (id: string) => {
 if (!token) return;
 try {
 const res = await fetch(`/api/admin/users/${id}`, {
 method:"DELETE",
 headers: { Authorization:`Bearer ${token}`},
 });
 if (!res.ok) {
 const err = await res.json();
 throw new Error(err.error);
 }
 toast.success("User deleted");
 fetchUsers();
 } catch (err: unknown) {
 toast.error(err instanceof Error ? err.message :"Failed");
 }
 };

 return (
 <main className="p-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h2 className="text-lg font-semibold text-primary-foreground">Users</h2>
 <p className="text-sm text-muted-foreground">{total} total users</p>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-3 mb-5">
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search name, email, phone..."
 className="px-4 py-2 rounded-lg bg-muted border border-border text-sm text-primary-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none w-64"
 />
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-muted-foreground focus:border-accent focus:outline-none"
 >
 <option value="">All Roles</option>
 {ROLES.filter(Boolean).map((r) => (
 <option key={r} value={r}>{r}</option>
 ))}
 </select>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-muted-foreground focus:border-accent focus:outline-none"
 >
 <option value="">All Status</option>
 <option value="active">Active</option>
 <option value="suspended">Suspended</option>
 </select>
 </div>

 {/* Table */}
 <div className="bg-muted border border-border rounded-xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
 <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
 <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
 ) : users.length === 0 ? (
 <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td></tr>
 ) : (
 users.map((u) => {
 const isSuspended = !!u.deletedAt;
 return (
 <tr key={u._id} className="border-b border-border/50 hover:bg-accent/30">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
 {u.name.first?.charAt(0)?.toUpperCase() ||"?"}
 </div>
 <span className="text-primary-foreground font-medium">
 {u.name.first} {u.name.last}
 </span>
 </div>
 </td>
 <td className="px-4 py-3">
 <p className="text-muted-foreground">{u.email ||"-"}</p>
 <p className="text-muted-foreground text-xs">{u.phone ||""}</p>
 </td>
 <td className="px-4 py-3">
 <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium capitalize">
 {u.role}
 </span>
 </td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
 isSuspended ?"bg-error text-error":"bg-success text-success"
 }`}>
 {isSuspended ?"Suspended":"Active"}
 </span>
 </td>
 <td className="px-4 py-3 text-muted-foreground text-xs">
 {new Date(u.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric"})}
 </td>
 <td className="px-4 py-3">
 {u.role !=="admin"&& (
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => { setRoleModalUser(u); setNewRole(u.role); }}
 className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-primary-foreground hover:bg-accent transition-colors"
 title="Change role"
 >
 Role
 </button>
 {isSuspended ? (
 <button
 onClick={() => handleActivate(u._id)}
 className="px-2 py-1 rounded text-xs text-success hover:bg-success transition-colors"
 >
 Activate
 </button>
 ) : (
 <button
 onClick={() => handleSuspend(u._id)}
 className="px-2 py-1 rounded text-xs text-warning hover:bg-warning transition-colors"
 >
 Suspend
 </button>
 )}
 <button
 onClick={() => handleDelete(u._id)}
 className="px-2 py-1 rounded text-xs text-error hover:bg-error transition-colors"
 >
 Delete
 </button>
 </div>
 )}
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between px-4 py-3 border-t border-border">
 <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
 <div className="flex gap-2">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 className="px-3 py-1 rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
 >
 Prev
 </button>
 <button
 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
 disabled={page === totalPages}
 className="px-3 py-1 rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
 >
 Next
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Role Change Modal */}
 {roleModalUser && (
 <>
 <div className="fixed inset-0 bg-black/70 z-50"onClick={() => setRoleModalUser(null)} />
 <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-muted border border-border rounded-2xl p-6">
 <h3 className="text-primary-foreground font-semibold mb-1">Change Role</h3>
 <p className="text-sm text-muted-foreground mb-4">
 {roleModalUser.name.first} {roleModalUser.name.last}
 </p>
 <select
 value={newRole}
 onChange={(e) => setNewRole(e.target.value)}
 className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-primary-foreground mb-4 focus:border-accent focus:outline-none"
 >
 {ROLES.filter(Boolean).map((r) => (
 <option key={r} value={r}>{r}</option>
 ))}
 </select>
 <div className="flex gap-3">
 <button
 onClick={handleRoleChange}
 className="flex-1 py-2 rounded-lg bg-accent text-primary-foreground text-sm font-medium hover:bg-accent-hover transition-colors"
 >
 Update
 </button>
 <button
 onClick={() => setRoleModalUser(null)}
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
