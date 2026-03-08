"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isHydrated } = useAuth();

  const showDashboard = isHydrated && isAuthenticated;
  const showAuthLinks = isHydrated && !isAuthenticated;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
           <Link href={"/"}>
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
              
            </div>
           </Link>

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
              {showDashboard && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {showAuthLinks && (
                <>
                  <Link
                    href="/signup"
                    className="px-5 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </>
              )}
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
            {showDashboard && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            {showAuthLinks && (
              <>
                <Link
                  href="/signup"
                  className="px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium text-left"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium text-left"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
