"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw, Info } from "lucide-react";

interface SearchSidebarProps {
    onFilterChange: (filters: any) => void;
    initialFilters: any;
}

export default function SearchSidebar({ onFilterChange, initialFilters }: SearchSidebarProps) {
    const [bhk, setBhk] = useState<string[]>(initialFilters.bhk ? initialFilters.bhk.split(",") : []);
    const [propertyStatus, setPropertyStatus] = useState(initialFilters.status || "");
    const [furnishing, setFurnishing] = useState<string[]>(initialFilters.furnishing ? initialFilters.furnishing.split(",") : []);
    const [propertyType, setPropertyType] = useState<string[]>(initialFilters.type ? initialFilters.type.split(",") : []);
    const [parking, setParking] = useState<string[]>(initialFilters.parking ? initialFilters.parking.split(",") : []);

    const handleBhkToggle = (val: string) => {
        const newBhk = bhk.includes(val) ? bhk.filter((item) => item !== val) : [...bhk, val];
        setBhk(newBhk);
        onFilterChange({ bhk: newBhk.join(",") });
    };

    const handleFurnishingToggle = (val: string) => {
        const newFurnishing = furnishing.includes(val) ? furnishing.filter((item) => item !== val) : [...furnishing, val];
        setFurnishing(newFurnishing);
        onFilterChange({ furnishing: newFurnishing.join(",") });
    };

    const handlePropertyTypeToggle = (val: string) => {
        const newType = propertyType.includes(val) ? propertyType.filter((item) => item !== val) : [...propertyType, val];
        setPropertyType(newType);
        onFilterChange({ type: newType.join(",") });
    };

    const resetFilters = () => {
        setBhk([]);
        setPropertyStatus("");
        setFurnishing([]);
        setPropertyType([]);
        setParking([]);
        onFilterChange({});
    };

    return (
        <div className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden hidden lg:block h-fit sticky top-24">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <span className="text-sm font-bold text-teal-600 uppercase tracking-wider">Filters</span>
                <button onClick={resetFilters} className="text-xs font-semibold text-gray-500 hover:text-teal-600 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
            </div>

            <div className="p-5 space-y-8">
                {/* BHK Type */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4">BHK Type</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleBhkToggle(val)}
                                className={`py-2 text-xs font-semibold rounded-md border transition-all ${bhk.includes(val)
                                    ? "bg-teal-50 border-teal-500 text-teal-600 shadow-sm"
                                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300"
                                    }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* New Builder Projects */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-sm font-medium text-gray-700">New Builder Projects</span>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded flex items-center gap-0.5 uppercase">
                        Offer
                    </span>
                </label>

                {/* Property Status */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Property Status</h3>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="status"
                                checked={propertyStatus === "under_construction"}
                                onChange={() => setPropertyStatus("under_construction")}
                                className="w-4 h-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Under Construction</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="status"
                                checked={propertyStatus === "ready"}
                                onChange={() => setPropertyStatus("ready")}
                                className="w-4 h-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Ready</span>
                        </label>
                    </div>
                </div>

                {/* Furnishing */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Furnishing</h3>
                    <div className="flex items-center gap-6">
                        {["Full", "Semi", "None"].map((val) => (
                            <label key={val} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={furnishing.includes(val.toLowerCase())}
                                    onChange={() => handleFurnishingToggle(val.toLowerCase())}
                                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{val}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Property Type */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Property Type</h3>
                    <div className="space-y-3">
                        {[
                            { id: "apartment", label: "Apartment" },
                            { id: "villa", label: "Independent House/Villa" },
                            { id: "gated_villa", label: "Gated Community Villa" },
                            { id: "standalone", label: "Standalone Building" }
                        ].map((type) => (
                            <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={propertyType.includes(type.id)}
                                    onChange={() => handlePropertyTypeToggle(type.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Parking */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Parking</h3>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={parking.includes("two_wheeler")}
                                onChange={(e) => {
                                    const newParking = e.target.checked ? [...parking, "two_wheeler"] : parking.filter(p => p !== "two_wheeler");
                                    setParking(newParking);
                                    onFilterChange({ parking: newParking.join(",") });
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">2 Wheeler</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={parking.includes("four_wheeler")}
                                onChange={(e) => {
                                    const newParking = e.target.checked ? [...parking, "four_wheeler"] : parking.filter(p => p !== "four_wheeler");
                                    setParking(newParking);
                                    onFilterChange({ parking: newParking.join(",") });
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">4 Wheeler</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
