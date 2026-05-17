"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import {
  Clock,
  ArrowLeft,
  Home,
  Sparkles,
  Smile,
  Calendar,
  Phone,
  MessageCircle,
  MapPin
} from "lucide-react";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className=" bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* SEO */}
      <Head>
        <title>Coming Soon...</title>
        <meta
          name="description"
          content="MR Dental Clinic is launching soon. Best dental care in Delhi with Dr. Ekhlaq Ahmed. Dental implants, root canal, smile makeover."
        />
        <meta name="robots" content="noindex, follow" />
      </Head>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-white/50">
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wider">LAUNCHING SOON</span>
          </div>


      

          {/* Countdown / Launch Date */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 mb-8 border border-teal-100">
            <p className="text-sm text-teal-700 font-medium mb-3">EXPECTED LAUNCH</p>
            <div className="flex items-center justify-center gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-700">15</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Days</div>
              </div>
              <div className="text-2xl text-teal-300 font-light">:</div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-700">08</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Hours</div>
              </div>
              <div className="text-2xl text-teal-300 font-light">:</div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-700">45</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Minutes</div>
              </div>
            </div>
          </div>

    

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Go Back Button */}
            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            {/* Go Home Button */}
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>

          {/* WhatsApp Contact */}
          <div className="mt-6">
            <a
              href="https://wa.me/919540929832?text=Hi%20Doctor,%20I'm%20interested%20in%20learning%20more%20about%20MR%20Dental%20Clinic."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium transition"
            >
              <MessageCircle className="w-4 h-4" />
              Questions? WhatsApp Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}