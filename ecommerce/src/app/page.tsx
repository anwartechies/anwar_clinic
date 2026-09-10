import React from "react";
import { fetchProducts } from "@/lib/products";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function EcommerceHomePage() {
  const products = await fetchProducts();
  return <HomePageClient initialProducts={products} />;
}
