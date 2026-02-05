import { BadgeCheck, Search, Users, ShieldCheck, Sparkles, Bell } from "lucide-react";

export default function WhyChoose() {
    const benefits = [
        { icon: BadgeCheck, title: "Verified Listings", desc: "Every property is physically verified by our ground team." },
        { icon: Search, title: "Smart Search", desc: "Find your dream home with our advanced AI-driven filters." },
        { icon: Users, title: "Trusted Agents", desc: "Connect with the top 1% rated real estate professionals." },
        { icon: ShieldCheck, title: "Secure Payments", desc: "Safe and transparent transaction processing." },
        { icon: Sparkles, title: "AI Recommendations", desc: "Personalized property matches based on your lifestyle." },
        { icon: Bell, title: "Real-Time Alerts", desc: "Get notified instantly when new properties match your criteria." },
    ];

    return (
        <section className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-w-primary-dark font-serif">Why Choose Wisteria</h2>
                    <p className="text-w-muted mt-4 text-lg max-w-2xl mx-auto">We are redefining the real estate experience with technology, trust, and transparency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((item, idx) => (
                        <div key={idx} className="p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white">
                            <div className="size-14 rounded-xl bg-w-light-bg flex items-center justify-center text-w-brand mb-6 group-hover:bg-w-brand group-hover:text-white transition-colors">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-w-primary-dark mb-3">{item.title}</h3>
                            <p className="text-w-muted leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
