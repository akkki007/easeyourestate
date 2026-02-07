'use client'

import { useState } from 'react'
import SectionHeader from './SectionHeader'
import Pagination from './Pagination'

export default function Properties() {
    const properties = [
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMm-QCwWAvVv_vHgUC6jNOy3-JFKOlqC6F6vzn0rA5FpQVv6E4zHb_ZpQNuN6OLMTGarz0slWjLhOQUMvHmZSAnYkYiodd_xdq3IUz2gOZdtVWQVikBCvwdmK-RNnkMe3lYJQHfnHOkAVzMMviBA78Y3aAy5K_dIH0um-cJTRNnRj0oeGkFKkhDvlDc-659mTk2mJ8x5hEwoi_CPz-yA7qk-Vzj0JaQR6kY1-xaJCTjGap2N_ozyKAvMBbKmUhuBadmyXYwYOxwsAR',
            title: 'Seaside Serenity Villa',
            description: 'A stunning 4-bedroom, 3-bathroom villa in a peaceful suburban neighborhood.',
            bedrooms: 4,
            bathrooms: 3,
            type: 'Villa',
            typeIcon: 'villa',
            price: '$550,000',
        },
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3I-cCXuvuzgfCe-iJzHzglBMlEOq38beru2DOoPizc5k-yuXhp9nPz9XSbrtacP39GmarNIKKOi4aM6W-tBym-LB9EC7EKRxBLotGoMJ3TbkIrfbK7LGZxpHv_iF51pJrOCDDWUG3SVJy6y6LqoiTC6FT2GASjU4-OROmy6LXuQno3dUkuiKXI8-7eCCyYdeBKRxVcemHc8G3r_CO6loZRqfWVvfYP5x-Yrg8xSm8kS-5PF17hFU3p8mgTbq8x6L3QJzJbmnECV54',
            title: 'Metropolitan Haven',
            description: 'A chic and fully-furnished 2-bedroom apartment with panoramic city views.',
            bedrooms: 2,
            bathrooms: 2,
            type: 'Condo',
            typeIcon: 'apartment',
            price: '$550,000',
        },
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU5YcMNxL1uWMBeoG04nA0Y8wErQJextPTzkbEc-Qyu6kzOADOjq9m1rjffaKydcb-V7Te1KmX3JMhMgESsKjaeuxrhUrZZ3lNnjJgZY-Aq9mgBWEkdMJ8Aj393ATaZrhlGB5uJd0_6WSiBrVKvRd_vmYpRpSVRNJk5rs2wJs026EDL82RY6DIvLcCn3wwQNBm1SahCTJ6ZSVLxLYKFfCVepo4wcBKLX2tKt7JKPagv4624Rq3N3Txggj7uxLWtjXJcyEmj7vyy-k2',
            title: 'Rustic Retreat Cottage',
            description: 'An elegant 3-bedroom, 2.5-bathroom townhouse in a gated community.',
            bedrooms: 3,
            bathrooms: 3,
            type: 'Villa',
            typeIcon: 'holiday_village',
            price: '$550,000',
        },
    ]

    return (
        <section className="py-24 bg-background-dark">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <SectionHeader
                    title="Featured Properties"
                    description="Explore our handpicked selection of featured properties. Each listing offers a glimpse into exceptional homes and investments."
                    buttonText="View All Properties"
                />

                {/* Property Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {properties.map((property, index) => (
                        <div
                            key={index}
                            className="bg-card-dark border border-border-dark p-6 rounded-3xl group"
                        >
                            <div className="overflow-hidden rounded-2xl mb-6">
                                <img
                                    alt={property.title}
                                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                                    src={property.image}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                {property.description}{' '}
                                <button className="text-white underline">Read More</button>
                            </p>

                            {/* Property Features */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="px-4 py-2 bg-[#1A1A1A] border border-border-dark rounded-full text-xs flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">bed</span> {property.bedrooms}-Bedroom
                                </span>
                                <span className="px-4 py-2 bg-[#1A1A1A] border border-border-dark rounded-full text-xs flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">bathtub</span> {property.bathrooms}-Bathroom
                                </span>
                                <span className="px-4 py-2 bg-[#1A1A1A] border border-border-dark rounded-full text-xs flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">{property.typeIcon}</span> {property.type}
                                </span>
                            </div>

                            {/* Price and CTA */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Price</p>
                                    <p className="text-xl font-bold">{property.price}</p>
                                </div>
                                <button className="bg-primary text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={1}
                    totalPages={60}
                />
            </div>
        </section>
    )
}
