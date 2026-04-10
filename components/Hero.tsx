import SearchBar from "./SearchBar";

export default function Hero() {
    return (
        <>
            <section className="bg-background pt-24 sm:pt-28 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="max-w-2xl lg:flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-[4px]">
                                Home for Better Living
                            </span>
                            <h1 className="mt-6 text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1.02] tracking-tight text-foreground">
                                <span className="block font-serif italic font-normal">
                                    Explore your next
                                </span>
                                <span className="block font-medium">
                                    living designed for modern lifestyles today.
                                </span>
                            </h1>
                            <p className="mt-4 max-w-xl text-sm sm:text-base text-muted-foreground">
                                Discover a new era of comfort and convenience. Next-level living designed to elevate your everyday lifestyle.
                            </p>

                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex items-center -space-x-3">
                                    {["RK", "AJ", "MS", "PK"].map((initials) => (
                                        <div
                                            key={initials}
                                            className="h-10 w-10 rounded-full border-2 border-background bg-zinc-300 text-zinc-800 text-xs font-semibold flex items-center justify-center"
                                        >
                                            {initials}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-foreground font-medium underline underline-offset-2">
                                    250 Reviews 4.5/5 out of 5.0
                                </p>
                            </div>
                        </div>

                        {/* Search bar — right side beside hero text */}
                        <div className="relative z-10 w-full lg:max-w-md xl:max-w-lg lg:mt-32">
                            <SearchBar />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div
                            className="h-[330px] sm:h-[420px] lg:h-[470px] border border-border bg-cover bg-center"
                            style={{ backgroundImage: "url('/hero-sect.png')" }}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
