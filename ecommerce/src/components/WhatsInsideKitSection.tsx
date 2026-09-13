"use client";

import React from "react";

export interface KitItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const DEFAULT_KIT_ITEMS: KitItem[] = [
  {
    id: "item-1",
    title: "URoots Shampoo with Aloe Vera and Pro-Moisturisers For Men and Women",
    description:
      "Description URoots Aloe Vera shampoo is a gentle, daily-use moisturising formula developed to nourish the sensitive post-transplant scalp without stripping natural lipids.",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "item-2",
    title: "URoots Hair Serum (Previously Venfoll Hair Serum)",
    description:
      "Description URoots Hair Serum is an advanced daily care serum for men and women by URoots formulated with Redensyl and Procapil to stimulate dormant follicles.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "item-3",
    title: "URoots Hair Supplement (Previously Growbald)",
    description:
      "Description URoots hair supplement for men is a daily nutraceutical multivitamin, formulated with high-potency Biotin, Zinc, Pumpkin Seed, and vital amino acids.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "item-4",
    title: "URoots Finasil Tablets IP 1mg for Men (Previously Finasil Wellness Tablets)",
    description:
      "Description URoots Finasil Tablets IP 1mg is an oral treatment for men, formulated with pharmaceutical grade DHT blockers to stop progressive follicle miniaturization.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "item-5",
    title: "Gemline-D3 Vitamin D3 Capsules for Hair Care",
    description:
      "Description Gemline-D3 is a high-dose vitamin D3 supplement for men and women looking to replenish critical cellular micro-nutrients needed for new follicular cycling.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
  },
];

interface WhatsInsideKitSectionProps {
  items?: KitItem[];
}

export default function WhatsInsideKitSection({
  items = DEFAULT_KIT_ITEMS,
}: WhatsInsideKitSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="qht-large-container">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c685f] block mb-2">
            WHAT'S INCLUDED
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1b221d] tracking-tight">
            What's Inside Your Kit
          </h2>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col group">
              
              {/* Product Pedestal Image Container */}
              <div className="relative aspect-square w-full rounded-2xl sm:rounded-[26px] overflow-hidden bg-[#ebe6df] mb-3.5 select-none shadow-xs border border-gray-100/60">
                
                {/* Brand Watermark in Top Left */}
                <div className="absolute top-3 left-3 z-10 text-[9px] text-[#4a554c]/75 font-semibold tracking-tight select-none pointer-events-none">
                  <span className="font-bold text-[#1b221d]/85 block">NexGen Meds</span>
                  <span className="text-[7.5px] -mt-0.5 block text-gray-500">Brand backed by NexGen Hair Transplant</span>
                </div>

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-[15px] font-bold text-[#1b221d] leading-snug mb-1.5 group-hover:text-[#52664d] transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#5c685f] leading-relaxed line-clamp-3 font-normal">
                {item.description}
              </p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
