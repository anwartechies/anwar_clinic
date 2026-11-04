"use client";

import React, { useState } from "react";
import { X, Trash2, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS_DATA, Product } from "@/data/productsData";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, addToCart, subtotal } =
    useCart();

  // Cross-sell recommendations
  const recommendations: Product[] = [
    {
      id: "rec-gut",
      name: "Gentle Gut Daily Gut Health Supplement",
      slug: "gentle-gut-daily-gut-health-supplement",
      category: "Tablets & Supplements",
      concern: "Daily Maintenance",
      price: 299.0,
      originalPrice: 324.0,
      rating: 4.8,
      reviewsCount: 38,
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      description: "Gut microbiome balance capsules that enhance systemic nutrient and biotin absorption.",
    },
    {
      id: "rec-shampoo",
      name: "NexGen Daily Hydrating Anti-DHT Shampoo",
      slug: "NexGen-hydrating-shampoo",
      category: "Shampoos",
      concern: "Hair Fall",
      price: 499.0,
      originalPrice: 599.0,
      rating: 4.9,
      reviewsCount: 112,
      image:
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
      description: "Sulfate-free scalp cleanser that clears sebum buildup and fortifies hair shafts.",
    },
    {
      id: "rec-roller",
      name: "Titanium Micro-Needling 0.5mm Scalp Roller",
      slug: "micro-needling-derma-roller",
      category: "Devices",
      concern: "Regrowth",
      price: 399.0,
      originalPrice: 450.0,
      rating: 4.7,
      reviewsCount: 64,
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      description: "540 titanium needles designed to stimulate blood flow and maximize serum penetration.",
    },
  ];

  const [recIndex, setRecIndex] = useState(0);
  const activeRec = recommendations[recIndex];

  const handleNextRec = () => {
    setRecIndex((prev) => (prev + 1) % recommendations.length);
  };

  const handlePrevRec = () => {
    setRecIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-[420px] max-w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">

          {/* Top Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl sm:text-[26px] font-bold text-[#1b221d] tracking-tight">
              Your cart
            </h2>

            <button
              type="button"
              onClick={closeCart}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 hover:text-black transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5 sm:space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold text-[#1b221d]">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">
                  Discover doctor-formulated kits and treatment products.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 sm:gap-4 items-start">

                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-[#ebe6df] flex-shrink-0 border border-gray-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-[15px] font-bold text-[#1b392b] leading-snug line-clamp-2">
                      {item.product.name}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-[#5c685f] mt-0.5 sm:mt-1 mb-2.5 sm:mb-3">
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Stepper + Delete button */}
                    <div className="flex items-center">
                      <div className="inline-flex items-center justify-between w-24 sm:w-28 bg-[#f4f7f4] border border-gray-200 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold text-[#1b221d]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-black text-sm px-1 cursor-pointer select-none"
                        >
                          –
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-black text-sm px-1 cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Trash Delete */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center ml-2.5 sm:ml-3 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              ))
            )}

            {/* "Customers also like" Recommendation Card */}
            <div className="bg-[#f6faed] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#e2f0d0] mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <h4 className="text-xs sm:text-[15px] font-bold text-[#1b221d]">
                  Customers also like
                </h4>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevRec}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextRec}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recommendation Item */}
              <div className="flex gap-2.5 sm:gap-3 items-center">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg sm:rounded-xl overflow-hidden bg-[#ebe6df] flex-shrink-0 border border-gray-100">
                  <img
                    src={activeRec.image}
                    alt={activeRec.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] sm:text-[13px] font-bold text-[#1b221d] leading-snug line-clamp-2">
                    {activeRec.name}
                  </h5>

                  <div className="flex items-baseline gap-1.5 mt-0.5 mb-1.5 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1b221d]">
                      {formatPrice(activeRec.price)}
                    </span>
                    {activeRec.originalPrice && (
                      <span className="text-[10px] sm:text-[11px] text-[#597843] line-through font-normal">
                        {formatPrice(activeRec.originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(activeRec, 1)}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-[10.5px] sm:text-xs font-semibold text-[#1b221d] py-1 sm:py-1.5 px-3 rounded-full transition-all shadow-2xs active:scale-95 text-center cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Total & Checkout Bar */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-white space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#1b221d]">
                Estimated total
              </span>
              <span className="text-sm sm:text-lg font-bold text-[#1b221d]">
                {formatPrice(subtotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert(`Proceeding to checkout with total ${formatPrice(subtotal)}`)}
              className="w-full bg-[#2d5236] hover:bg-[#22402a] text-white font-bold py-3 sm:py-3.5 px-6 rounded-full flex flex-col items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer text-center"
            >
              <span className="text-xs sm:text-[15px] font-bold text-white">
                Checkout
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-[#b1fc85] font-normal">
                5% off on prepaid orders
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
