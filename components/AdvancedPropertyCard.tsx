"use client";

import Link from "next/link";
import { Home, MapPin, Compass, Building2, Bath, Bike, User, Share2, ExternalLink } from "lucide-react";
import SavedPropertyButton from "./SavedPropertyButton";
import { useEffect } from "react";

export type AdvancedPropertyCardProps = {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  category: string;
  propertyType: string;
  status?: string;
  price?: { amount: number; currency: string; maintenance?: number };
  rental_details?: { monthly_rent: number, security_deposit: number, available_from: Date, pet_friendly: boolean };
  pg_details?: { monthly_rent: number, security_deposit: number, sharing_type: string[], meals_included: boolean, gender_preference: string };
  location: {
    city: string;
    locality: string;
    address: { line1: string; line2?: string; landmark?: string }
  };
  specs?: {
    bedrooms?: number;
    bathrooms?: number;
    facing?: string;
    area?: { builtUp?: number; unit?: string };
    parking?: { covered?: number; open?: number };
  };
  media: { primary: string | null } | null;
};

export default function AdvancedPropertyCard({
  id,
  slug,
  title,
  purpose,
  propertyType,
  price,
  rental_details,
  pg_details,
  location,
  specs,
  media,
}: AdvancedPropertyCardProps) {
  const formatPrice = (n: number) => {
    if (!n || n === 0) return "Price on Request";
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2).replace(/\.00$/, '')} Crores`;
    if (n >= 1_00_000) return `₹${(n / 1_00_00_000).toFixed(2).replace(/\.00$/, '')} Lacs`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const calculateEMI = (amount: number) => {
    if (!amount) return "N/A";
    // Very rough estimation: 8.5% interest for 20 years
    const monthlyRate = 0.085 / 12;
    const n = 20 * 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

    if (emi >= 1_00_000) return `${(emi / 1_00_00_000).toFixed(2)} Lacs/Mo`;
    return `${Math.round(emi).toLocaleString('en-IN')}/Mo`;
  };

  const getFacingLabel = (f?: string) => {
    const map: Record<string, string> = {
      north: "North", south: "South", east: "East", west: "West",
      ne: "North-East", nw: "North-West", se: "South-East", sw: "South-West"
    };
    return f ? map[f.toLowerCase()] || f : "Not Specified";
  };

  useEffect(() => {
    console.log("PROPERTY:", rental_details);

  }, [])

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-start justify-between">
        <div>
          <Link href={`/property/${slug}`} className="group flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {purpose === "pg" ? "PG / Co-living" : `${specs?.bedrooms || ''} BHK ${propertyType.replace(/_/g, '')}`} For {purpose === 'sell' ? 'Sale' : purpose === 'pg' ? 'PG' : 'Rent'} In {location.locality}
            </h2>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-[13px]">
            <span className="line-clamp-1">{location.address?.line1}, {location.locality}</span>
            <span className="text-muted-foreground">|</span>
            <button className="text-primary font-semibold hover:underline flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              Explore Nearby
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Info Strip */}
      <div className="flex divide-x divide-border bg-background/50">
        <div className="flex-1 p-4 flex flex-col items-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">₹</div>
            <span className="text-lg font-bold text-foreground">
              {(() => {
                const p = purpose.toLowerCase();
                if (p === "rent" || p === "lease") {
                  const amount = rental_details?.monthly_rent;
                  if (!amount) return "Price on Request";
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
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {purpose === "sell" ? `₹${Math.round((price?.amount || 0) / (specs?.area?.builtUp || 1)).toLocaleString()} per sq.ft.` : "Monthly Rent"}
          </span>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-foreground">
            {purpose === "sell"
              ? calculateEMI(price?.amount || 0)
              : ((rental_details?.security_deposit || pg_details?.security_deposit || 0) > 0
                ? formatPrice(rental_details?.security_deposit || pg_details?.security_deposit || 0)
                : "No Deposit")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {purpose === "sell" ? "Estimated EMI" : "Security Deposit"}
          </span>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center">
          <span className="text-lg font-bold text-foreground text-center">
            {purpose === "pg"
              ? (pg_details?.gender_preference || "Any")
              : purpose === "sell"
                ? `${specs?.area?.builtUp || 'N/A'} sqft`
                : (rental_details?.pet_friendly ? "Allowed" : "Not Allowed")}
          </span>
          <span className="text-[11px] text-muted-foreground text-center">
            {purpose === "pg" ? "Gender Preference" : purpose === "sell" ? "Builtup" : "Pets"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col md:flex-row p-4 gap-4">
        {/* Image Section */}
        <div className="w-full md:w-[240px] aspect-4/3 relative rounded-lg overflow-hidden bg-muted">
          {media?.primary ? (
            <img src={media.primary} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <SavedPropertyButton propertyId={id} />
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded flex items-center gap-1">
            <LucideStar className="w-3 h-3 fill-current" />
            Exclusive Deal
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-background/80 text-foreground text-[10px] font-medium rounded border border-border">
            1/15
          </div>
        </div>

        {/* Specs Grid */}
        <div className="flex-1 grid grid-cols-2 gap-px bg-muted border border-border rounded-lg overflow-hidden">
          <div className="bg-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-foreground">{getFacingLabel(specs?.facing)}</div>
              <div className="text-[11px] text-muted-foreground">Facing</div>
            </div>
          </div>
          <div className="bg-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-foreground">{specs?.bedrooms ? `${specs.bedrooms} BHK` : 'N/A'}</div>
              <div className="text-[11px] text-muted-foreground">Apartment Type</div>
            </div>
          </div>
          <div className="bg-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
              <Bath className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-foreground">{specs?.bathrooms || '0'}</div>
              <div className="text-[11px] text-muted-foreground">Bathrooms</div>
            </div>
          </div>
          <div className="bg-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-foreground">
                {specs?.parking?.covered ? 'Bike and Car' : 'Bike'}
              </div>
              <div className="text-[11px] text-muted-foreground">Parking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-card border-t border-border flex items-center justify-end">
        <Link href={`/property/${slug}`} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-colors text-sm shadow-sm">
          <User className="w-4 h-4" />
          Get Owner Details
        </Link>
      </div>
    </div>
  );
}

function LucideStar({ className, fill }: { className?: string; fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={fill || "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
