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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="flex flex-col min-h-screen">
        {/* Navbar - sticky */}
        <Navbar />
        <AnnouncementBar />
        {/* Main Content - Add padding top to prevent content hiding under navbar */}
        <main className="flex-1 px-4 md:px-10 pt-[108px] pb-6">
          {children}
        </main>
        <FloatingButtons /> 

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}