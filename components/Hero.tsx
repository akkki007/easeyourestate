"use client";

import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { Search, MapPin, Home, IndianRupee, BedDouble } from "lucide-react";

export default function Hero() {
    const [text] = useTypewriter({
        words: ['Mumbai', 'Pune', 'Bengaluru', 'Delhi', 'Hyderabad'],
        loop: true,
        delaySpeed: 2000,
    });

    return (
        <section className="relative w-full">
            <div className="w-full">
                <div
                    className="flex min-h-[600px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-6 relative"
                    style={{
                        backgroundImage: `linear-gradient(rgba(122, 1, 184, 0.5), rgba(27, 30, 40, 0.8)), url("https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2600&auto=format&fit=crop")`
                    }}
                >
                    <div className="flex flex-col gap-4 text-center z-10 max-w-4xl px-4 mt-10">
                        <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight tracking-tight drop-shadow-lg">
                            Find Your Perfect Property, Faster
                        </h1>
                        <p className="text-white/95 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                            Buy, Rent, Sell & Invest Across India
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="w-full max-w-5xl mt-8 z-20">
                        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                            {/* Tabs or top filter could go here if needed, keeping it simple as per prompt fields */}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                {/* Location */}
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-3 hover:border-w-brand focus-within:border-w-brand transition-colors">
                                        <MapPin className="text-w-brand w-5 h-5 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="City/Locality"
                                            className="w-full outline-none text-gray-800 placeholder-gray-400 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Property Type */}
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Property Type</label>
                                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-3 hover:border-w-brand focus-within:border-w-brand transition-colors">
                                        <Home className="text-w-brand w-5 h-5 mr-2" />
                                        <select className="w-full outline-none text-gray-800 font-medium bg-transparent">
                                            <option>Apartment</option>
                                            <option>Villa</option>
                                            <option>Plot</option>
                                            <option>Commercial</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Budget</label>
                                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-3 hover:border-w-brand focus-within:border-w-brand transition-colors">
                                        <IndianRupee className="text-w-brand w-5 h-5 mr-1" />
                                        <select className="w-full outline-none text-gray-800 font-medium bg-transparent">
                                            <option>All</option>
                                            <option>50L - 1Cr</option>
                                            <option>1Cr - 5Cr</option>
                                            <option>5Cr+</option>
                                        </select>
                                    </div>
                                </div>

                                {/* BHK */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">BHK</label>
                                    <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-3 hover:border-w-brand focus-within:border-w-brand transition-colors">
                                        <BedDouble className="text-w-brand w-5 h-5 mr-2" />
                                        <select className="w-full outline-none text-gray-800 font-medium bg-transparent">
                                            <option>1 BHK</option>
                                            <option>2 BHK</option>
                                            <option>3 BHK</option>
                                            <option>4+ BHK</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <div className="md:col-span-2">
                                    <button className="w-full h-12 bg-gradient-cta text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                                        <Search className="w-5 h-5" />
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Easy Suggestions */}
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 hidden md:flex">
                                <span>Trending:</span>
                                <span className="font-semibold text-w-brand cursor-pointer hover:underline">Mumbai</span>
                                <span className="font-semibold text-w-brand cursor-pointer hover:underline">Pune</span>
                                <span className="font-semibold text-w-brand cursor-pointer hover:underline">Hyderabad</span>
                            </div>
                        </div>

                        {/* Recent Searches */}
                        <div className="mt-6 flex justify-center gap-4">
                            <div className="bg-w-primary-dark/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 cursor-pointer hover:bg-w-primary-dark transition-colors">
                                <Search className="w-3 h-3" />
                                Recent: 3 BHK in Pune
                            </div>
                            <div className="bg-w-primary-dark/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 cursor-pointer hover:bg-w-primary-dark transition-colors">
                                <Search className="w-3 h-3" />
                                Recent: Villa in Goa
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
