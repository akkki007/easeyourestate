"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Calendar,
    BarChart2,
    Download,
    Check,
    Plus,
    X,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

interface PropertyActionsProps {
    property: any;
    token: string | null;
    isAuthenticated: boolean;
}

export default function PropertyActions({ property, token, isAuthenticated }: PropertyActionsProps) {
    const router = useRouter();
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [isCompared, setIsCompared] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const compareIds = JSON.parse(localStorage.getItem("compareProperties") || "[]");
        setIsCompared(compareIds.includes(property._id));
    }, [property._id]);

    const handleCompareToggle = () => {
        let compareIds = JSON.parse(localStorage.getItem("compareProperties") || "[]");
        if (isCompared) {
            compareIds = compareIds.filter((id: string) => id !== property._id);
            toast.success("Removed from comparison");
        } else {
            if (compareIds.length >= 3) {
                toast.error("Can only compare up to 3 properties");
                return;
            }
            compareIds.push(property._id);
            toast.success("Added to comparison");
        }
        localStorage.setItem("compareProperties", JSON.stringify(compareIds));
        setIsCompared(!isCompared);
    };

    const handleMessageOwner = async () => {
        if (!token) {
            toast.error("Please login first");
            router.push("/login");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    recipientId: property.listedBy._id,
                    propertyId: property._id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to start conversation");
            }

            router.push(`/dashboard/messages`);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    const handleDownloadBrochure = async () => {
        try {
            const res = await fetch(`/api/properties/${property.slug}/brochure`);
            const data = await res.json();
            if (res.ok && data.url) {
                window.open(data.url, "_blank");
            } else {
                toast.error(data.error || "Brochure not available");
            }
        } catch (error) {
            toast.error("Failed to download brochure");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setShowEnquiryModal(true)}
                    className="flex flex-col items-center justify-center p-4 bg-primary rounded-2xl border border-primary text-primary-foreground hover:bg-primary transition-colors"
                >
                    <MessageSquare className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">Enquire</span>
                </button>
                <button
                    onClick={() => setShowVisitModal(true)}
                    className="flex flex-col items-center justify-center p-4 bg-primary rounded-2xl border border-primary text-primary-foreground hover:bg-primary transition-colors"
                >
                    <Calendar className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">Book Visit</span>
                </button>
                {/* ✅ NEW BUTTON */}
                <button
                    onClick={handleMessageOwner}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 bg-primary rounded-2xl border border-primary text-primary-foreground hover:bg-primary transition-colors"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                    ) : (
                        <MessageSquare className="w-6 h-6 mb-1" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                        Message Owner
                    </span>
                </button>

            </div>

            <div className="space-y-3">
                <div className="flex gap-2">
                    <button
                        onClick={handleCompareToggle}
                        className={`grow py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${isCompared
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-card border-border text-foreground hover:border-primary hover:text-primary"
                            }`}
                    >
                        {isCompared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isCompared ? "In Comparison" : "Add to Compare"}
                    </button>

                    {JSON.parse(localStorage.getItem("compareProperties") || "[]").length > 1 && (
                        <button
                            onClick={() => window.location.href = `/properties/compare?ids=${JSON.parse(localStorage.getItem("compareProperties") || "[]").join(",")}`}
                            className="px-4 py-3 bg-accent text-primary-foreground rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors flex items-center gap-2"
                        >
                            Compare Now
                        </button>
                    )}
                </div>

                <button
                    onClick={handleDownloadBrochure}
                    className="w-full py-3 px-4 bg-card border border-border text-foreground rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:border-primary hover:text-primary transition-all"
                >
                    <Download className="w-4 h-4" />
                    Download Brochure
                </button>
            </div>

            {showEnquiryModal && (
                <EnquiryModal
                    property={property}
                    onClose={() => setShowEnquiryModal(false)}
                    token={token}
                />
            )}

            {showVisitModal && (
                <VisitModal
                    property={property}
                    onClose={() => setShowVisitModal(false)}
                    token={token}
                />
            )}
        </div>
    );
}

function EnquiryModal({ property, onClose, token }: any) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        message: "I am interested in this property.",
        intent: "info"
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    propertyId: property._id,
                    ...formData
                })
            });
            if (res.ok) {
                toast.success("Enquiry sent successfully!");
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to send enquiry");
            }
        } catch (error) {
            toast.error("Internal Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold">Enquire about Property</h3>
                    <button onClick={onClose} className="p-1 hover:bg-accent rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Your Name</label>
                        <input
                            required
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Phone Number</label>
                        <input
                            required
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Message</label>
                        <textarea
                            required
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all resize-none"
                            placeholder="Type your message..."
                            rows={3}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Intent</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["info", "buy", "visit"].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, intent: opt })}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition-all ${formData.intent === opt
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "bg-card border-border text-muted-foreground"
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Send Enquiry
                    </button>
                </form>
            </div>
        </div>
    );
}

function VisitModal({ property, onClose, token }: any) {
    const [formData, setFormData] = useState({
        preferredDate: "",
        preferredTime: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/site-visits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    propertyId: property._id,
                    ...formData
                })
            });
            if (res.ok) {
                toast.success("Site visit scheduled!");
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to schedule visit");
            }
        } catch (error) {
            toast.error("Internal Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold">Schedule Site Visit</h3>
                    <button onClick={onClose} className="p-1 hover:bg-accent rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Preferred Date</label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all"
                            value={formData.preferredDate}
                            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Preferred Time</label>
                        <input
                            required
                            type="time"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all"
                            value={formData.preferredTime}
                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Additional Notes</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none transition-all resize-none"
                            placeholder="Any specific requirements..."
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Schedule Visit
                    </button>
                </form>
            </div>
        </div>
    );
}
