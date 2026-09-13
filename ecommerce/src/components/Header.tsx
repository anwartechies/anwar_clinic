"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount, openCart } = useCart();

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 pointer-events-auto">
      <div className="max-w-[1340px] mx-auto px-3 sm:px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-200/80 py-2 sm:py-2.5 px-3.5 sm:px-8 flex items-center justify-between gap-2">
          
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 select-none group flex-shrink-0">
            <img
              src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/logo3-mtydwmmt1iuppt.png"
              alt="Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
            <span className="border-l border-[#a8843a]/40 pl-1.5 sm:pl-2.5 text-[10px] sm:text-[13px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.14em] leading-tight text-[#a8843a] whitespace-nowrap">
              Meds
            </span>
          </Link>

          {/* Right: Actions (WhatsApp, Shopping Bag Counter, Start Free Hair Test Button) */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* WhatsApp Link */}
            <a
              href="https://wa.me/919084726916?text=Hi,%20I%20need%20help%20choosing%20hair%20care%20products."
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 hover:text-green-600 transition-colors"
              aria-label="Contact WhatsApp"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            </a>

            {/* Shopping Bag Icon with Badge (Triggers Cart Drawer) */}
            <button
              type="button"
              onClick={openCart}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#b1fc85] text-black text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center border border-black/20">
                  {cartCount}
                </span>
              )}
            </button>

            {/* CTA Button: Start with the Free Hair Test */}
            <a
              href="#hair-test"
              className="bg-[#b1fc85] hover:bg-[#a0f770] text-black font-semibold text-[11px] sm:text-sm px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-black/85 shadow-2xs transition-all active:scale-95 whitespace-nowrap inline-block text-center"
            >
              <span className="hidden sm:inline">Start with the </span>Free Hair Test
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
