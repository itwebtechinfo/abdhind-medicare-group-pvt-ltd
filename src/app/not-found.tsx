"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search, ArrowLeft, Heart } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated Background Effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-60"></div>
          </div>
          <div className="relative">
            <div className="text-8xl font-bold text-gray-200 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-16 h-16 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 px-6 py-3 rounded-xl font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick Navigation</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/services" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Our Services
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Contact Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/appointment" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-6 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Search className="w-3 h-3" />
            Need help? Call us at +91 1234567890
          </span>
        </div>
      </div>
    </div>
  );
}