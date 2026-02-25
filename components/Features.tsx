
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
export default function Features() {
    return (
        <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold tracking-wide uppercase mb-3">
              Why EaseYourEstate.ai
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Smart Real Estate, Powered by AI
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              We eliminate middlemen so you deal directly with owners and save lakhs in brokerage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-6 h-6 text-purple-600" />,
                title: "Zero Brokerage",
                desc: "Connect directly with owners. No hidden charges, no broker fees. Save up to 2 months rent.",
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
                title: "AI-Powered Matching",
                desc: "Our AI engine matches your preferences with the perfect property in seconds.",
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-purple-600" />,
                title: "Verified Listings",
                desc: "Every listing is verified by our team so you never encounter ghost properties.",
              },
              {
                icon: <Truck className="w-6 h-6 text-purple-600" />,
                title: "Packers & Movers",
                desc: "Book trusted packers and movers at the lowest prices — bundled with your rental.",
              },
              {
                icon: <CreditCard className="w-6 h-6 text-purple-600" />,
                title: "Rent Payment",
                desc: "Pay rent online with your credit card, earn reward points and never miss a due date.",
              },
              {
                icon: <Star className="w-6 h-6 text-purple-600" />,
                title: "Top Rated Service",
                desc: "Rated 4.8/5 by over 10 lakh customers across India's top cities.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
}
