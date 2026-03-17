"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface PriceTrendChartProps {
    localitySlug: string;
    localityName: string;
}

export default function PriceTrendChart({ localitySlug, localityName }: PriceTrendChartProps) {
    const [data, setData] = useState<{ month: string; price: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await fetch(`/api/localities/${localitySlug}/price-trends`);
                const result = await res.json();

                if (result.trends && result.trends.length > 0) {
                    setData(result.trends.map((t: any) => ({
                        month: new Date(t.month).toLocaleString("default", { month: "short" }),
                        price: t.avgPricePerSqft,
                    })));
                } else {
                    // Fallback to mock data if no real data exists for demonstration
                    const mockData = [
                        { month: "Jan", price: 4500 },
                        { month: "Feb", price: 4650 },
                        { month: "Mar", price: 4600 },
                        { month: "Apr", price: 4800 },
                        { month: "May", price: 4950 },
                        { month: "Jun", price: 5100 },
                    ];
                    setData(mockData);
                }
            } catch (error) {
                console.error("Error fetching price trends:", error);
            } finally {
                setLoading(false);
            }
        };

        if (localitySlug) {
            fetchTrends();
        }
    }, [localitySlug]);

    if (loading) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-card border border-border rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-primary">Price Trends</h3>
                    <p className="text-sm text-secondary">Average price per sqft in {localityName}</p>
                </div>
                {data.length >= 2 && (() => {
                    const first = data[0].price;
                    const last = data[data.length - 1].price;
                    const change = first > 0 ? ((last - first) / first) * 100 : 0;
                    const isPositive = change >= 0;
                    return (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPositive ? "bg-success-bg text-success" : "bg-error-bg text-error"}`}>
                            {isPositive ? "+" : ""}{change.toFixed(1)}%
                        </div>
                    );
                })()}
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            itemStyle={{ color: "#8b5cf6" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
