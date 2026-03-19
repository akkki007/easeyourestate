"use client";

import { useState } from "react";
import Image from "next/image";

interface SiteVisitCardProps {
    visit: any;
    onUpdate: () => void;
}

export default function SiteVisitCard({ visit, onUpdate }: SiteVisitCardProps) {
    const property = visit.propertyId;
    const thumbnail = property?.media?.images?.find((img: any) => img.isPrimary)?.url || property?.media?.images?.[0]?.url || "/placeholder-property.jpg";

    const [showReschedule, setShowReschedule] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState(visit.preferredDate?.slice(0, 10) || "");
    const [rescheduleTime, setRescheduleTime] = useState(visit.preferredTime || "");
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleReschedule = async () => {
        if (!rescheduleDate || !rescheduleTime) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/site-visits/${visit._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    preferredDate: rescheduleDate,
                    preferredTime: rescheduleTime,
                    status: "rescheduled",
                }),
            });
            if (res.ok) {
                setShowReschedule(false);
                onUpdate();
            }
        } catch (error) {
            console.error("Reschedule error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/site-visits/${visit._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Cancel error:", error);
        } finally {
            setLoading(false);
            setConfirmCancel(false);
        }
    };

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

    const isActionable = visit.status !== "completed" && visit.status !== "cancelled";

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-border transition-colors group">
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
                        <h4 className="font-semibold text-foreground truncate">
                            {property?.title || "Unknown Property"}
                        </h4>
                        {getStatusBadge(visit.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(visit.preferredDate).toLocaleDateString()} at {visit.preferredTime}</span>
                    </div>
                    {isActionable && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowReschedule(!showReschedule); setConfirmCancel(false); }}
                                disabled={loading}
                                className="px-3 py-1 bg-accent text-muted-foreground text-[10px] font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                Reschedule
                            </button>
                            <button
                                onClick={() => { setConfirmCancel(!confirmCancel); setShowReschedule(false); }}
                                disabled={loading}
                                className="px-3 py-1 bg-accent text-error text-[10px] font-medium rounded-lg hover:bg-error-bg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reschedule form */}
            {showReschedule && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Date</label>
                            <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="w-full px-3 py-1.5 text-sm bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-border"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Time</label>
                            <input
                                type="time"
                                value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-border"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowReschedule(false)}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReschedule}
                            disabled={loading || !rescheduleDate || !rescheduleTime}
                            className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Confirm"}
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel confirmation */}
            {confirmCancel && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-3">Are you sure you want to cancel this visit?</p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setConfirmCancel(false)}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            No, keep it
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-4 py-1.5 text-xs bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Cancelling..." : "Yes, cancel visit"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
