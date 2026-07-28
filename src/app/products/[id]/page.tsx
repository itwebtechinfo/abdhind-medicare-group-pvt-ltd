import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Bell,
  CheckCircle2,
  Clock,
  HeartPulse,
  Leaf,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { ProductMedia } from "@/src/components/products/ProductMedia";
import {
  formatPrice,
  getProductById,
  getProductDiscount,
  getRelatedProducts,
  products,
  type Product,
} from "@/src/lib/products";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  return {
    title: product
      ? `${product.name} | Abd Hind Medicare Products`
      : "Product Details | Abd Hind Medicare Group",
    description: product?.summary,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const discount = getProductDiscount(product);
  const relatedProducts = getRelatedProducts(product);
  const available = product.status === "available";

  return (
    <div className="-mx-4 -mt-2 min-h-screen bg-[#f5f7f8] text-slate-950 md:-mx-10">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
              {product.category}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              {product.collection}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {product.availabilityLabel}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[120px_minmax(0,1fr)]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
            {[product, ...relatedProducts.slice(0, 2)].map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition hover:border-teal-500 ${
                  item.id === product.id ? "border-teal-600" : "border-slate-200"
                }`}
              >
                <ProductMedia product={item} className="h-full w-full" />
              </Link>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <ProductMedia
                product={product}
                priority
                className="aspect-[4/5] bg-white sm:aspect-[5/4] lg:aspect-[4/5]"
                imageClassName="p-5"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <TrustTile icon={ShieldCheck} label="Quality checked" />
              <TrustTile icon={Truck} label="Clinic pickup" />
              <TrustTile icon={HeartPulse} label="Care support" />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-rose-700">
              <Sparkles className="h-3.5 w-3.5" />
              {product.badge}
            </div>

            <h1 className="text-2xl font-black leading-tight text-slate-950 md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {product.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-sm font-black text-white">
                {product.rating.toFixed(1)}
                <Star className="h-3.5 w-3.5 fill-white" />
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {product.reviewsCount} reviews
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {product.ordersCount}+ orders
              </span>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black text-slate-950">
                  {formatPrice(product.price)}
                </span>
                <span className="pb-1 text-base font-semibold text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                  <BadgePercent className="h-3.5 w-3.5" />
                  {discount}% off
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500">
                Inclusive pricing. Current stock and final billing confirmed by
                clinic team.
              </p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <a
                href={available ? "tel:+919540929832" : "/contact"}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition ${
                  available
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {available ? (
                  <ShoppingCart className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                {available ? "Order Now" : "Join Waitlist"}
              </a>
              <a
                href="https://wa.me/919540929832"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 text-sm font-black text-teal-800 transition hover:border-teal-500 hover:bg-white"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-teal-600" />
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Delhi NCR, Kushinagar and bulk orders
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {product.deliveryNote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Key Highlights</h2>
            <ul className="mt-4 space-y-3">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="space-y-6">
          <DetailSection title="Why customers choose it" icon={Leaf}>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <CheckCircle2 className="mb-3 h-5 w-5 text-teal-600" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Product details" icon={PackageCheck}>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="grid gap-2 bg-white px-4 py-3 text-sm sm:grid-cols-[180px_1fr]"
                >
                  <span className="font-black text-slate-500">{spec.label}</span>
                  <span className="font-semibold text-slate-800">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Available options
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <span
                  key={variant}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700"
                >
                  {variant}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Need help?</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Talk to Abd Hind Medicare for stock confirmation, family packs,
                and bulk order pricing.
              </p>
              <div className="flex items-center gap-2 font-black text-slate-900">
                <Clock className="h-4 w-4 text-teal-600" />
                24/7 emergency support line
              </div>
            </div>
            <a
              href="tel:+919540929832"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-black text-white transition hover:bg-teal-700"
            >
              <Phone className="h-4 w-4" />
              Call Product Desk
            </a>
          </div>
        </aside>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-teal-700">
                  Similar picks
                </p>
                <h2 className="text-2xl font-black text-slate-950">
                  Related Products
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden items-center gap-2 text-sm font-black text-teal-700 transition hover:text-teal-900 sm:inline-flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <RelatedProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TrustTile({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700 shadow-sm">
      <Icon className="h-4 w-4 text-teal-600" />
      {label}
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Leaf;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-teal-600" />
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="grid grid-cols-[110px_1fr] gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
    >
      <ProductMedia product={product} className="aspect-square bg-slate-50" />
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-teal-700">
          {product.category}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-950">
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-black text-slate-950">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs font-semibold text-slate-400 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        </div>
        <p className="mt-1 text-xs font-bold text-emerald-700">
          {getProductDiscount(product)}% off
        </p>
      </div>
    </Link>
  );
}
