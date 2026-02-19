export default function CTA() {
    return (
        <section className="pb-24 px-6">
            <div className="max-w-7xl mx-auto rounded-[40px] p-12 lg:p-20 relative overflow-hidden border border-border bg-surface-elevated">
                <div className="absolute inset-0 bg-accent/5 blur-[80px]"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl text-center lg:text-left">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Start Your Real Estate Journey Today
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Your dream property is just a click away. Whether you're looking for a new home, a strategic investment, or expert real estate advice, easeyourestate Properties is here to assist you every step of the way.
                        </p>
                    </div>
                    <button className="whitespace-nowrap bg-accent text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-md hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 transition-all transform hover:-translate-y-1">
                        Explore Properties
                    </button>
                </div>
            </div>
        </section>
    )
}
