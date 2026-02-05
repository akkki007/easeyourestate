"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function CTASection() {
    const [authModalOpen, setAuthModalOpen] = useState(false);

    return (
        <>
            <section className="w-full px-6 mb-20">
                <div className="max-w-7xl mx-auto rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden bg-gradient-cta shadow-2xl">
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">Ready to List or Find <br />Your Dream Property?</h2>
                        <p className="text-white/90 text-lg mb-10 max-w-xl font-medium">
                            Join thousands of verified owners, agents, and buyers on the most trusted real estate platform in India.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Register Now <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                </div>
            </section>
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialView="signup" />
        </>
    );
}
