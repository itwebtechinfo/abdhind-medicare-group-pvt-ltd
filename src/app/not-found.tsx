import { PublicLayout } from "@/src/components/layout/PublicLayout";
import { PublicNotFound } from "@/src/components/layout/PublicNotFound";

/** Unmatched URLs anywhere land here (Next.js only uses the ROOT not-found
 * for those), so it brings the website chrome itself. Unknown paths under
 * ERP sections are caught earlier by (erp)/<section>/[...missing] and shown
 * inside the ERP shell by (erp)/not-found.tsx. */
export default function NotFound() {
  return (
    <PublicLayout>
      <PublicNotFound />
    </PublicLayout>
  );
}
