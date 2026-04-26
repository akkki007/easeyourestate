import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Hero() {
    return (
        <section className="bg-background pt-24 sm:pt-28 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col items-center text-center gap-8">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-[4px]">
                            Home for Better Living
                        </span>
                        <h1 className="mt-6 text-4xl leading-[1.02] tracking-tight text-foreground">
                            <span className="block font-serif italic font-normal">
                                Explore your next
                            </span>
                            <span className="block font-medium">
                                living designed for modern lifestyles today.
                            </span>
                        </h1>
                       
                    </div>

                    {/* Elongated search bar — center */}
                    <div className="relative z-10 w-full max-w-5xl mt-2">
                        <SearchBar />
                    </div>

                    {/* Property owner CTA */}
                    <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                        
                        <p className="text-sm text-muted-foreground">
                            Are you a Property Owner?
                        </p>
                        <Link
                            href="/dashboard/properties/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                        >
                            Post free property ad
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
