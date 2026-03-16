"use client";

import Image from "next/image";

interface SiteVisitCardProps {
    visit: any;
}

export default function SiteVisitCard({ visit }: SiteVisitCardProps) {
    const property = visit.propertyId;
    const thumbnail = property?.media?.images?.find((img: any) => img.isPrimary)?.url || property?.media?.images?.[0]?.url || "/placeholder-property.jpg";

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-warning-bg text-warning",
            confirmed: "bg-info-bg text-info",
            completed: "bg-success-bg text-success",
            cancelled: "bg-error-bg text-error",
            rescheduled: "bg-info-bg text-info",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors group">
            <div className="p-4 flex gap-4">
                <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                        src={thumbnail}
                        alt={property?.title || "Property"}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-primary truncate">
                            {property?.title || "Unknown Property"}
                        </h4>
                        {getStatusBadge(visit.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-secondary mb-2">
                        <svg className="w-3 h-3 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(visit.preferredDate).toLocaleDateString()} at {visit.preferredTime}</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-hover text-tertiary text-[10px] font-medium rounded-lg hover:bg-active transition-colors">
                            Reschedule
                        </button>
                        <button className="px-3 py-1 bg-hover text-error text-[10px] font-medium rounded-lg hover:bg-error-bg transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
