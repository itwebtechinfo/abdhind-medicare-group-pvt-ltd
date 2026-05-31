import type { Metadata } from "next";
import { AuthProvider } from "../contexts/AuthProvider";
import { SiteLayout } from "../components/layout/SiteLayout";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ThemeScript } from "../components/theme/ThemeScript";

import "./globals.css";

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
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <ThemeProvider>
            <SiteLayout>{children}</SiteLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
