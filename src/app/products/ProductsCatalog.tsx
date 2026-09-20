"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Bell,
  CheckCircle2,
  Filter,
  HeartPulse,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { ProductMedia } from "@/src/components/products/ProductMedia";
import {
  formatPrice,
  getProductDiscount,
  productCategories,
  products,
  type Product,
} from "@/src/lib/products";

type SortKey = "trending" | "price-low" | "discount" | "rating";

const sortLabels: Record<SortKey, string> = {
  trending: "Trending",
  "price-low": "Price: Low",
  discount: "Discount",
  rating: "Rating",
};

export function ProductsCatalog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("trending");

  const visibleProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products
      .filter((product) => {
        const categoryMatch =
          activeCategory === "All" || product.category === activeCategory;
        const searchMatch =
          !query ||
          [
            product.name,
            product.category,
            product.collection,
            product.summary,
            product.badge,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        return categoryMatch && searchMatch;
      })
      .sort((first, second) => {
        if (sortBy === "price-low") return first.price - second.price;
        if (sortBy === "discount") {
          return getProductDiscount(second) - getProductDiscount(first);
        }
        if (sortBy === "rating") return second.rating - first.rating;
        return second.ordersCount - first.ordersCount;
      });
  }, [activeCategory, searchTerm, sortBy]);

  const availableCount = products.filter(
    (product) => product.status === "available",
  ).length;

  return (
    <div className="-mx-4 -mt-2 min-h-screen bg-[#f5f7f8] text-slate-950 md:-mx-10">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-teal-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Abd Hind Medicare Store
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                Doctor curated essentials
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <div>
                <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                  Healthcare products with a fast, clean shopping experience.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Browse MR Dental oral care, eco-friendly essentials, and
                  upcoming healthcare products from Abd Hind Medicare.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center lg:grid-cols-1">
                <StoreMetric label="Products" value={products.length} />
                <StoreMetric label="Live Deals" value={availableCount} />
                <StoreMetric label="Rating" value="5.0" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search toothbrush, charcoal, mouthwash..."
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <div className="flex h-12 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortKey)}
                  className="h-full bg-transparent text-sm font-bold text-slate-700 outline-none"
                  aria-label="Sort products"
                >
                  {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                    <option key={key} value={key}>
                      {sortLabels[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {productCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                    activeCategory === category
                      ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 p-5 text-white">
            <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-emerald-100">
              Top Deal
            </div>
            <ProductMedia
              product={products[0]}
              priority
              className="mb-4 aspect-[4/3] border border-white/10 bg-white/95"
              imageClassName="p-3"
            />
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">
                {products[0].collection}
              </p>
              <h2 className="text-xl font-black leading-tight">
                {products[0].name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-black">{formatPrice(products[0].price)}</span>
                <span className="text-white/50 line-through">
                  {formatPrice(products[0].originalPrice)}
                </span>
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-black text-amber-950">
                  {getProductDiscount(products[0])}% off
                </span>
              </div>
              <Link
                href={`/products/${products[0].id}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-teal-800 transition hover:bg-emerald-50"
              >
                View Deal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-teal-600" />
              <h2 className="text-sm font-black text-slate-900">Filters</h2>
            </div>

            <FilterGroup title="Availability">
              <FilterRow label="In stock" value={`${availableCount} items`} />
              <FilterRow
                label="Coming soon"
                value={`${products.length - availableCount} items`}
              />
            </FilterGroup>

            <FilterGroup title="Store Promise">
              <FilterRow label="Doctor curated" value="All products" />
              <FilterRow label="Clinic support" value="Phone enquiry" />
              <FilterRow label="Bulk orders" value="Available" />
            </FilterGroup>

            <div className="rounded-lg bg-teal-50 p-3 text-sm leading-6 text-teal-900">
              <p className="font-black">Need bulk quantity?</p>
              <p className="mt-1 text-xs text-teal-800">
                Contact the Abd Hind Medicare team for clinic, school, and
                family pack requirements.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">
                Showing {visibleProducts.length} of {products.length} products
              </p>
              <h2 className="text-2xl font-black text-slate-950">
                Trending Products
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <StoreChip icon={ShieldCheck} label="Quality checked" />
              <StoreChip icon={Truck} label="Clinic pickup" />
              <StoreChip icon={HeartPulse} label="Care support" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visibleProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-lg font-black text-slate-900">
                No products found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try another keyword or category.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const discount = getProductDiscount(product);
  const available = product.status === "available";

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative border-b border-slate-100 bg-slate-50 p-3">
          <div className="absolute left-3 top-3 z-10 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
            {product.badge}
          </div>
          <button
            type="button"
            aria-label={`Save ${product.shortName}`}
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:text-rose-600"
          >
            <HeartPulse className="h-4 w-4" />
          </button>
          <ProductMedia
            product={product}
            className="aspect-[4/3] bg-white"
            imageClassName="p-3 transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-teal-700">
              {product.category}
            </p>
            <Link
              href={`/products/${product.id}`}
              className="mt-1 line-clamp-2 min-h-11 text-base font-black leading-snug text-slate-950 transition hover:text-teal-700"
            >
              {product.name}
            </Link>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-black text-white">
            {product.rating.toFixed(1)}
            <Star className="h-3 w-3 fill-white" />
          </span>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
          {product.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {product.trustTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-950">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <BadgePercent className="h-3.5 w-3.5" />
              {discount}% off
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{product.reviewsCount} reviews</span>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
              available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {product.availabilityLabel}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
          >
            Details
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={available ? "tel:+919540929800" : "/contact"}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition ${
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
            <span className="hidden sm:inline">
              {available ? "Order" : "Notify"}
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}

function StoreMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
    </div>
  );
}

function StoreChip({
  icon: Icon,
  label,
}: {
  icon: typeof CheckCircle2;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
      <Icon className="h-3.5 w-3.5 text-teal-600" />
      {label}
    </span>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 border-b border-slate-100 pb-5">
      <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 font-semibold text-slate-700">
        <span className="h-2 w-2 rounded-full bg-teal-500" />
        {label}
      </span>
      <span className="text-xs font-bold text-slate-400">{value}</span>
    </div>
  );
}
