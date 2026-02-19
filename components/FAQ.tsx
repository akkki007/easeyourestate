import SectionHeader from './SectionHeader'
import Pagination from './Pagination'

export default function FAQ() {
    const faqs = [
        {
            question: 'How do I search for properties on easeyourestate Properties?',
            answer: 'Learn how to use our user-friendly search tools to find properties that match your criteria.',
        },
        {
            question: 'What documents do I need to sell my property?',
            answer: 'Find out about the necessary documentation for listing your property with us safely.',
        },
        {
            question: 'How can I contact a easeyourestate Properties agent?',
            answer: 'Discover the different ways you can get in touch with our experienced agents directly.',
        },
    ]

    return (
        <section className="py-24 bg-bg-secondary">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <SectionHeader
                    title="Frequently Asked Questions"
                    description="Find answers to common questions about easeyourestate Properties' services, property listings, and the real estate process."
                    buttonText="View All FAQ's"
                />

                {/* FAQ Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="theme-card p-10 rounded-3xl"
                        >
                            <h4 className="text-xl font-bold mb-4">{faq.question}</h4>
                            <p className="text-secondary mb-8">{faq.answer}</p>
                            <button className="px-6 py-3 border border-border bg-surface rounded-xl text-sm font-medium text-secondary hover:bg-hover transition-colors">
                                Read More
                            </button>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={1}
                    totalPages={10}
                />
            </div>
        </section>
    )
}
