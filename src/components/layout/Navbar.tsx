"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-green-600">
          ABDHind MediCare
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/careers">We Are Hiring</Link>
          <Link href="/contact">Contact</Link>

          {/* CTA Button */}
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            Book Appointment
          </button>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm border-t">

          <Link href="/about" onClick={() => setOpen(false)}>
            About
          </Link>

          <Link href="/services" onClick={() => setOpen(false)}>
            Services
          </Link>

          <Link href="/blog" onClick={() => setOpen(false)}>
            Blog
          </Link>

          <Link href="/careers" onClick={() => setOpen(false)}>
            We Are Hiring
          </Link>

          <Link href="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>

          <button className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2">
            Book Appointment
          </button>
        </div>
      )}
    </nav>
  );
}