export default function Features() {
    const features = [
        {
            icon: 'home',
            title: 'Find Your Dream Home',
        },
        {
            icon: 'monetization_on',
            title: 'Unlock Property Value',
        },
        {
            icon: 'apartment',
            title: 'Effortless Management',
        },
        {
            icon: 'lightbulb',
            title: 'Smart Investments',
        },
    ]

    return (
        <section className="bg-bg-secondary py-4">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 border border-border rounded-3xl overflow-hidden bg-surface-elevated">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`p-8 hover:bg-hover transition-colors group cursor-pointer ${index < features.length - 1 ? 'border-r border-border' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">
                                    {feature.icon}
                                </span>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">
                                    north_east
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
