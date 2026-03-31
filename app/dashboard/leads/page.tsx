"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Phone, CalendarClock, MessageSquare, Building2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getUserDisplayName, useAuth } from "@/lib/auth/AuthContext";

type LeadStatus = "new" | "contacted" | "follow_up" | "visited" | "converted" | "lost";

type LeadItem = {
  _id: string;
  name: string;
  phone: string;
  message: string;
  status: LeadStatus | string;
  followUpDate?: string;
  lastContactedAt?: string;
  createdAt: string;
  notes?: Array<{ text: string; createdAt: string }>;
  propertyId?: {
    title?: string;
    slug?: string;
    location?: { locality?: string; city?: string };
    price?: { amount?: number };
    media?: { images?: Array<{ url: string }> };
  };
  buyerId?: {
    name?: { first?: string; last?: string };
    email?: string;
  };
};

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "follow_up", "visited", "converted", "lost"];

const statusClasses: Record<string, string> = {
  new: "bg-warning-bg text-warning",
  contacted: "bg-info-bg text-info",
  follow_up: "bg-accent/15 text-accent",
  visited: "bg-success-bg text-success",
  converted: "bg-success-bg text-success",
  lost: "bg-error/15 text-error",
};

function formatPrice(amount?: number) {
  if (!amount) return "Price on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AgentLeadsPage() {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftFollowUpDate, setDraftFollowUpDate] = useState<Record<string, string>>({});
  const [draftNote, setDraftNote] = useState<Record<string, string>>({});
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);

  const userName = getUserDisplayName(user);
  const userEmail = typeof user?.email === "string" ? user.email : "";
  const userRole = typeof user?.role === "string" ? user.role : "";

  useEffect(() => {
    if (!token || userRole !== "agent") {
      setLoading(false);
      return;
    }

    const fetchLeads = async () => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      try {
        const res = await fetch(`/api/agent/leads${params.toString() ? `?${params.toString()}` : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({ leads: [] }));

        if (!res.ok) {
          throw new Error(data.error || "Failed to load leads");
        }

        const nextLeads: LeadItem[] = Array.isArray(data.leads) ? (data.leads as LeadItem[]) : [];
        setLeads(nextLeads);
        setDraftStatus(
          nextLeads.reduce<Record<string, string>>((acc, lead) => {
            acc[lead._id] = lead.status || "new";
            return acc;
          }, {})
        );
        setDraftFollowUpDate(
          nextLeads.reduce<Record<string, string>>((acc, lead) => {
            acc[lead._id] = lead.followUpDate || "";
            return acc;
          }, {})
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [searchQuery, statusFilter, token, userRole]);

  const summary = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        if (lead.status === "converted") acc.converted += 1;
        if (lead.status === "follow_up") acc.followUp += 1;
        if (lead.status === "new") acc.new += 1;
        return acc;
      },
      { new: 0, followUp: 0, converted: 0 }
    );
  }, [leads]);

  const handleSave = async (leadId: string) => {
    if (!token) return;

    const payload = {
      status: draftStatus[leadId],
      followUpDate: draftFollowUpDate[leadId] || "",
      note: draftNote[leadId]?.trim() || undefined,
    };

    setSavingLeadId(leadId);
    try {
      const res = await fetch(`/api/agent/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update lead");
      }

      setLeads((current) => current.map((lead) => (lead._id === leadId ? data.lead : lead)));
      setDraftNote((current) => ({ ...current, [leadId]: "" }));
      toast.success("Lead updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setSavingLeadId(null);
    }
  };

  if (userRole && userRole !== "agent") {
    return (
      <>
        <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Leads" />
        <main className="p-6">
          <div className="bg-card rounded-2xl border border-border p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">Agent access only</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This workspace is reserved for agent lead management.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Leads" />
      <main className="p-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{leads.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Needs Follow Up</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{summary.followUp + summary.new}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Converted</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{summary.converted}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Lead Pipeline</h2>
              <p className="text-sm text-muted-foreground">Track buyer interest, add notes, and schedule follow ups.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buyer, phone, or message"
                className="min-w-64 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-error/30 bg-card p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">Couldn&apos;t load leads</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h3 className="text-lg font-semibold text-foreground">No leads yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              New buyer enquiries on your listings will appear here once they start coming in.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const propertyTitle = lead.propertyId?.title || "Listing unavailable";
              const propertySlug = lead.propertyId?.slug;
              const primaryImage = lead.propertyId?.media?.images?.[0]?.url;
              const location = [lead.propertyId?.location?.locality, lead.propertyId?.location?.city].filter(Boolean).join(", ");
              const lastNote = lead.notes?.[lead.notes.length - 1];
              const buyerName = [lead.buyerId?.name?.first, lead.buyerId?.name?.last].filter(Boolean).join(" ").trim() || lead.name;

              return (
                <article key={lead._id} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="grid gap-5 p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-2xl bg-secondary/40">
                      {primaryImage ? (
                        <img src={primaryImage} alt={propertyTitle} className="h-48 w-full object-cover lg:h-full" />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground lg:h-full">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusClasses[lead.status] || statusClasses.new}`}>
                              {lead.status.replace("_", " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Received {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">{buyerName}</h2>
                            <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="flex items-center gap-2 text-sm text-foreground">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {propertySlug ? (
                                <Link href={`/property/${propertySlug}`} className="hover:text-accent">
                                  {propertyTitle}
                                </Link>
                              ) : (
                                propertyTitle
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{location || "Location unavailable"}</p>
                            <p className="text-sm font-medium text-foreground">{formatPrice(lead.propertyId?.price?.amount)}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:w-90">
                          <label className="space-y-1 text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <select
                              value={draftStatus[lead._id] || lead.status}
                              onChange={(e) => setDraftStatus((current) => ({ ...current, [lead._id]: e.target.value }))}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-1 text-sm">
                            <span className="text-muted-foreground">Follow Up</span>
                            <input
                              type="date"
                              value={draftFollowUpDate[lead._id] || ""}
                              onChange={(e) => setDraftFollowUpDate((current) => ({ ...current, [lead._id]: e.target.value }))}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl bg-secondary/40 p-3">
                          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            Contact
                          </p>
                          <p className="mt-2 text-sm text-foreground">{lead.phone}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{lead.buyerId?.email || "Email not available"}</p>
                        </div>
                        <div className="rounded-xl bg-secondary/40 p-3">
                          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Next Follow Up
                          </p>
                          <p className="mt-2 text-sm text-foreground">
                            {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not scheduled"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {lead.lastContactedAt ? `Last contacted ${new Date(lead.lastContactedAt).toLocaleDateString("en-IN")}` : "No contact logged yet"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-secondary/40 p-3">
                          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Latest Note
                          </p>
                          <p className="mt-2 line-clamp-3 text-sm text-foreground">
                            {lastNote?.text || lead.message}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
                        <textarea
                          value={draftNote[lead._id] || ""}
                          onChange={(e) => setDraftNote((current) => ({ ...current, [lead._id]: e.target.value }))}
                          placeholder="Add a follow up note for your team"
                          rows={3}
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                        />
                        <button
                          onClick={() => handleSave(lead._id)}
                          disabled={savingLeadId === lead._id}
                          className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingLeadId === lead._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Update"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
