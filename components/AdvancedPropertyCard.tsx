"use client";

import Link from "next/link";
import { Home, MapPin, Compass, Building2, Bath, Bike, User, Share2, ExternalLink } from "lucide-react";

export type AdvancedPropertyCardProps = {
 id: string;
 slug: string;
 title: string;
 purpose: string;
 category: string;
 propertyType: string;
 status?: string;
 price: { amount: number; currency: string; maintenance?: number };
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
 slug,
 title,
 purpose,
 propertyType,
 price,
 location,
 specs,
 media,
}: AdvancedPropertyCardProps) {
 const formatPrice = (n: number) => {
 if (n >= 1_00_00_000) return`₹${(n / 1_00_00_000).toFixed(2)} Crores`;
 if (n >= 1_00_000) return`₹${(n / 1_00_000).toFixed(2)} Lacs`;
 return`₹${(n / 1000).toFixed(0)}K`;
 };

 const calculateEMI = (amount: number) => {
 // Very rough estimation: 8.5% interest for 20 years
 const monthlyRate = 0.085 / 12;
 const n = 20 * 12;
 const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

 if (emi >= 1_00_000) return`${(emi / 1_00_000).toFixed(2)} Lacs/Month`;
 return`${Math.round(emi).toLocaleString()}/Month`;
 };

 const getFacingLabel = (f?: string) => {
 const map: Record<string, string> = {
 north:"North", south:"South", east:"East", west:"West",
 ne:"North-East", nw:"North-West", se:"South-East", sw:"South-West"
 };
 return f ? map[f.toLowerCase()] || f :"Not Specified";
 };

 return (
 <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
 {/* Header */}
 <div className="p-4 border-b border-border flex items-start justify-between">
 <div>
 <Link href={`/property/${slug}`} className="group flex items-center gap-2">
 <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
 {specs?.bedrooms ||''} BHK {propertyType.replace(/_/g,'')} For {purpose ==='sell'?'Sale':'Rent'} In {location.locality}
 </h2>
 <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary"/>
 </Link>
 <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-[13px]">
 <span className="line-clamp-1">{location.address?.line1}, {location.locality}</span>
 <span className="text-muted-foreground">|</span>
 <button className="text-primary font-semibold hover:underline flex items-center gap-0.5">
 <MapPin className="w-3 h-3"/>
 Explore Nearby
 </button>
 </div>
 </div>
 <button className="p-1.5 text-muted-foreground hover:text-error hover:bg-error rounded-lg transition-all">
 <Share2 className="w-5 h-5"/>
 </button>
 </div>

 {/* Main Info Strip */}
 <div className="flex divide-x divide-border bg-background/50">
 <div className="flex-1 p-4 flex flex-col items-center">
 <div className="flex items-center gap-2 text-muted-foreground mb-1">
 <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">₹</div>
 <span className="text-lg font-bold text-foreground">{formatPrice(price.amount)}</span>
 </div>
 <span className="text-[11px] text-muted-foreground">₹{Math.round(price.amount / (specs?.area?.builtUp || 1)).toLocaleString()} per sq.ft.</span>
 </div>
 <div className="flex-1 p-4 flex flex-col items-center">
 <span className="text-lg font-bold text-foreground">{calculateEMI(price.amount)}</span>
 <span className="text-[11px] text-muted-foreground">Estimated EMI</span>
 </div>
 <div className="flex-1 p-4 flex flex-col items-center">
 <span className="text-lg font-bold text-foreground">{specs?.area?.builtUp ||'N/A'} {specs?.area?.unit ||'sqft'}</span>
 <span className="text-[11px] text-muted-foreground">Builtup</span>
 </div>
 </div>

 {/* Content Area */}
 <div className="flex flex-col md:flex-row p-4 gap-4">
 {/* Image Section */}
 <div className="w-full md:w-[240px] aspect-4/3 relative rounded-lg overflow-hidden bg-muted">
 {media?.primary ? (
 <img src={media.primary} alt={title} className="w-full h-full object-cover"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <Home className="w-12 h-12 text-muted-foreground"/>
 </div>
 )}
 <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded flex items-center gap-1">
 <LucideStar className="w-3 h-3 fill-current"/>
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
 <Compass className="w-4 h-4"/>
 </div>
 <div>
 <div className="text-[13px] font-bold text-foreground">{getFacingLabel(specs?.facing)}</div>
 <div className="text-[11px] text-muted-foreground">Facing</div>
 </div>
 </div>
 <div className="bg-card p-3 flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
 <Building2 className="w-4 h-4"/>
 </div>
 <div>
 <div className="text-[13px] font-bold text-foreground">{specs?.bedrooms ?`${specs.bedrooms} BHK`:'N/A'}</div>
 <div className="text-[11px] text-muted-foreground">Apartment Type</div>
 </div>
 </div>
 <div className="bg-card p-3 flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
 <Bath className="w-4 h-4"/>
 </div>
 <div>
 <div className="text-[13px] font-bold text-foreground">{specs?.bathrooms ||'0'}</div>
 <div className="text-[11px] text-muted-foreground">Bathrooms</div>
 </div>
 </div>
 <div className="bg-card p-3 flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
 <Bike className="w-4 h-4"/>
 </div>
 <div>
 <div className="text-[13px] font-bold text-foreground">
 {specs?.parking?.covered ?'Bike and Car':'Bike'}
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
 fill={fill ||"none"}
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 className={className}
 >
 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
 </svg>
 );
}
