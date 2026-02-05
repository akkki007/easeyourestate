"use client";

import Image from "next/image";
import { MapPin, BedDouble, Bath, ArrowRight, Heart } from "lucide-react";

export default function FeaturedProperties() {
    const properties = [
        {
            title: "The Sky Penthouse",
            price: "₹ 45 Cr",
            location: "Worli, Mumbai",
            beds: 5,
            baths: 6,
            sqft: "6,500",
            tags: ["Featured"],
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop"
        },
        {
            title: "Heritage Villa Estate",
            price: "₹ 12.5 Cr",
            location: "Assagao, North Goa",
            beds: 4,
            baths: 5,
            sqft: "4,200",
            tags: ["Sponsored"],
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            title: "DLF The Camellias",
            price: "₹ 110 Cr",
            location: "Golf Course Road, Gurgaon",
            beds: 4,
            baths: 5,
            sqft: "7,400",
            tags: [],
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop"
        },
        {
            title: "Epsilon Villa",
            price: "₹ 28 Cr",
            location: "Yemalur, Bangalore",
            beds: 5,
            baths: 6,
            sqft: "5,800",
            tags: ["Featured"],
            image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop"
        },
    ];

    return (
        <section className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-w-primary-dark text-4xl font-bold font-serif leading-tight">Featured & Sponsored</h2>
                        <p className="text-w-muted mt-2 text-lg">Handpicked premium properties for the discerning buyer</p>
                    </div>

                    {/* Horizontal scroll controls could go here, simplified to grid for now but layout ready */}
                    <button className="text-w-brand font-bold hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Horizontal scroll container if needed, but grid is often cleaner for "Developer-ready" unless complex slider implemented */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {properties.map((prop, idx) => (
                        <div key={idx} className="group flex flex-col rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full hover:-translate-y-1">
                            <div className="relative h-64 bg-gray-200 overflow-hidden">
                                <Image
                                    src={prop.image}
                                    alt={prop.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {prop.tags.includes("Featured") && (
                                        <span className="bg-w-badge text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Featured
                                        </span>
                                    )}
                                    {prop.tags.includes("Sponsored") && (
                                        <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Sponsored
                                        </span>
                                    )}
                                </div>

                                <button className="absolute top-4 right-4 text-white hover:text-red-500 bg-black/20 p-2 rounded-full backdrop-blur-md transition-all hover:bg-white active:scale-95">
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-bold text-w-primary-dark">{prop.price}</h3>
                                </div>
                                <h4 className="text-lg font-semibold mb-2 line-clamp-1 text-w-primary-dark group-hover:text-w-brand transition-colors">{prop.title}</h4>
                                <div className="flex items-center text-w-muted text-sm mb-4">
                                    <MapPin className="w-4 h-4 mr-1 text-w-brand" />
                                    {prop.location}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex gap-4 text-w-muted text-sm font-medium">
                                        <div className="flex items-center gap-1">
                                            <BedDouble className="w-4 h-4" /> {prop.beds}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bath className="w-4 h-4" /> {prop.baths}
                                        </div>
                                        <div>{prop.sqft} sqft</div>
                                    </div>
                                </div>

                                <button className="mt-5 w-full py-3 rounded-lg border border-w-brand text-w-brand font-bold hover:bg-w-brand hover:text-white transition-all">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
