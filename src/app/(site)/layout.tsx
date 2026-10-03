import { PublicLayout } from "@/src/components/layout/PublicLayout";

/** Public website: Navbar, Footer and the floating Call / WhatsApp / Book
 * buttons. Only pages inside (site) get these — never ERP or auth pages. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>{children}</PublicLayout>
  );
}
