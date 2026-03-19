"use client";

import Link from"next/link";
import Image from"next/image";

interface EnquiryCardProps {
 enquiry: any;
}

export default function EnquiryCard({ enquiry }: EnquiryCardProps) {
 const property = enquiry.propertyId;
 const thumbnail = property?.media?.images?.find((img: any) => img.isPrimary)?.url || property?.media?.images?.[0]?.url ||"/placeholder-property.jpg";

 const getStatusBadge = (status: string) => {
 const styles: Record<string, string> = {
 pending:"bg-warning-bg text-warning",
 contacted:"bg-info-bg text-info",
 visited:"bg-success-bg text-success",
 open:"bg-info-bg text-info",
 closed:"bg-accent text-muted-foreground",
 converted:"bg-success-bg text-success",
 };

 return (
 <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
 {status}
 </span>
 );
 };

 return (
 <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-border transition-colors group">
 <div className="flex">
 <div className="w-32 h-32 relative flex-shrink-0">
 <Image
 src={thumbnail}
 alt={property?.title ||"Property"}
 fill
 className="object-cover"
 />
 </div>
 <div className="p-4 flex-grow min-w-0">
 <div className="flex justify-between items-start mb-1">
 <h4 className="font-semibold text-foreground truncate group-hover:text-muted-foreground transition-colors">
 {property?.title ||"Unknown Property"}
 </h4>
 {getStatusBadge(enquiry.status)}
 </div>
 <p className="text-muted-foreground text-xs truncate mb-2">
 {property?.location ?`${property.location.locality}, ${property.location.city}`:"Location unavailable"}
 </p>
 <div className="flex items-center justify-between mt-auto">
 <span className="text-sm font-bold text-foreground">
 {property?.price?.amount ?`₹${(property.price.amount / 10000000).toFixed(2)} Cr`:"Price on Request"}
 </span>
 <span className="text-[10px] text-muted-foreground">
 {new Date(enquiry.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>
 </div>
 <div className="px-4 py-2 bg-accent/30 border-t border-border flex justify-between items-center text-xs">
 <span className="text-muted-foreground italic truncate max-w-[200px]">"{enquiry.message}"</span>
 <Link href={`/dashboard/messages/${enquiry._id}`} className="text-foreground font-medium hover:underline">
 View Chat
 </Link>
 </div>
 </div>
 );
}
