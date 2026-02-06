'use client'

import { useState } from 'react'

export default function Navbar() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <>
      {/* Top Banner */}
      {showBanner && (
        <div className="bg-card-dark border-b border-border-dark py-3 px-4 text-center text-sm font-medium relative">
          <span className="text-white/80">✨ Discover Your Dream Property with Estatein</span>
          <a className="ml-2 underline text-white hover:text-primary transition-colors" href="#">
            Learn More
          </a>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-border-dark py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">real_estate_agent</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Estatein</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-card-dark p-1 rounded-full border border-gray-200 dark:border-border-dark">
            <a className="px-6 py-2 rounded-full bg-white dark:bg-[#1A1A1A] text-sm font-medium shadow-sm" href="#">
              Home
            </a>
            <a className="px-6 py-2 rounded-full hover:bg-white/10 text-sm font-medium text-gray-500 dark:text-gray-400" href="#">
              About Us
            </a>
            <a className="px-6 py-2 rounded-full hover:bg-white/10 text-sm font-medium text-gray-500 dark:text-gray-400" href="#">
              Properties
            </a>
            <a className="px-6 py-2 rounded-full hover:bg-white/10 text-sm font-medium text-gray-500 dark:text-gray-400" href="#">
              Services
            </a>
          </div>

          {/* Contact Button */}
          <a className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" href="#">
            Contact Us
          </a>
        </div>
      </nav>
    </>
  )
}
