"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";


// ── Floating Buttons ──────────────────────────────────────────────
export function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-5 sm:right-6 z-[999] flex flex-col items-end gap-3.5">

      {/* 📞 Phone */}
      <Tip label="📞 Call Now">
        <a
          href="tel:+919876543210"
          className="w-14 h-14 rounded-full flex items-center justify-center
            text-white transition-transform duration-300 hover:scale-110 hover:-rotate-12"
          style={{
            background: "linear-gradient(145deg,#ef4444,#dc2626)",
            boxShadow: "0 8px 24px rgba(239,68,68,.45)",
          }}
        >
          <PhoneIcon />
        </a>
      </Tip>

      {/* 💬 WhatsApp */}
      <Tip label="💬 WhatsApp">
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full flex items-center justify-center
            transition-transform duration-300 hover:scale-110"
          style={{
            background: "#25D366",
            boxShadow: "0 8px 24px rgba(37,211,102,.45)",
          }}
        >
          <WhatsAppIcon />
        </a>
      </Tip>

      {/* 📅 Book Appointment */}
      <Tip label="📅 Book Now">
        <Link
          href="/book-appointment"
          className="w-14 h-14 sm:w-auto sm:px-5 rounded-full flex items-center
            justify-center gap-2 text-white font-semibold text-sm tracking-wide
            transition-transform duration-300 hover:scale-105 overflow-hidden relative group"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 8px 24px rgba(99,102,241,.45)",
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent
              via-white/20 to-transparent -translate-x-full
              group-hover:translate-x-full transition-transform duration-700"
          />
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">
            Book Appointment
          </span>
        </Link>
      </Tip>

    </div>
  );
}

// ── Tip (Tooltip wrapper) ─────────────────────────────────────────
interface TipProps {
  label: string;
  children: ReactNode;
}

function Tip({ label, children }: TipProps) {
  return (
    <div className="group relative flex justify-end">
      {children}
      <span
        className="absolute right-16 top-1/2 -translate-y-1/2
          bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg
          opacity-0 group-hover:opacity-100 transition-all duration-200
          pointer-events-none whitespace-nowrap border border-white/10
          translate-x-2 group-hover:translate-x-0 backdrop-blur-sm"
      >
        {label}
      </span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36
        1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1
        C9.61 21 2 13.39 2 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45
        .57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      <path
        d="M16 2C8.27 2 2 8.27 2 16c0 2.45.65 4.74 1.78 6.72L2 30l7.5-1.77
          A13.92 13.92 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2z"
        fill="#25D366"
      />
      <path
        d="M16 4.5A11.5 11.5 0 004.5 16c0 2.13.58 4.12 1.59 5.83L4.5
          27.5l5.83-1.59A11.5 11.5 0 1016 4.5z"
        fill="white"
      />
      <path
        d="M21.5 18.9c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3
          -.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47
          -.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35
          .45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92
          -2.19-.24-.57-.49-.49-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04
          1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49
          .71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.75-.71 2-1.4
          .25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35z"
        fill="#25D366"
      />
    </svg>
  );
}
