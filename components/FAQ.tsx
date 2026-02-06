export default function FAQ() {
    const faqs = [
        {
            question: 'How do I search for properties on easeyourestate.ai?',
            answer: 'Learn how to use our user-friendly search tools to find properties that match your criteria.',
        },
        {
            question: 'What documents do I need to sell my property?',
            answer: 'Find out about the necessary documentation for listing your property with us safely.',
        },
        {
            question: 'How can I contact a easeyourestate.ai agent?',
            answer: 'Discover the different ways you can get in touch with our experienced agents directly.',
        },
    ]

    return (
        <section className="py-24 bg-background-dark">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <div className="flex gap-1 mb-4">
                            <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-400 max-w-2xl">
                            Find answers to common questions about easeyourestate.ai' services, property listings, and the real estate process.
                        </p>
                    </div>
                    <button className="hidden md:block px-6 py-3 border border-border-dark bg-card-dark rounded-xl text-sm font-medium hover:bg-white/5">
                        View All FAQ's
                    </button>
                </div>

                {/* FAQ Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-card-dark border border-border-dark p-10 rounded-3xl"
                        >
                            <h4 className="text-xl font-bold mb-4">{faq.question}</h4>
                            <p className="text-gray-400 mb-8">{faq.answer}</p>
                            <button className="px-6 py-3 border border-border-dark rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
                                Read More
                            </button>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 pt-12 border-t border-border-dark flex items-center justify-between">
                    <span className="text-sm font-medium">
                        01 <span className="text-gray-500">of 10</span>
                    </span>
                    <div className="flex gap-4">
                        <button className="w-12 h-12 rounded-full border border-border-dark flex items-center justify-center hover:bg-white/5">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <button className="w-12 h-12 rounded-full border border-border-dark flex items-center justify-center hover:bg-white/5">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
