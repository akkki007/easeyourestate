"use client";

import { useState, useEffect } from "react";
import EnquiryCard from "./EnquiryCard";
import SiteVisitCard from "./SiteVisitCard";

interface BuyerDashboardProps {
    user: any;
}

export default function BuyerDashboard({ user }: BuyerDashboardProps) {
    const [activeTab, setActiveTab] = useState("enquiries");
    const [enquiries, setEnquiries] = useState([]);
    const [savedProperties, setSavedProperties] = useState([]);
    const [siteVisits, setSiteVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                // Fetch enquiries
                const enquiriesRes = await fetch("/api/leads", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const enquiriesData = await enquiriesRes.json();
                setEnquiries(enquiriesData.leads || []);

                // Fetch site visits
                const visitsRes = await fetch("/api/site-visits", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const visitsData = await visitsRes.json();
                setSiteVisits(visitsData.siteVisits || []);

                // Saved properties (from user object or separate API)
                setSavedProperties(user?.preferences?.favoriteProperties || []);

            } catch (error) {
                console.error("Error fetching buyer dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const tabs = [
        { id: "enquiries", label: "My Enquiries", count: enquiries.length },
        { id: "saved", label: "Saved Properties", count: savedProperties.length },
        { id: "visits", label: "Scheduled Visits", count: siteVisits.length },
        { id: "searches", label: "Saved Searches", count: user?.preferences?.savedSearches?.length || 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                            ${activeTab === tab.id
                                ? "border-accent text-accent"
                                : "border-transparent text-secondary hover:text-primary hover:border-border"
                            }
                        `}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-hover text-tertiary text-xs">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === "enquiries" && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {enquiries.length > 0 ? (
                                    enquiries.map((enquiry: any) => (
                                        <EnquiryCard key={enquiry._id} enquiry={enquiry} />
                                    ))
                                ) : (
                                    <EmptyState message="No enquiries yet" />
                                )}
                            </div>
                        )}

                        {activeTab === "saved" && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedProperties.length > 0 ? (
                                    <p>Saved properties implementation coming soon or use existing property cards</p>
                                ) : (
                                    <EmptyState message="No saved properties" />
                                )}
                            </div>
                        )}

                        {activeTab === "visits" && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {siteVisits.length > 0 ? (
                                    siteVisits.map((visit: any) => (
                                        <SiteVisitCard key={visit._id} visit={visit} />
                                    ))
                                ) : (
                                    <EmptyState message="No scheduled visits" />
                                )}
                            </div>
                        )}

                        {activeTab === "searches" && (
                            <div className="space-y-4">
                                {user?.preferences?.savedSearches?.length > 0 ? (
                                    user.preferences.savedSearches.map((search: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-card border border-border rounded-xl flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium">{search.name}</h4>
                                                <p className="text-xs text-tertiary">Saved on {new Date(search.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button className="text-sm text-accent font-medium">View Results</button>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No saved searches" />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-primary font-medium">{message}</p>
            <p className="text-secondary text-sm mt-1">Start exploring properties to see results here</p>
        </div>
    );
}
