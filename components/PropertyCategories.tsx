import { Home, Key, Building2, BedDouble, Trees, Crown } from "lucide-react";

const categories = [
    { icon: Home, label: "Buy", count: "140+" },
    { icon: Key, label: "Rent", count: "85+" },
    { icon: Building2, label: "Commercial", count: "50+" },
    { icon: BedDouble, label: "PG & Co-living", count: "120+" },
    { icon: Trees, label: "Plots", count: "90+" },
    { icon: Crown, label: "Luxury", count: "30+" },
];

export default function PropertyCategories() {
    return (
        <section className="py-20 bg-w-light-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-w-primary-dark mb-4">Browse by Category</h2>
                    <p className="text-w-muted text-lg">Explore properties by type and requirement</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-xl hover:bg-w-brand transition-all duration-300 cursor-pointer border border-transparent hover:border-w-brand/20 hover:-translate-y-1"
                        >
                            <div className="p-4 rounded-full bg-w-light-bg group-hover:bg-white/10 transition-colors">
                                <cat.icon className="w-8 h-8 text-w-brand group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-w-primary-dark group-hover:text-white transition-colors">{cat.label}</h3>
                                <p className="text-sm text-w-muted group-hover:text-white/80 transition-colors">{cat.count} listings</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
