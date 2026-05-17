"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
};

export default function ServicePage({
  title,
  subtitle,
  description,
  features,
}: Props) {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">

      {/* 🔥 HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          {subtitle}
        </p>
      </div>

      {/* 🔥 HERO CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-10">
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
          {description}
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/book-appointment"
            className="bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-teal-700 transition"
          >
            Book Appointment <ArrowRight size={16} />
          </Link>

          <Link
            href="/contact"
            className="border border-gray-300 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* 🔥 FEATURES */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Key Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition"
            >
              <p className="text-gray-800 text-sm font-medium">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 BACK TO SERVICES */}
      <div className="mt-10">
        <Link
          href="/services"
          className="text-teal-600 text-sm font-medium hover:underline"
        >
          ← Back to Services
        </Link>
      </div>
    </div>
  );
}