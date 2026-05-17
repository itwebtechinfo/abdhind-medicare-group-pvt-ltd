// import { Footer } from "../components/layout/Footer";
// import { Navbar } from "../components/layout/Navbar";
// import { FloatingButtons } from "../components/FloatingButtons";

// import "./globals.css";
// import { Geist } from "next/font/google";
// import { cn } from "@/src/lib/utils";
// import { AnnouncementBar } from "../components/AnnouncementBar";

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className={cn("font-sans", geist.variable)}>
//       <body className="flex flex-col min-h-screen">
//         {/* Navbar - sticky */}
//         <Navbar />
//         <AnnouncementBar />
//         {/* Main Content - Add padding top to prevent content hiding under navbar */}
//         <main className="flex-1 px-4 md:px-10 pt-[108px] pb-6">
//           {children}
//         </main>
//         <FloatingButtons /> 

//         {/* Footer */}
//         <Footer />
//       </body>
//     </html>
//   );
// }



import type { Metadata } from "next";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { FloatingButtons } from "../components/FloatingButtons";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/src/lib/utils";
import { AnnouncementBar } from "../components/AnnouncementBar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = "https://www.abdhindmedicare.com";
const title = "Abd Hind Medicare Group Pvt Ltd";
const description =
  "Abd Hind Medicare Group Pvt Ltd provides advanced dental care, diagnostics, pharmacy, and multi-speciality healthcare services.";
const openGraphDescription =
  "Advanced healthcare, diagnostics, pharmacy, and patient-focused medical services.";
const logoPath = "/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "Abd Hind Medicare Group",
    "Abd Hind Medicare Group Pvt Ltd",
    "MR Dental Clinic",
    "dental care",
    "advanced dental care",
    "healthcare services",
    "diagnostics",
    "pharmacy",
    "multi-speciality healthcare",
    "medical services",
    "patient-focused healthcare",
  ],
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: logoPath, type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: logoPath,
  },
  openGraph: {
    title,
    description: openGraphDescription,
    url: siteUrl,
    siteName: title,
    images: [
      {
        url: logoPath,
        width: 1280,
        height: 1185,
        alt: title,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: openGraphDescription,
    images: [logoPath],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-10 pt-[108px] pb-6">
          {children}
        </main>

        {/* Floating Buttons */}
        <FloatingButtons />

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
