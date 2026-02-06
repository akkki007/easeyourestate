"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-w-deep-dark pt-20 pb-10 text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: About & Logo */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="size-8 bg-w-brand rounded-lg flex items-center justify-center text-white font-bold">W</div>
                            <h2 className="text-white text-xl font-bold tracking-tight">Wisteria Properties</h2>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            The world&apos;s leading marketplace for high-end real estate, offering unparalleled access to signature homes and investment opportunities.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-w-brand hover:text-white transition-all text-gray-400">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-w-brand hover:text-white transition-all text-gray-400">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-w-brand hover:text-white transition-all text-gray-400">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-w-brand hover:text-white transition-all text-gray-400">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-white text-lg">Quick Links</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link className="hover:text-w-brand transition-colors" href="/buy">Buy Property</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="/rent">Rent Property</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="/commercial">Commercial</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="/projects">New Projects</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="/agents">Find Agents</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div>
                        <h4 className="font-bold mb-6 text-white text-lg">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link className="hover:text-w-brand transition-colors" href="#">Help Center</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="#">Legal & Privacy</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="#">Terms of Service</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="#">Report a Problem</Link></li>
                            <li><Link className="hover:text-w-brand transition-colors" href="#">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h4 className="font-bold mb-6 text-white text-lg">Newsletter</h4>
                        <p className="text-sm text-gray-400 mb-6">Subscribe to our newsletter for the latest market insights and exclusive listings.</p>
                        <div className="flex group">
                            <input
                                className="w-full rounded-l-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm p-3 outline-none focus:border-w-brand transition-all"
                                placeholder="Email address"
                                type="email"
                            />
                            <button className="bg-w-brand text-white px-5 rounded-r-lg hover:bg-opacity-90 transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© 2026 Wisteria Properties. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link className="hover:text-white transition-colors" href="#">Privacy Policy</Link>
                        <Link className="hover:text-white transition-colors" href="#">Terms of Service</Link>
                        <Link className="hover:text-white transition-colors" href="#">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
