import { Star, MapPin } from "lucide-react";
import Image from "next/image";

export default function AgentsShowcase() {
    const agents = [
        { name: "Rajesh Kumar", role: "Luxury Specialist", rating: "4.9", listings: 42, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop" },
        { name: "Priya Sharma", role: "Commercial Expert", rating: "4.8", listings: 35, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" },
        { name: "Arun Verma", role: "Residential Sales", rating: "5.0", listings: 56, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" },
        { name: "Meera Reddy", role: "Rentals & Leases", rating: "4.9", listings: 28, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2661&auto=format&fit=crop" },
    ];

    return (
        <section className="bg-w-professional py-24 text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-4xl font-bold font-serif">Meet Top Agents</h2>
                        <p className="text-blue-100 mt-2 text-lg">Connect with the best professionals in the industry</p>
                    </div>
                    <button className="border border-white/30 px-6 py-2 rounded-lg hover:bg-white hover:text-w-professional transition-all font-semibold">
                        View All Agents
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {agents.map((agent, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gray-600">
                                <Image
                                    src={agent.image}
                                    alt={agent.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-black" /> {agent.rating}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">{agent.name}</h3>
                            <p className="text-blue-200 text-sm mb-4">{agent.role}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-sm font-medium">{agent.listings} Listings</span>
                                <button className="text-sm font-bold text-blue-200 group-hover:text-white transition-colors">View Profile</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
