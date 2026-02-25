"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Building2,
  CreditCard,
  LogIn,
  Menu,
  Star,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Truck,
  Tag,
  X,
} from "lucide-react";

export default function Testimonials() {

    return (
       <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                city: "Bangalore",
                rating: 5,
                text: "Found my dream apartment in just 3 days — zero brokerage and a super smooth process. Highly recommend!",
                avatar: "P",
              },
              {
                name: "Arjun Mehta",
                city: "Mumbai",
                rating: 5,
                text: "The AI matching feature is incredible. It shortlisted properties that matched exactly what I had in mind.",
                avatar: "A",
              },
              {
                name: "Kavya Reddy",
                city: "Hyderabad",
                rating: 5,
                text: "Saved 1.5 months of rent on brokerage. The verified listings gave me real confidence while searching.",
                avatar: "K",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
}
