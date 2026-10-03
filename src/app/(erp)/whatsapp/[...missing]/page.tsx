import { notFound } from "next/navigation";

/** Unknown sub-path of an ERP section -> (erp)/not-found.tsx, inside the ERP shell. */
export default function MissingErpPage() {
  notFound();
}
