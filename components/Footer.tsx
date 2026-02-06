export default function Footer() {
    const footerLinks = {
        home: ['Hero Section', 'Features', 'Properties', 'Testimonials'],
        about: ['Our Story', 'Our Works', 'How It Works', 'Our Team'],
        properties: ['Portfolio', 'Categories'],
        services: ['Valuation', 'Marketing', 'Negotiation', 'Property Management'],
    }

    return (
        <footer className="bg-card-dark pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
                    {/* Logo and Newsletter */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">real_estate_agent</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">easeyourestate.ai</span>
                        </div>

                        {/* Newsletter Input */}
                        <div className="relative max-w-sm mb-8">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                mail
                            </span>
                            <input
                                className="w-full bg-[#1A1A1A] border border-border-dark rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter Your Email"
                                type="email"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>

                    {/* Home Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-500 uppercase tracking-widest text-xs">Home</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {footerLinks.home.map((link, index) => (
                                <li key={index}>
                                    <a className="text-gray-400 hover:text-primary transition-colors" href="#">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Us Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-500 uppercase tracking-widest text-xs">About Us</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {footerLinks.about.map((link, index) => (
                                <li key={index}>
                                    <a className="text-gray-400 hover:text-primary transition-colors" href="#">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Properties Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-500 uppercase tracking-widest text-xs">Properties</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {footerLinks.properties.map((link, index) => (
                                <li key={index}>
                                    <a className="text-gray-400 hover:text-primary transition-colors" href="#">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-500 uppercase tracking-widest text-xs">Services</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {footerLinks.services.map((link, index) => (
                                <li key={index}>
                                    <a className="text-gray-400 hover:text-primary transition-colors" href="#">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border-dark flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-8 text-sm font-medium">
                        <span className="text-gray-500">© 2024 easeyourestate.ai. All Rights Reserved.</span>
                        <a className="text-gray-400 hover:text-primary transition-colors" href="#">Terms &amp; Conditions</a>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        <a
                            className="w-10 h-10 rounded-full bg-background-dark border border-border-dark flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-sm">share</span>
                        </a>
                        <a
                            className="w-10 h-10 rounded-full bg-background-dark border border-border-dark flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-sm">language</span>
                        </a>
                        <a
                            className="w-10 h-10 rounded-full bg-background-dark border border-border-dark flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                            href="#"
                        >
                            <span className="material-symbols-outlined text-sm">mail</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
