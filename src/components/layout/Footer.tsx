"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Clock,
  Award,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info with Logo */}
          <div>
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-11 h-11">
                <Image
                  src="/logo.png"
                  alt="ABDHind MediCare Logo"
                  fill
                  sizes="44px"
                  className="object-contain transition-transform group-hover:scale-105"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-xl font-bold tracking-tight">
                  <span className="text-sky-400">Abd Hind </span>
                  <span className="text-green-400">MediCare</span>
                </div>
                <p className="text-[10px] tracking-[0.2em] text-gray-400 font-medium">GROUP PVT. LTD.</p>
              </div>
            </Link>

            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              A comprehensive healthcare ecosystem delivering excellence in dental care, multi-specialty healthcare services with a patient-first approach, diagnostics, and pharmacy.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2" stroke="currentColor" fill="none"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-green-400 transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-green-400 transition-colors">
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-green-400 transition-colors">
                  Health Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-green-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/dental" className="hover:text-green-400 transition-colors">
                  Dental Care
                </Link>
              </li>
              <li>
                <Link href="/services/diagnostics" className="hover:text-green-400 transition-colors">
                  Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/services/pharmacy" className="hover:text-green-400 transition-colors">
                  Pharmacy
                </Link>
              </li>
              <li>
                <Link href="/services/multi-speciality" className="hover:text-green-400 transition-colors">
                  Multi-Speciality
                </Link>
              </li>
              <li>
                <Link href="/services/emergency" className="hover:text-green-400 transition-colors">
                  24/7 Emergency
                </Link>
              </li>
              <li>
                <Link href="/services/telemedicine" className="hover:text-green-400 transition-colors">
                  Telemedicine
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Jama Masjid, Delhi 110006</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <a href="tel:+911234567890" className="hover:text-green-400 transition-colors">
                  +91 95409 29832
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                <a href="mailto:info@abdhindmedicare.com" className="hover:text-green-400 transition-colors">
                  info@abdhindmedicare.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>24/7 Emergency Services</span>
              </li>
            </ul>
         
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-white font-semibold mb-1">Subscribe to Health Updates</h4>
              <p className="text-sm text-gray-400">Get expert health tips and latest updates</p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cancellation" className="hover:text-green-400 transition-colors">
                Cancellation Policy
              </Link>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span>© 2024 ABDHind MediCare Pvt. Ltd.</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span>All rights reserved.</span>
              </div>
              {/* IT WEB TECH SOLUTION Credit */}
              <div className="text-[10px] text-gray-500">
                Designed & Developed by{" "}
                <a 
                  href="https://www.itwebtech.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors hover:underline"
                >
                  IT WEB TECH SOLUTION
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}