import SectionHeader from './SectionHeader'
import Pagination from './Pagination'

export default function Testimonials() {
    const testimonials = [
        {
            rating: 5,
            title: 'Exceptional Service!',
            text: "Our experience with Wisteria Properties was outstanding. Their team's dedication and professionalism made finding our dream home a breeze. Highly recommended!",
            author: 'Wade Warren',
            location: 'USA, California',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUinRZNj1PYzW64AM1urC2YL0kjPNOp8SqjhEzqFZ9qSpBNGW5JXcELtYX91kW6FYAdEUAFSaZI_sRXA-c7nWdS7CgP5f3fuKcBRuqn9UGeQ0Fem6MtlVMnYImOryLgyz3yWdLlc3nZkuJVtg63DYcRcmyD2LYedNFoU8Hxa2h8im1PXWP4kwzeeETbXuuWfby56lBLQYFoAGsi3cvdd2gBtrPChfzSPpsQGhUe_vTP8nTMbdA25UWNJkID5jmLu7hptqXooX38_vE',
        },
        {
            rating: 5,
            title: 'Efficient and Reliable',
            text: 'Wisteria Properties provided us with top-notch service. They helped us sell our property quickly and at a great price. We couldn\'t be happier with the results.',
            author: 'Emelie Thomson',
            location: 'USA, Florida',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHYuicjBPs_SkarG0dUcKsFZbymlX5b_BOnop2u1YgNFOEP6Prma0pfJ4peT6obL9KUKUIm7cczYFgyX5gN5Q5QehydfoyjpWcpBTZvM4pcLtngQraDokrenQao0RwiH6Qyk6rMoOB3imq7mrhYTS0jSBCuCKzjtSwfsgSDDd5391XQ6NZCmoMzErUU64feJr-j0tgo6NHs1S1GXQqd148BT4wAY-YqKHjoZvRDLMMSYN9iIgwhihxUShISgJa1Fd1Af3oPfkXA8W7',
        },
        {
            rating: 5,
            title: 'Trusted Advisors',
            text: 'The Wisteria Properties team guided us through the entire buying process. Their knowledge and commitment to our needs were impressive. Thank you for your support!',
            author: 'John Mans',
            location: 'USA, Nevada',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8Z4h7XyH-16m0535FXuxslKR_B1xmjnus_y7P3GvwPJ0mG30yUofHeNWI6CJScp-lAXGJD6U4_pSrrcZt38k5u4yYET2tNSea-ON-LY7gxwX2oBK-N8NeNvRGERF3lzVBMQ4TC_Z_VJVF0K03VJxx4PD6nrM34W--4Sy32PA2MAauSlPyELbHfX4CuYjIoPqKlIl2a3un5AgyO1fMNTQb3fIe9UtEaqXu7fkv1jUjPjClQLEUJOaWN5I1egvHG5NIzcVdkXTvoLvV',
        },
    ]

    return (
        <section className="py-24 bg-[#0F0F0F]">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <SectionHeader
                    title="What Our Clients Say"
                    description="Read the success stories and heartfelt testimonials from our valued clients. Discover why they chose Wisteria Properties."
                    buttonText="View All Testimonials"
                />

                {/* Testimonial Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-card-dark border border-border-dark p-10 rounded-3xl"
                        >
                            {/* Star Rating */}
                            <div className="flex gap-1 text-yellow-500 mb-8">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined fill-1">star</span>
                                ))}
                            </div>

                            <h4 className="text-xl font-bold mb-4">{testimonial.title}</h4>
                            <p className="text-gray-400 mb-10 leading-relaxed">
                                {testimonial.text}
                            </p>

                            {/* Author Info */}
                            <div className="flex items-center gap-4">
                                <img
                                    alt={testimonial.author}
                                    className="w-12 h-12 rounded-full"
                                    src={testimonial.avatar}
                                />
                                <div>
                                    <p className="font-bold">{testimonial.author}</p>
                                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                                </div>
                            </div>
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
