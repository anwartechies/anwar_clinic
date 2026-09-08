"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  Leaf,
  FlaskConical,
  Check,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Product } from "@/data/productsData";
import { useCart } from "@/context/CartContext";

interface ProductDetailHeroProps {
  product: Product;
}

export default function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "suitableFor">("description");
  const [isExpandedText, setIsExpandedText] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Gallery images list (with fallbacks and gallery angles)
  const customGallery: string[] = product.sections?.hero?.galleryImages || [];
  const galleryImages = [
    product.image,
    ...customGallery.filter((img) => img && img !== product.image),
  ];
  if (galleryImages.length === 1) {
    galleryImages.push(
      "https://images.unsplash.com/photo-1608248597359-52e3794b6389?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    );
  }

  const customSuitableFor: string[] = product.sections?.hero?.suitableFor;
  const suitableForList: string[] =
    customSuitableFor && customSuitableFor.length > 0
      ? customSuitableFor
      : [
          "Patients recovering from FUT / FUE / QHT procedures",
          "Individuals experiencing active hair thinning & shedding",
          "Safe for daily use on sensitive or irritated scalps",
        ];

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
    addToCart(product, quantity);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="pt-24 sm:pt-36 lg:pt-40 pb-12 sm:pb-20">
      <div className="qht-large-container">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-[#5c685f] mb-4 sm:mb-6 font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <Link href="/" className="hover:text-black transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-[#1b221d] font-semibold truncate max-w-[180px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">

          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-6 flex flex-col">

            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-[36px] overflow-hidden bg-[#ebe6df] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100/80 group">

              {/* Brand Watermark on Top Left */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 text-[9px] sm:text-[10px] text-[#4a554c]/80 font-semibold tracking-tight select-none pointer-events-none">
                <span className="font-bold text-[#1b221d] text-[11px] sm:text-xs block">U.Roots</span>
                <span className="text-[7.5px] sm:text-[8.5px] -mt-0.5 block text-gray-500">Brand backed by QHT</span>
              </div>

              {/* Zoom Indicator Icon */}
              {/* <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/70 backdrop-blur-xs flex items-center justify-center text-gray-600 shadow-2xs">
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div> */}

              <img
                src={galleryImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto no-scrollbar pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-[#ebe6df] border-2 transition-all cursor-pointer ${selectedImageIndex === idx
                      ? "border-[#1b221d] shadow-sm scale-102"
                      : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Product Detail & Purchase Box */}
          <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-[36px] p-5 sm:p-9 lg:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between">

            <div>
              {/* Reviews Rating Stars */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center text-[#ffb400]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#5c685f]">
                  {product.reviewsCount || 10} reviews
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl lg:text-[34px] font-bold text-[#1b221d] tracking-tight leading-tight mb-2 sm:mb-3">
                {product.name}
              </h1>

              {/* Pricing Block */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="text-xl sm:text-3xl font-bold text-[#2e7d32]">
                  {formatPrice(product.price)}
                </span>

                {product.originalPrice && (
                  <span className="text-sm sm:text-lg text-gray-400 line-through font-normal">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}

                {product.isSale && (
                  <span className="bg-[#b1fc85] text-black text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 rounded-full border border-black/40 shadow-2xs">
                    Sale
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-[11.5px] text-[#5c685f] mt-1 mb-4 sm:mb-6">
                Taxes included. <span className="font-semibold text-[#1b221d] underline cursor-pointer">Shipping</span> calculated at checkout.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3 py-3 sm:py-4 border-y border-gray-100 my-4 sm:my-5">

                {/* 1. Clinically Tested */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center text-[#345c3b] mb-1 bg-[#f8faf8]">
                    <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9.5px] sm:text-xs font-medium text-[#1b221d] leading-tight">
                    Clinically<br />Tested
                  </span>
                </div>

                {/* 2. Free Shipping */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center text-[#345c3b] mb-1 bg-[#f8faf8]">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9.5px] sm:text-xs font-medium text-[#1b221d] leading-tight">
                    Free<br />Shipping
                  </span>
                </div>

                {/* 3. QHT Clinic Backed */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center text-[#345c3b] mb-1 bg-[#f8faf8]">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9.5px] sm:text-xs font-medium text-[#1b221d] leading-tight">
                    QHT Clinic<br />Backed
                  </span>
                </div>

                {/* 4. 100% No Sulphates */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 flex items-center justify-center text-[#345c3b] mb-1 bg-[#f8faf8]">
                    <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[9.5px] sm:text-xs font-medium text-[#1b221d] leading-tight">
                    100% No<br />Sulphates
                  </span>
                </div>

              </div>

              {/* Quantity Stepper */}
              <div className="mb-5 sm:mb-6">
                <span className="text-xs font-semibold text-[#1b221d] block mb-1.5">
                  Quantity ({quantity} in cart)
                </span>

                <div className="inline-flex items-center justify-between w-28 sm:w-32 bg-[#f8faf8] border border-gray-200 rounded-full px-3.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-gray-500 hover:text-black text-base px-1 select-none cursor-pointer"
                  >
                    –
                  </button>
                  <span className="text-[#1b221d]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-gray-500 hover:text-black text-base px-1 select-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tabs: Description vs Suitable For */}
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("description")}
                    className={`text-xs sm:text-sm font-bold px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl transition-all cursor-pointer ${activeTab === "description"
                        ? "bg-[#fbf7eb] text-[#1b221d] shadow-2xs"
                        : "text-[#5c685f] hover:text-black"
                      }`}
                  >
                    Description
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("suitableFor")}
                    className={`text-xs sm:text-sm font-bold px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl transition-all cursor-pointer ${activeTab === "suitableFor"
                        ? "bg-[#fbf7eb] text-[#1b221d] shadow-2xs"
                        : "text-[#5c685f] hover:text-black"
                      }`}
                  >
                    Suitable For
                  </button>
                </div>

                {/* Tab Content */}
                <div className="text-xs sm:text-[13px] text-[#5c685f] leading-relaxed">
                  {activeTab === "description" ? (
                    <div>
                      <p className={isExpandedText ? "" : "line-clamp-3"}>
                        {product.description ||
                          "URoots Post Hair Transplant Kit is an expert-curated, complete hair regrowth treatment bundle for men designed to support recovery and maintain long-term hair density after hair restoration procedures. This kit provides targeted scalp treatment, follicle activation, and vital cellular nutrition."}
                        {" "}Formulated with US-FDA approved compounds, peptides, and organic botanicals under clinical supervision of QHT Clinic dermatologists.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsExpandedText(!isExpandedText)}
                        className="text-[#1b221d] font-bold text-xs underline mt-1.5 cursor-pointer block"
                      >
                        {isExpandedText ? "Show Less" : "Read More"}
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-[#4a554c]">
                      {suitableForList.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#2e7d32] flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 sm:pt-4 border-t border-gray-100">

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#2d5236] hover:bg-[#23422a] text-white font-bold py-3 sm:py-3.5 px-6 rounded-full text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer text-center"
              >
                {isAdded ? "Added to Cart ✓" : "Add To Cart"}
              </button>

              {/* Buy It Now Button */}
              <button
                type="button"
                onClick={() => alert(`Proceeding to checkout for ${product.name} (Qty: ${quantity})`)}
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-2.5 sm:py-2.5 px-6 rounded-full text-xs sm:text-sm flex flex-col items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Buy It Now</span>
                <span className="text-[9.5px] sm:text-[10px] text-gray-300 font-normal -mt-0.5">
                  5% off on prepaid orders
                </span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
