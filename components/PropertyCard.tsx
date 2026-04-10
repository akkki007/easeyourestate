"use client";

import Link from"next/link";
import { Home, MapPin } from"lucide-react";
import SavedPropertyButton from "./SavedPropertyButton";

export type PropertyCardProps = {
 id: string;
 slug: string;
 title: string;
 purpose: string;
 category: string;
 propertyType: string;
 status?: string;
 price?: { amount: number; currency?: string; deposit?: number };
 rental_details?: { monthly_rent: number; security_deposit?: number };
 pg_details?: { monthly_rent: number; security_deposit?: number };
 location: { city: string; locality: string };
 media: { primary: string | null } | null;
};

export default function PropertyCard({
 id,
 slug,
 title,
 purpose,
 category,
 propertyType,
 status,
 price,
 rental_details,
 pg_details,
 location,
 media,
}: PropertyCardProps) {
 const formatPrice = (n: number) => {
 if (n >= 1_00_00_000) return`₹${(n / 1_00_00_000).toFixed(1)} Cr`;
 if (n >= 1_00_000) return`₹${(n / 1_00_000).toFixed(1)} L`;
 return`₹${(n / 1000).toFixed(0)}K`;
 };

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      active: "bg-success text-white shadow-sm",
      pending_review: "bg-warning text-white shadow-sm",
      sold: "bg-muted text-muted-foreground",
      rented: "bg-muted text-muted-foreground",
      archived: "bg-error text-white shadow-sm",
    };
    const labels: Record<string, string> = {
      active: "Available",
      pending_review: "Pending",
      sold: "Sold",
      rented: "Rented",
      draft: "Draft",
    };
    const label = labels[s] || s.replace(/_/g, " ");
    return (
      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[s] ?? "bg-muted text-muted-foreground"}`}>
        {label}
      </span>
    );
  };

 return (
 <Link
 href={`/property/${slug}`}
 className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-xl transition-all cursor-pointer block group"
 >
 <div className="aspect-[16/10] bg-background relative overflow-hidden">
 {media?.primary ? (
 <img
 src={media.primary}
 alt={title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <Home className="w-12 h-12 text-muted-foreground"/>
 </div>
 )}
  <SavedPropertyButton propertyId={id} />
  {(status || purpose) && (
    <div className="absolute top-3 left-3">
      {statusBadge(status || (purpose === "Rent" ? "active" : "pending_review"))}
    </div>
  )}
  </div>
 <div className="p-4">
 <h3 className="font-bold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">{title}</h3>
 <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
 <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary"/>
 <span className="line-clamp-1">{location.locality}, {location.city}</span>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <p className="text-xl font-bold text-primary">
 {(()=>{
 const p = purpose.toLowerCase();
 if (p === "rent" || p === "lease") {
 const amount = rental_details?.monthly_rent || 0;
 if (amount === 0) return "Price on Request";
 return `₹${amount.toLocaleString('en-IN')} / month`;
 }
 if (p === "pg") {
 const amount = pg_details?.monthly_rent || 0;
 if (amount === 0) return "Price on Request";
 return `₹${amount.toLocaleString('en-IN')} / month`;
 }
 const amount = price?.amount || 0;
 if (amount === 0) return "Price on Request";
 return formatPrice(amount);
 })()}
 </p>
 <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
 {propertyType.replace(/_/g,"")} · {category}
 </p>
 </div>
 </div>
 </Link>
 );
}
