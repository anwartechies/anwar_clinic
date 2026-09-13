"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/data/productsData";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("INR", "Rs.");
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    addToCart(product, 1);
    if (onAddToCart) onAddToCart(product);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="flex flex-col justify-between group transition-all duration-300">
      
      <div>
        {/* Top Image Container with Soft Rounded Corners and Pedestal Vibe */}
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square w-full rounded-2xl sm:rounded-[28px] overflow-hidden bg-[#ebe6df] mb-2.5 sm:mb-3.5 select-none shadow-xs cursor-pointer">
            
            {/* Sale Tag */}
            {product.isSale && (
              <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20 bg-[#3b82f6] text-white text-[9.5px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded shadow-xs">
                Sale
              </span>
            )}

            {/* Brand Watermark in Top Corner */}
            <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 text-[8px] sm:text-[9px] text-[#4a554c]/70 font-semibold tracking-tight text-right select-none pointer-events-none">
              <span className="font-bold text-[#1b221d]/80 block text-[9px] sm:text-[10px]">NexGen Meds</span>
              <span className="text-[6.5px] sm:text-[7.5px] -mt-0.5 block text-gray-500">Brand backed by NexGen Hair Transplant</span>
            </div>

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs sm:text-[16px] font-bold text-[#1b221d] leading-snug line-clamp-2 group-hover:text-[#52664d] transition-colors mb-1.5 sm:mb-2 cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Pricing Row */}
        <div className="flex items-baseline gap-1.5 sm:gap-2.5 mb-1 flex-wrap">
          <span className="text-xs sm:text-lg font-bold text-[#1b221d]">
            {formatPrice(product.price)}
          </span>

          {product.originalPrice && (
            <span className="text-[10.5px] sm:text-base text-[#597843] line-through font-normal">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Outline Pill Button */}
      <div className="pt-1.5 sm:pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full sm:w-auto border border-[#7a887b] hover:border-black rounded-full px-3.5 sm:px-7 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-[#4a554c] hover:text-black bg-white hover:bg-gray-50 transition-all cursor-pointer select-none active:scale-95 shadow-2xs text-center"
        >
          {isAdded ? "Added ✓" : "Add to cart"}
        </button>
      </div>

    </div>
  );
}
