import type { Metadata } from "next";
import { ProductsCatalog } from "./ProductsCatalog";

export const metadata: Metadata = {
  title: "Healthcare Products | Abd Hind Medicare Group",
  description:
    "Shop MR Dental oral care products, eco-friendly toothbrushes, and upcoming healthcare essentials from Abd Hind Medicare Group.",
};

export default function ProductsPage() {
  return <ProductsCatalog />;
}
