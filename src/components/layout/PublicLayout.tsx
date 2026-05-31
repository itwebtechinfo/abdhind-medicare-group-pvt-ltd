import { Footer } from "@/src/components/layout/Footer";
import { Navbar } from "@/src/components/layout/Navbar";
import { FloatingButtons } from "@/src/components/FloatingButtons";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-1 px-4 pb-6 pt-[108px] md:px-10">
        {children}
      </main>
      <FloatingButtons />
      <Footer />
    </>
  );
}
