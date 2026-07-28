export type ProductStatus = "available" | "coming-soon";

export type ProductArtwork = "brush" | "tube" | "picks" | "bottle";

export type Product = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  collection: string;
  badge: string;
  status: ProductStatus;
  availabilityLabel: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  ordersCount: number;
  image?: string;
  imageAlt: string;
  artwork: ProductArtwork;
  accent: string;
  summary: string;
  description: string;
  features: string[];
  highlights: string[];
  trustTags: string[];
  variants: string[];
  specs: {
    label: string;
    value: string;
  }[];
  deliveryNote: string;
};

export const products: Product[] = [
  {
    id: "bamboo-toothbrush",
    name: "MR Dental Bamboo Toothbrush",
    shortName: "Bamboo Toothbrush",
    category: "Oral Care",
    collection: "Eco Daily Care",
    badge: "Best Deal",
    status: "available",
    availabilityLabel: "In stock",
    price: 44,
    originalPrice: 99,
    rating: 5,
    reviewsCount: 128,
    ordersCount: 740,
    image: "/products/bamboo-toothbrush.jpeg",
    imageAlt: "MR Dental bamboo toothbrush product poster",
    artwork: "brush",
    accent: "emerald",
    summary:
      "Charcoal-infused soft bristles with a biodegradable bamboo handle for daily oral care.",
    description:
      "A doctor-curated, eco-conscious toothbrush designed for gentle plaque removal, sensitive gums, and a cleaner daily routine without plastic-heavy waste.",
    features: [
      "Biodegradable bamboo handle",
      "Charcoal-infused ultra-soft bristles",
      "Gentle grip for daily brushing",
      "Plastic-free and vegan choice",
    ],
    highlights: [
      "Soft bristles support sensitive gum care",
      "Natural bamboo handle keeps the product lightweight",
      "Charcoal-infused bristles help clean surface plaque",
      "Designed for adults and older children under supervision",
    ],
    trustTags: ["Doctor curated", "Eco friendly", "Gentle on gums"],
    variants: ["Natural", "Blue grip", "Green grip"],
    specs: [
      { label: "Handle", value: "Natural bamboo" },
      { label: "Bristle type", value: "Ultra soft charcoal-infused" },
      { label: "Best for", value: "Daily brushing and gum-friendly care" },
      { label: "Brand", value: "MR Dental by Abd Hind Medicare" },
    ],
    deliveryNote: "Clinic pickup and local bulk orders available.",
  },
  {
    id: "s-curve-neem-charcoal-brush",
    name: "MR Dental S Curve Neem & Charcoal Brush",
    shortName: "S Curve Brush",
    category: "Oral Care",
    collection: "Limited Offer",
    badge: "55% Off",
    status: "available",
    availabilityLabel: "Limited stock",
    price: 44,
    originalPrice: 99,
    rating: 4.9,
    reviewsCount: 96,
    ordersCount: 520,
    image: "/products/limited-offer.jpeg",
    imageAlt: "MR Dental limited offer toothbrush range poster",
    artwork: "brush",
    accent: "amber",
    summary:
      "S-curve bamboo toothbrush with neem and charcoal positioning for a fresh daily clean.",
    description:
      "A value-focused brush from the MR Dental limited offer range, made for customers who want a natural-feel handle, soft bristles, and an accessible introductory price.",
    features: [
      "S-curve profile for comfortable brushing",
      "Neem and charcoal care positioning",
      "Lightweight bamboo body",
      "Introductory limited offer price",
    ],
    highlights: [
      "Designed for comfortable reach around back teeth",
      "Natural-feel handle with a clean grip",
      "Soft bristles support everyday plaque removal",
      "A practical option for family pack and bulk purchase",
    ],
    trustTags: ["Limited offer", "Neem goodness", "Eco friendly"],
    variants: ["S Curve", "Family pack", "Clinic pack"],
    specs: [
      { label: "Handle", value: "Bamboo" },
      { label: "Bristle type", value: "Soft bristles" },
      { label: "Best for", value: "Everyday oral hygiene" },
      { label: "Offer", value: "Limited stock introductory discount" },
    ],
    deliveryNote: "Call the clinic team for current stock and bulk pricing.",
  },
  {
    id: "nano-ultra-soft-toothbrush",
    name: "MR Dental Toothbrush Nano Ultra Soft",
    shortName: "Nano Ultra Soft",
    category: "Sensitive Care",
    collection: "Limited Offer",
    badge: "60% Off",
    status: "available",
    availabilityLabel: "Selling fast",
    price: 79,
    originalPrice: 199,
    rating: 4.8,
    reviewsCount: 82,
    ordersCount: 410,
    image: "/products/limited-offer.jpeg",
    imageAlt: "MR Dental nano ultra soft toothbrush offer poster",
    artwork: "brush",
    accent: "sky",
    summary:
      "Nano ultra-soft bristles for a feather-light brushing feel on sensitive teeth and gums.",
    description:
      "Built for customers who prefer an extra-gentle brush head, this toothbrush keeps daily brushing soft while still supporting a clean, fresh mouthfeel.",
    features: [
      "Nano ultra-soft brushing feel",
      "Gentle on teeth and gums",
      "Lightweight ergonomic grip",
      "Suited for sensitive-care routines",
    ],
    highlights: [
      "Soft bristle profile reduces harsh brushing feel",
      "Comfort grip improves daily control",
      "Useful after dental consultation when soft brushing is preferred",
      "Part of the MR Dental limited offer range",
    ],
    trustTags: ["Sensitive care", "Soft bristles", "Clinic supported"],
    variants: ["Green grip", "Blue grip", "Assorted pack"],
    specs: [
      { label: "Bristle type", value: "Nano ultra soft" },
      { label: "Best for", value: "Sensitive teeth and gentle daily care" },
      { label: "Grip", value: "Ergonomic bottom paint handle" },
      { label: "Offer", value: "Limited stock introductory discount" },
    ],
    deliveryNote: "Available while clinic stock lasts.",
  },
  {
    id: "organic-charcoal-toothpaste",
    name: "Organic Charcoal Herbal Toothpaste",
    shortName: "Charcoal Toothpaste",
    category: "Oral Care",
    collection: "Herbal Range",
    badge: "Launching Soon",
    status: "coming-soon",
    availabilityLabel: "Waitlist open",
    price: 149,
    originalPrice: 249,
    rating: 4.9,
    reviewsCount: 45,
    ordersCount: 180,
    imageAlt: "Organic charcoal herbal toothpaste concept pack",
    artwork: "tube",
    accent: "slate",
    summary:
      "Fluoride-free herbal toothpaste concept with charcoal, clove, and mint freshness.",
    description:
      "A planned herbal toothpaste range focused on everyday freshness, gentle whitening support, and a clean ingredient story for natural-care customers.",
    features: [
      "Activated charcoal positioning",
      "Clove and spearmint inspired freshness",
      "Planned paraben and SLS free profile",
      "Enamel-friendly daily care positioning",
    ],
    highlights: [
      "Designed as a natural freshness partner for daily brushing",
      "Charcoal positioning supports a whitening-care routine",
      "Mint-forward profile planned for long-lasting breath confidence",
      "Built to pair with the bamboo toothbrush range",
    ],
    trustTags: ["Herbal concept", "Mint fresh", "Waitlist"],
    variants: ["Charcoal mint", "Clove mint"],
    specs: [
      { label: "Format", value: "Toothpaste tube" },
      { label: "Best for", value: "Daily oral freshness" },
      { label: "Range", value: "Upcoming herbal care" },
      { label: "Status", value: "Launch waitlist open" },
    ],
    deliveryNote: "Join the enquiry list for launch updates.",
  },
  {
    id: "biodegradable-dental-floss-picks",
    name: "Biodegradable Dental Floss Picks",
    shortName: "Floss Picks",
    category: "Preventive Care",
    collection: "Eco Daily Care",
    badge: "Coming Soon",
    status: "coming-soon",
    availabilityLabel: "Preview",
    price: 99,
    originalPrice: 199,
    rating: 4.8,
    reviewsCount: 32,
    ordersCount: 150,
    imageAlt: "Biodegradable dental floss picks concept pack",
    artwork: "picks",
    accent: "teal",
    summary:
      "Eco-conscious floss picks concept for interdental cleaning and plaque-control routines.",
    description:
      "A planned preventive-care product for customers who want quick interdental cleaning with a lower-plastic daily-use alternative.",
    features: [
      "Cornstarch-based handle concept",
      "Shred-resistant floss thread positioning",
      "Plaque removal support",
      "Designed for everyday interdental care",
    ],
    highlights: [
      "Easy pocket-friendly format for daily use",
      "Helps clean areas a toothbrush cannot reach",
      "Useful for post-meal oral hygiene routines",
      "Designed to complement dental checkup advice",
    ],
    trustTags: ["Preventive care", "Pocket pack", "Eco concept"],
    variants: ["Pack of 30", "Pack of 60"],
    specs: [
      { label: "Format", value: "Floss pick pack" },
      { label: "Best for", value: "Interdental cleaning" },
      { label: "Range", value: "Upcoming preventive care" },
      { label: "Status", value: "Product preview" },
    ],
    deliveryNote: "Register interest for launch and family pack details.",
  },
  {
    id: "natural-mint-mouthwash",
    name: "Natural Mint Antibacterial Mouthwash",
    shortName: "Mint Mouthwash",
    category: "Oral Hygiene",
    collection: "Fresh Breath",
    badge: "In Development",
    status: "coming-soon",
    availabilityLabel: "Preview",
    price: 199,
    originalPrice: 349,
    rating: 5,
    reviewsCount: 60,
    ordersCount: 210,
    imageAlt: "Natural mint mouthwash concept bottle",
    artwork: "bottle",
    accent: "blue",
    summary:
      "Alcohol-free natural mint rinse concept for fresh breath and daily oral hygiene support.",
    description:
      "A planned mouthwash range with a non-stinging freshness profile, built for customers who want a cleaner after-brush routine without harsh alcohol burn.",
    features: [
      "Alcohol-free positioning",
      "Mint botanical freshness",
      "Non-stinging rinse profile",
      "Doctor-formulated product direction",
    ],
    highlights: [
      "Designed for morning and night freshness routines",
      "Mint-led taste profile for broad family acceptance",
      "Supports a cleaner mouthfeel after brushing",
      "Planned as part of the MR Dental oral hygiene range",
    ],
    trustTags: ["Alcohol free", "Mint fresh", "In development"],
    variants: ["Mint fresh", "Sensitive fresh"],
    specs: [
      { label: "Format", value: "Mouthwash bottle" },
      { label: "Best for", value: "Fresh breath and oral rinse routines" },
      { label: "Range", value: "Upcoming hygiene care" },
      { label: "Status", value: "In development" },
    ],
    deliveryNote: "Join the enquiry list for development updates.",
  },
];

export const productCategories = [
  "All",
  ...Array.from(new Set(products.map((product) => product.category))),
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getProductDiscount(product: Product) {
  return Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
}

export function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export function getRelatedProducts(product: Product) {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.category === product.category ||
          candidate.collection === product.collection),
    )
    .slice(0, 3);
}
