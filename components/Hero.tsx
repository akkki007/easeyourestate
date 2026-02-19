import Image from 'next/image'

export default function Hero() {
    return (
        <header className="relative overflow-hidden hero-gradient">
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="z-10">
                    <h1 className="text-5xl tracking-tighter leading-none lg:text-6xl font-bold leading-[1.15] mb-6 text-balance">
                        Discover Your Dream Property with easeyourestate Properties
                    </h1>   
                    <p className="text-lg text-gray-400 mb-10 max-w-xl">
                        Your journey to finding the perfect property begins here. Explore our listings to find the home that matches your dreams.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 mb-12">
                        <button className="px-8 py-4 rounded-xl font-medium bg-accent text-white shadow-md hover:bg-accent-hover hover:shadow-lg transition-colors">
                            Browse Properties
                        </button>
                        <button className="px-8 py-4 rounded-xl font-medium border border-border bg-surface text-primary hover:bg-hover transition-colors">
                            Learn More
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="theme-card p-6 rounded-2xl">
                            <div className="text-3xl font-bold mb-1">200+</div>
                            <div className="text-sm text-secondary">Happy Customers</div>
                        </div>
                        <div className="theme-card p-6 rounded-2xl">
                            <div className="text-3xl font-bold mb-1">10k+</div>
                            <div className="text-sm text-secondary">Properties For Clients</div>
                        </div>
                        <div className="theme-card p-6 rounded-2xl">
                            <div className="text-3xl font-bold mb-1">16+</div>
                            <div className="text-sm text-secondary">Years of Experience</div>
                        </div>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative lg:h-[600px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75"></div>
                    <img
                        alt="Futuristic Building Architecture"
                        className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0YWXTgbkyXV3tNxENOZKNXCKz3wtSBrniu-J1tiplN-3yRVHuiBdCeTGgYaVbqLrGtWUoHdR9Gh4cePqPlcGh6_wtcHgmGc_4u9hJ4uYDy9f8y8hTL1GA3x3aREL8BFutAzXIodt21O20g3NHUkBUtI_Tey-gabADRo09qe3PPUK1ME0e77qWShgc4bKZUo4zPAIqh4Im5_3Fh-vbYgR1OnAgKhhqbY4YsrX9Kwx34ywVofBgni0NJAOs39lAthVhe2Bc57F0t4iT"
                    />
                    <div className="absolute -top-6 -left-6 bg-card-dark/90 border border-border-dark p-4 rounded-full backdrop-blur-md animate-bounce z-20">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">north_east</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
