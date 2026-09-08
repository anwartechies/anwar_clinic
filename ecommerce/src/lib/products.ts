import { Product } from "@/data/productsData";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export interface FetchProductsParams {
  category?: string;
  concern?: string;
  search?: string;
  sortBy?: string;
}

/**
 * Fetch all published products strictly from the backend API.
 * Returns only real products available in the database.
 */
export async function fetchProducts(
  params?: FetchProductsParams
): Promise<Product[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "All") {
      searchParams.set("category", params.category);
    }
    if (params?.concern && params.concern !== "All") {
      searchParams.set("concern", params.concern);
    }
    if (params?.search) {
      searchParams.set("search", params.search);
    }
    if (params?.sortBy) {
      searchParams.set("sortBy", params.sortBy);
    }

    const query = searchParams.toString();
    const url = `${API_URL}/public/products${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
      cache: "no-store", // Always fetch fresh live data
    });

    if (!res.ok) {
      console.warn(`[Products API] HTTP error ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error("[Products API] Failed to fetch products:", err.message);
    return [];
  }
}

/**
 * Fetch single published product by slug strictly from the backend API.
 */
export async function fetchProduct(
  slug: string
): Promise<{ product: Product | null; related: Product[] }> {
  try {
    const res = await fetch(`${API_URL}/public/products/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { product: null, related: [] };
    }

    const data = await res.json();
    if (data && data.slug) {
      const { related, ...product } = data;
      return {
        product,
        related: Array.isArray(related) ? related : [],
      };
    }

    return { product: null, related: [] };
  } catch (err: any) {
    console.error(`[Product API] Failed to fetch product ${slug}:`, err.message);
    return { product: null, related: [] };
  }
}
