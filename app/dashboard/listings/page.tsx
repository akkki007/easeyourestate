"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2, Plus, Home, MapPin } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";

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
  createdAt: string;
  updatedAt: string;
};

export default function ListingsPage() {
  const [storedUser, setStoredUser] = useState<{ _id: string; name: { first: string; last: string } | string; email: string; role: string } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setStoredUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

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

      const url = statusFilter ? `/api/properties/my-listings?status=${statusFilter}` : "/api/properties/my-listings";

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setListings([]);
          setError(data.error || "Failed to load listings.");
          return;
        }

        setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch {
        setListings([]);
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [statusFilter]);

  const userName = storedUser ? (typeof storedUser.name === "object" ? storedUser.name.first : storedUser.name) || "User" : "User";
  const userEmail = storedUser?.email ?? "";



  return (
    <>
      <DashboardHeader userName={userName} userEmail={userEmail} pageTitle="My Listings" />
      <main className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-secondary text-sm">Manage your property listings</p>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="bg-card rounded-2xl border border-error/30 p-8 text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">Couldn&apos;t load listings</h3>
            <p className="text-secondary text-sm">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-hover flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No listings yet</h3>
            <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
              Add your first property to start receiving inquiries from buyers and tenants.
            </p>
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Link>
          </div>
        ) : (
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
        )}
      </main>
    </>
  );
}
