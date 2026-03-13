"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, getUserDisplayName } from "@/lib/auth/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import toast from "react-hot-toast";

interface SavedSearch {
  _id: string;
  name: string;
  filters: Record<string, unknown>;
  alertEnabled: boolean;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const { token, user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/user/saved-searches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load saved searches");
      const data = await res.json();
      setSearches(data.savedSearches);
    } catch {
      toast.error("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/user/saved-searches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSearches((prev) => prev.filter((s) => s._id !== id));
      toast.success("Search deleted");
    } catch {
      toast.error("Failed to delete search");
    }
  };

  const buildSearchUrl = (filters: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      }
    });
    return `/properties/search?${params.toString()}`;
  };

  const formatFilters = (filters: Record<string, unknown>) => {
    const labels: string[] = [];
    if (filters.city) labels.push(String(filters.city));
    if (filters.locality) labels.push(String(filters.locality));
    if (filters.purpose) labels.push(String(filters.purpose));
    if (filters.propertyType) labels.push(String(filters.propertyType).replace(/_/g, " "));
    if (filters.bedrooms) labels.push(`${filters.bedrooms} BHK`);
    if (filters.priceMin || filters.priceMax) {
      const min = filters.priceMin ? `${Number(filters.priceMin) / 100000}L` : "";
      const max = filters.priceMax ? `${Number(filters.priceMax) / 100000}L` : "";
      if (min && max) labels.push(`${min} - ${max}`);
      else if (min) labels.push(`${min}+`);
      else labels.push(`Up to ${max}`);
    }
    return labels;
  };

  const userName = getUserDisplayName(user);
  const userEmail = typeof user?.email === "string" ? user.email : "";

  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="Saved Searches" />
      <main className="p-6 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-primary font-medium mb-1">No saved searches</p>
            <p className="text-tertiary text-sm">When you save a search, it will appear here for quick access</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => {
              const filterLabels = formatFilters(search.filters);
              return (
                <div
                  key={search._id}
                  className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-primary text-sm truncate">{search.name}</h3>
                      {search.alertEnabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Alerts on
                        </span>
                      )}
                    </div>
                    {filterLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {filterLabels.map((label, i) => (
                          <span
                            key={i}
                            className="inline-flex px-2 py-0.5 rounded-md bg-hover text-xs text-secondary capitalize"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-tertiary">
                      Saved {new Date(search.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={buildSearchUrl(search.filters)}
                      className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
                    >
                      Run Search
                    </Link>
                    <button
                      onClick={() => handleDelete(search._id)}
                      className="p-2 rounded-lg border border-border text-secondary hover:bg-hover hover:text-red-500 transition-colors"
                      title="Delete saved search"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
