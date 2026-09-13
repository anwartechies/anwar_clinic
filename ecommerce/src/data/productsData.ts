export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  concern: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviewsCount: number;
  isSale?: boolean;
  badge?: string | null;
  image: string;
  description: string;
  inStock?: boolean;
  stockQuantity?: number;
  isKit?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sections?: Record<string, any>;
  hiddenSections?: string[];
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: "post-ht-kit",
    name: "Post Hair Transplant Kit",
    slug: "post-hair-transplant-kit",
    category: "Kits & Combos",
    concern: "Post-Transplant Care",
    price: 3200,
    originalPrice: 3285,
    rating: 4.9,
    reviewsCount: 142,
    isSale: true,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    description: "Complete clinical post-transplant care regimen ensuring maximum graft survival and gentle scalp healing.",
  },
  {
    id: "uroots-advanced-regrowth-kit",
    name: "URoots Advanced Hair Regrowth Kit for Men | 4-Step Routine with Max Cyclical Hair Therapy",
    slug: "uroots-advanced-hair-regrowth-kit-men",
    category: "Kits & Combos",
    concern: "Regrowth",
    price: 3607,
    rating: 4.8,
    reviewsCount: 218,
    image: "https://images.unsplash.com/photo-1608248597359-52e3794b6389?auto=format&fit=crop&w=800&q=80",
    description: "4-step cyclical therapy designed by trichologists to revive dormant follicles and halt receding hairline.",
  },
  {
    id: "uroots-daily-kit",
    name: "URoots Daily Kit | Everyday Hair Care for Men and Women",
    slug: "uroots-daily-hair-care-kit",
    category: "Kits & Combos",
    concern: "Daily Maintenance",
    price: 2708,
    rating: 4.7,
    reviewsCount: 95,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    description: "Sulfate-free nourishing daily hair care combo for thicker, shinier, and stronger hair strands.",
  },
  {
    id: "anti-hairfall-shampoo",
    name: "URoots Clinical DHT Blocker Scalp Cleanser & Shampoo",
    slug: "uroots-clinical-dht-blocker-shampoo",
    category: "Shampoos",
    concern: "Hair Fall",
    price: 899,
    originalPrice: 1099,
    rating: 4.9,
    reviewsCount: 310,
    isSale: true,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
    description: "Gentle clarifying shampoo infused with saw palmetto and caffeine to detoxify scalp and reduce shedding.",
  },
  {
    id: "cyclical-tablets",
    name: "URoots Cyclical Vitamin & DHT Blocker Tablets (60 Caps)",
    slug: "uroots-cyclical-vitamin-dht-blocker-tablets",
    category: "Tablets & Supplements",
    concern: "Hair Fall",
    price: 1450,
    rating: 4.8,
    reviewsCount: 180,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    description: "Multi-nutrient capsules packed with Biotin, Zinc, Pumpkin Seed Extract, and amino acids.",
  },
  {
    id: "redensyl-procapil-serum",
    name: "URoots 5% Redensyl + 3% Procapil Hair Growth Serum (50ml)",
    slug: "uroots-redensyl-procapil-hair-growth-serum",
    category: "Topical Solutions",
    concern: "Regrowth",
    price: 1299,
    originalPrice: 1499,
    rating: 4.9,
    reviewsCount: 420,
    isSale: true,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    description: "High-potency water-based activator serum targeting cellular hair follicle renewal.",
  },
  {
    id: "derma-roller-device",
    name: "URoots Titanium 0.5mm Scalp Micro-Needling Derma Roller",
    slug: "uroots-micro-needling-derma-roller",
    category: "Devices",
    concern: "Regrowth",
    price: 699,
    rating: 4.7,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1512290900672-1f02e60eb117?auto=format&fit=crop&w=800&q=80",
    description: "Stimulates collagen synthesis and enhances topical serum absorption up to 300%.",
  },
  {
    id: "dandruff-control-lotion",
    name: "URoots Scalp Relief Anti-Dandruff & Flake Control Lotion",
    slug: "uroots-anti-dandruff-flake-control-lotion",
    category: "Topical Solutions",
    concern: "Dandruff",
    price: 799,
    rating: 4.6,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    description: "Soothes irritated scalps, eliminates stubborn flakes, and restores optimal microbiome balance.",
  },
  {
    id: "laser-growth-helmet",
    name: "NexGen Low-Level Laser Therapy (LLLT) Hair Growth Cap Device",
    slug: "nexgen-lllt-hair-growth-laser-device",
    category: "Devices",
    concern: "Regrowth",
    price: 18999,
    originalPrice: 24999,
    rating: 5.0,
    reviewsCount: 64,
    isSale: true,
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
    description: "US-FDA cleared medical-grade 650nm laser diodes for non-invasive at-home follicle reactivation.",
  },
];
