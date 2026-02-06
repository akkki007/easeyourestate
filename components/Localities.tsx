"use client";

import { ArrowRight } from "lucide-react";

export default function Localities() {
    const cities = [
        {
            name: "Mumbai",
            count: "12,400+ Properties",
            image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2535&auto=format&fit=crop"
        },
        {
            name: "Pune",
            count: "8,500+ Properties",
            image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2600&auto=format&fit=crop"
        },
        {
            name: "Bengaluru",
            count: "10,200+ Properties",
            image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2670&auto=format&fit=crop"
        },
        {
            name: "Delhi NCR",
            count: "9,800+ Properties",
            image: "https://images.unsplash.com/photo-1587474260584-1890546f0027?q=80&w=2500&auto=format&fit=crop"
        },
        {
            name: "Hyderabad",
            count: "7,100+ Properties",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
        }
    ];

    return (
        <section className="bg-w-soft-bg py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-w-primary-dark text-4xl font-bold font-serif leading-tight">Popular Cities</h2>
                        <p className="text-w-muted mt-2 text-lg">Most sought-after locations for real estate investment</p>
                    </div>
                    <button className="text-w-brand font-bold hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {cities.map((city, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-cover bg-center cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            style={{
                                backgroundImage: `url("${city.image}")`
                            }}
                        >
                            {/* Base Gradient Layer */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                            {/* Hover Overlay Layer */}
                            <div className="absolute inset-0 bg-w-overlay-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="absolute bottom-0 left-0 p-6 w-full z-10">
                                <h3 className="text-white text-2xl font-bold tracking-wide group-hover:scale-105 transition-transform origin-left">{city.name}</h3>
                                <p className="text-white/90 text-sm font-medium mt-1">{city.count}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
