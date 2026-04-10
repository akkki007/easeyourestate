"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, UserPlus, Trash2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import toast from "react-hot-toast";

type TeamMember = {
  id: string;
  memberUserId: string;
  memberName: string;
  memberEmail: string;
  role: "admin" | "editor" | "viewer";
  status: string;
  invitedAt: string;
  joinedAt?: string;
};

export default function TeamPage() {
  const [user, setUser] = useState<{ name?: { first?: string; last?: string } | string; email?: string } | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/agent/team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to load team members");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Email is required");
      return;
    }

    setInviting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/agent/team", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to send invite");
        setInviting(false);
        return;
      }

      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("viewer");
      setShowInviteModal(false);
      fetchMembers();
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    setRemoving(memberId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/agent/team/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to remove member");
        setRemoving(null);
        return;
      }

      toast.success("Team member removed");
      setMembers((current) => current.filter((m) => m.id !== memberId));
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemoving(null);
    }
  };

  const userName =
    user && typeof user.name === "object"
      ? `${user.name?.first || ""} ${user.name?.last || ""}`.trim()
      : (user?.name as string) || "User";
  const userEmail = user?.email || "";

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: "Admin", color: "bg-error/10 text-error" },
    editor: { label: "Editor", color: "bg-warning/10 text-warning" },
    viewer: { label: "Viewer", color: "bg-info/10 text-info" },
  };

  if (loading) {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Team" />
        <main className="p-6 flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Team" />
      <main className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Manage your team members and their permissions</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-primary-foreground font-medium text-sm hover:bg-accent-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Invite Team Member</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:border-accent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:border-accent transition"
                  >
                    <option value="viewer">Viewer - Can view listings and leads</option>
                    <option value="editor">Editor - Can edit listings and leads</option>
                    <option value="admin">Admin - Full access to team settings</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-hover transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-accent text-primary-foreground font-medium text-sm hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List */}
        {error ? (
          <div className="bg-card rounded-2xl border border-error/30 p-8 text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">Failed to load team</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-hover flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No team members yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Invite team members to collaborate on listings and leads management.
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary-foreground font-medium text-sm hover:bg-accent-hover"
            >
              <UserPlus className="w-4 h-4" />
              Invite First Member
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hover border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{member.memberName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.memberEmail}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${roleLabels[member.role].color}`}
                        >
                          {roleLabels[member.role].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground capitalize">{member.status}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removing === member.id}
                          className="text-error hover:bg-error/10 p-2 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Info */}
        <div className="bg-info/10 rounded-xl border border-info/20 p-6">
          <h4 className="font-semibold text-info mb-3">Permission Levels</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-foreground text-sm">Viewer</p>
              <p className="text-xs text-muted-foreground mt-1">Can view listings and leads</p>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Editor</p>
              <p className="text-xs text-muted-foreground mt-1">Can edit listings and leads, manage notes</p>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Admin</p>
              <p className="text-xs text-muted-foreground mt-1">Full access including team management</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
