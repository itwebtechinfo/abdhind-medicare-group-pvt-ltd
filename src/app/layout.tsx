
// import { Navbar } from "@/components/layout/Navbar";
// import { Footer } from "@/components/layout/Footer";

import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <Navbar />
        <main style={{paddingTop: "80px", padding: "20px"}}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
