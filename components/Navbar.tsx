"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
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

const CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];
const BHK_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<"Buy" | "Rent" | "Commercial">(
    "Rent",
  );
  const [activeType, setActiveType] = useState<
    "Full House" | "PG/Hostel" | "Flatmates"
  >("Full House");
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [selectedBHK, setSelectedBHK] = useState("");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [bhkDropdown, setBhkDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchCredits = useSelector(
    (state: RootState) => state.credits.searchCredits
  );



  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 select-none cursor-pointer">
              <div className="relative flex items-end">
                <span className="text-[2rem] font-black text-gray-900 leading-none tracking-tighter">
                  eye
                </span>
                <div className="absolute -top-1 -right-2 w-4 h-4 overflow-hidden">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "16px solid transparent",
                      borderTop: "16px solid #7c3aed",
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col leading-none ml-2">
                <span className="text-[9px] text-gray-500 tracking-widest uppercase font-medium">
                  at your service
                </span>
                <span className="text-[13px] font-bold text-gray-900 tracking-tight">
                  EaseYourEstate.ai
                </span>
              </div>
            </div>
            <div className="text-sm font-semibold text-purple-600">
              Credits: {searchCredits}
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <CreditCard className="w-4 h-4" />
                Pay Rent
              </button>
              <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
                <Building2 className="w-4 h-4" />
                For Property Owners
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <Link
                  href="/signup"
                  className="px-5 py-2 text-sm font-medium text-gray-700  transition-colors rounded-lg"
                >
                  Sign Up
                </Link>
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                <LogIn className="w-4 h-4" />
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                >
                  Login
                </Link>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <Menu className="w-4 h-4" />
                Menu
              </button>
            </nav>

            {/* Mobile burger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
              <CreditCard className="w-4 h-4" /> Pay Rent
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold">
              <Building2 className="w-4 h-4" /> For Property Owners
            </button>
            <button className="px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium text-left">
              Sign up
            </button>
            <button className="px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium text-left">
              Log in
            </button>
          </div>
        )}
      </header>
    </>
  );
}
