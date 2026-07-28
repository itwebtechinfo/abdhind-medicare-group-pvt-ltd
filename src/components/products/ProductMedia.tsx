import Image from "next/image";
import { Leaf, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Product } from "@/src/lib/products";

const accentClasses: Record<string, string> = {
  amber: "from-amber-50 via-white to-emerald-50 border-amber-200 text-amber-700",
  blue: "from-sky-50 via-white to-cyan-50 border-sky-200 text-sky-700",
  emerald:
    "from-emerald-50 via-white to-lime-50 border-emerald-200 text-emerald-700",
  sky: "from-sky-50 via-white to-emerald-50 border-sky-200 text-sky-700",
  slate: "from-slate-50 via-white to-emerald-50 border-slate-200 text-slate-700",
  teal: "from-teal-50 via-white to-lime-50 border-teal-200 text-teal-700",
};

type ProductMediaProps = {
  product: Product;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function ProductMedia({
  product,
  priority = false,
  className,
  imageClassName,
}: ProductMediaProps) {
  if (product.image) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-white",
          className,
        )}
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
          className={cn("object-contain p-4", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br p-5",
        accentClasses[product.accent] ?? accentClasses.emerald,
        className,
      )}
      aria-label={product.imageAlt}
      role="img"
    >
      <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase text-slate-600 shadow-sm">
        <Sparkles className="h-3 w-3" />
        Preview
      </div>
      <div className="absolute bottom-5 right-5 text-current opacity-25">
        <Leaf className="h-16 w-16" />
      </div>
      <PackShape product={product} />
    </div>
  );
}

function PackShape({ product }: { product: Product }) {
  if (product.artwork === "tube") {
    return (
      <div className="relative h-44 w-24 rotate-6 rounded-full border border-white/70 bg-white shadow-xl">
        <div className="absolute inset-x-3 top-6 rounded-lg bg-slate-900 px-2 py-3 text-center text-[10px] font-black uppercase leading-tight text-white">
          Charcoal Herbal
        </div>
        <div className="absolute inset-x-4 bottom-7 h-16 rounded-lg bg-emerald-100" />
        <div className="absolute inset-x-5 bottom-3 h-4 rounded bg-slate-300" />
      </div>
    );
  }

  if (product.artwork === "picks") {
    return (
      <div className="relative h-40 w-44 rounded-lg border border-white/80 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <PackageCheck className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-wide">
            Eco Picks
          </span>
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="h-1.5 flex-1 rounded-full bg-current opacity-40" />
              <span className="h-4 w-8 rounded-full border-2 border-current opacity-60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (product.artwork === "bottle") {
    return (
      <div className="relative h-48 w-24 rounded-b-[28px] rounded-t-lg border border-white/70 bg-white shadow-xl">
        <div className="absolute left-1/2 top-0 h-8 w-12 -translate-x-1/2 -translate-y-5 rounded-t-md bg-current opacity-75" />
        <div className="absolute inset-x-3 top-10 rounded-lg bg-cyan-100 px-2 py-5 text-center text-[10px] font-black uppercase leading-tight text-cyan-900">
          Natural Mint
        </div>
        <ShieldCheck className="absolute bottom-6 left-1/2 h-9 w-9 -translate-x-1/2 text-current" />
      </div>
    );
  }

  return (
    <div className="relative h-52 w-32">
      <div className="absolute left-1/2 top-2 h-32 w-12 -translate-x-1/2 rounded-full bg-amber-100 shadow-lg" />
      <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full border-[10px] border-slate-900 bg-emerald-400" />
      <div className="absolute bottom-0 left-1/2 h-28 w-8 -translate-x-1/2 rounded-full bg-amber-200 shadow-lg" />
      <div className="absolute bottom-2 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-current opacity-80" />
    </div>
  );
}
