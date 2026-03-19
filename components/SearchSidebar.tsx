"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, RotateCcw, Info } from "lucide-react";

interface SearchSidebarProps {
    onFilterChange: (filters: any) => void;
    initialFilters: any;
}

export default function SearchSidebar({ onFilterChange, initialFilters }: SearchSidebarProps) {
    const [bhk, setBhk] = useState<string[]>(initialFilters.bhk ? initialFilters.bhk.split(",") : []);
    const [propertyStatus, setPropertyStatus] = useState(initialFilters.possession || "");
    const [furnishing, setFurnishing] = useState<string[]>(initialFilters.furnishing ? initialFilters.furnishing.split(",") : []);
    const [propertyType, setPropertyType] = useState<string[]>(initialFilters.type ? initialFilters.type.split(",") : []);
    const [parking, setParking] = useState<string[]>(initialFilters.parking ? initialFilters.parking.split(",") : []);
    const [priceRange, setPriceRange] = useState<string>("");

    const handleBhkToggle = (val: string) => {
        const newBhk = bhk.includes(val)
            ? bhk.filter((item) => item !== val)
            : [...bhk, val];

        setBhk(newBhk);

        onFilterChange({
            bhk: newBhk.length ? newBhk.join(",") : ""
        });
    };

    const handleFurnishingToggle = (val: string) => {
        setFurnishing((prev) => {
            const updated = prev.includes(val)
                ? prev.filter((item) => item !== val)
                : [...prev, val];

            onFilterChange({
                furnishing: updated.length ? updated.join(",") : ""
            });

            return updated;
        });
    };

    const handlePropertyTypeToggle = (val: string) => {
        setPropertyType((prev) => {
            const updated = prev.includes(val)
                ? prev.filter((item) => item !== val)
                : [...prev, val];

            onFilterChange({
                type: updated.length ? updated.join(",") : ""
            });

            return updated;
        });
    };

    const handlePriceSelect = (min: string, max: string) => {
        const value = `${min}-${max}`;

        const newValue = priceRange === value ? "" : value;

        setPriceRange(newValue);

        onFilterChange(
            newValue
                ? { minPrice: min, maxPrice: max }
                : { minPrice: "", maxPrice: "" }
        );
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
        <div className="w-80 flex-shrink-0 bg-card border border-border rounded-lg overflow-hidden hidden lg:block h-fit sticky top-24">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Filters</span>
                <button onClick={resetFilters} className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
            </div>

            <div className="p-5 space-y-8">
                {/* BHK Type */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">BHK Type</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleBhkToggle(val)}
                                className={`py-2 text-xs font-semibold rounded-md border transition-all ${bhk.includes(val)
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-card border-border text-muted-foreground hover:border-border"
                                    }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Budget</h3>

                    <div className="space-y-2">

                        {[
                            { label: "₹10k – ₹50k", min: "10000", max: "50000" },
                            { label: "₹50k – ₹1L", min: "50000", max: "100000" },
                            { label: "₹1L – ₹2L", min: "100000", max: "200000" }
                        ].map(({ label, min, max }) => {
                            const value = `${min}-${max}`;
                            const selected = priceRange === value;

                            return (
                                <button
                                    key={value}
                                    onClick={() => handlePriceSelect(min, max)}
                                    className={`block w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${selected
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-card border-border text-foreground hover:bg-accent"
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}

                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Area (sq ft)</h3>

                    <div className="space-y-2">

                        <button
                            onClick={() => onFilterChange({ min_area: "500", max_area: "1000" })}
                            className="block w-full text-left px-3 py-2 rounded-md border text-sm text-foreground hover:bg-muted"
                        >
                            500 – 1000 sqft
                        </button>

                        <button
                            onClick={() => onFilterChange({ min_area: "1000", max_area: "2000" })}
                            className="block w-full text-left px-3 py-2 rounded-md border text-sm text-foreground hover:bg-muted"
                        >
                            1000 – 2000 sqft
                        </button>

                        <button
                            onClick={() => onFilterChange({ min_area: "2000", max_area: "4000" })}
                            className="block w-full text-left px-3 py-2 rounded-md border text-sm text-foreground hover:bg-muted"
                        >
                            2000 – 4000 sqft
                        </button>

                        <button
                            onClick={() => onFilterChange({ min_area: "4000" })}
                            className="block w-full text-left px-3 py-2 rounded-md border text-sm text-foreground hover:bg-muted"
                        >
                            4000+ sqft
                        </button>

                    </div>
                </div>

                {/* New Builder Projects */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-foreground">New Builder Projects</span>
                    <span className="px-1.5 py-0.5 bg-error text-error text-[9px] font-bold rounded flex items-center gap-0.5 uppercase">
                        Offer
                    </span>
                </label>

                {/* Property Status */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Property Status</h3>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="status"
                                checked={propertyStatus === "under_construction"}
                                onChange={() => {
                                    setPropertyStatus("under_construction");
                                    onFilterChange({ possession: "under_construction" });
                                }}
                                className="w-4 h-4 border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Under Construction</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="status"
                                checked={propertyStatus === "ready"}
                                onChange={() => {
                                    setPropertyStatus("ready");
                                    onFilterChange({ possession: "ready" });
                                }}
                                className="w-4 h-4 border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Ready</span>
                        </label>
                    </div>
                </div>

                {/* Furnishing */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Furnishing</h3>
                    <div className="flex items-center gap-6">
                        {[
                            { label: "Full", value: "fully" },
                            { label: "Semi", value: "semi" },
                            { label: "None", value: "unfurnished" }
                        ].map((item) => (
                            <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={furnishing.includes(item.value)}
                                    onChange={() => handleFurnishingToggle(item.value)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item.value}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Property Type */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Property Type</h3>
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
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Parking */}
                <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Parking</h3>
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
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">2 Wheeler</span>
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
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">4 Wheeler</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
