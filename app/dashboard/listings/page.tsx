"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2, Plus, Home, MapPin } from "lucide-react";

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
  const { user } = useUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const url = statusFilter ? `/api/properties/my-listings?status=${statusFilter}` : "/api/properties/my-listings";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.listings) setListings(data.listings);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const userName = user?.firstName ?? "User";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const formatPrice = (n: number) => {
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)} Cr`;
    if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)} L`;
    return `₹${(n / 1000).toFixed(0)}K`;
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-tertiary/20 text-tertiary",
      active: "bg-success-bg text-success",
      pending_review: "bg-warning-bg text-warning",
      sold: "bg-hover text-secondary",
      rented: "bg-hover text-secondary",
      archived: "bg-error-bg text-error",
    };
    const label = status.replace(/_/g, " ");
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? "bg-hover text-secondary"}`}>
        {label}
      </span>
    );
  };

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
              <Link
                key={listing.id}
                href={`/property/${listing.slug}`}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-border-hover hover:shadow-lg transition-all cursor-pointer block"
              >
                <div className="aspect-[4/3] bg-hover relative">
                  {listing.media?.primary ? (
                    <img
                      src={listing.media.primary}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-tertiary" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    {statusBadge(listing.status)}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-block px-2 py-1 rounded-lg bg-black/60 text-white text-sm font-medium capitalize">
                      {listing.purpose}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-primary line-clamp-2 mb-1">{listing.title}</h3>
                  <div className="flex items-center gap-1.5 text-tertiary text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{listing.location.locality}, {listing.location.city}</span>
                  </div>
                  <p className="text-lg font-semibold text-accent">
                    {formatPrice(listing.price.amount)}
                  </p>
                  <p className="text-xs text-tertiary mt-2 capitalize">
                    {listing.propertyType.replace(/_/g, " ")} · {listing.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
