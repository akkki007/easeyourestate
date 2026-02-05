import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";

export default function BlogSection() {
    const articles = [
        {
            title: "Top 10 Emerging Real Estate Markets in India 2026",
            category: "Market Analysis",
            date: "Feb 12, 2026",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
        },
        {
            title: "A Comprehensive Guide to Buying Your First Home",
            category: "Buying Guide",
            date: "Feb 10, 2026",
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2573&auto=format&fit=crop"
        },
        {
            title: "Understanding Property Taxes and Legal Compliances",
            category: "Legal Advice",
            date: "Feb 08, 2026",
            image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop"
        }
    ];

    return (
        <section className="bg-w-light-bg py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-4xl font-bold text-w-primary-dark font-serif">Latest Resources</h2>
                        <p className="text-w-muted mt-2 text-lg">Expert guides, market news, and investment tips</p>
                    </div>
                    <button className="text-w-brand font-bold hover:underline flex items-center gap-1">
                        View All Articles <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                            <div className="relative h-56 bg-gray-200 overflow-hidden">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-w-primary-dark text-xs font-bold px-3 py-1 rounded-full">{article.category}</div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-xs text-w-muted font-medium mb-3">
                                    <Calendar className="w-3 h-3" /> {article.date}
                                </div>
                                <h3 className="text-xl font-bold text-w-primary-dark mb-4 line-clamp-2 leading-snug group-hover:text-w-brand transition-colors">{article.title}</h3>
                                <div className="font-semibold text-w-brand text-sm flex items-center gap-1">Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
