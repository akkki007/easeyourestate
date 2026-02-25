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

export default function Footer() {

    return (
        <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex items-end">
                  <span className="text-[1.6rem] font-black text-white leading-none tracking-tighter">eye</span>
                  <div className="absolute -top-0.5 -right-1.5 w-3 h-3 overflow-hidden">
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: "12px solid transparent",
                        borderTop: "12px solid #7c3aed",
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col leading-none ml-1.5">
                  <span className="text-[8px] text-gray-500 tracking-widest uppercase">at your service</span>
                  <span className="text-[12px] font-bold text-white tracking-tight">EaseYourEstate.ai</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                India&apos;s first AI-powered zero-brokerage real estate platform. Find, rent, or buy with complete confidence.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {["Buy Property", "Rent Property", "Commercial", "PG / Hostel", "Post Property Free", "Home Loans"].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-purple-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-2.5 text-sm">
                {["Packers & Movers", "Interior Design", "Home Cleaning", "Rent Agreement", "Property Management", "Legal Services"].map((s) => (
                  <li key={s}>
                    <a href="#" className="hover:text-purple-400 transition-colors">{s}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>+91 92239 22329</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>hello@easeyourestate.ai</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Bengaluru, Karnataka, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span>© 2026 EaseYourEstate.ai · All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    )
}
