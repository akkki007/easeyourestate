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

export default function CTA() {
    return (
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-purple-700 to-purple-900">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Do you know how much{" "}
            <span className="underline decoration-purple-300">loan</span> you can get?
          </h2>
          <p className="text-purple-200 mb-8">
            Get maximum home loan benefits with EaseYourEstate.ai. Check your eligibility in 2 minutes — no paperwork needed.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors shadow-lg shadow-purple-900/20">
            Check Eligibility
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    )
}
