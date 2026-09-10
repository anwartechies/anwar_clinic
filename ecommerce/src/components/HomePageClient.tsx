"use client";

import React, { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import SidebarFilter from "@/components/SidebarFilter";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/productsData";
import { fetchProducts } from "@/lib/products";
import { Search, ChevronDown, MessageSquare, SlidersHorizontal, X } from "lucide-react";

interface HomePageClientProps {
  initialProducts: Product[];
}

export default function HomePageClient({ initialProducts = [] }: HomePageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync if initialProducts changes or re-fetch on client mount
  useEffect(() => {
    fetchProducts().then((data) => {
      if (Array.isArray(data)) {
        setProducts(data);
      }
    });
  }, []);

  // Dynamic category and concern counts from real available products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const concernCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.concern] = (counts[p.concern] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleConcern = (con: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(con) ? prev.filter((c) => c !== con) : [...prev, con]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim().toLowerCase());
  };

  const activeFiltersCount = selectedCategories.length + selectedConcerns.length;

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeSearch) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(activeSearch) ||
          p.description.toLowerCase().includes(activeSearch) ||
          p.category.toLowerCase().includes(activeSearch) ||
          p.concern.toLowerCase().includes(activeSearch)
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedConcerns.length > 0) {
      list = list.filter((p) => selectedConcerns.includes(p.concern));
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, activeSearch, selectedCategories, selectedConcerns, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#1b221d] flex flex-col antialiased">
      {/* Floating Header */}
      <Header />

      {/* Main Container with top spacing for floating header */}
      <main className="flex-1 qht-large-container pt-24 sm:pt-36 lg:pt-40 pb-20 sm:pb-24">
        
        {/* 2-Column Main Layout: Sidebar on Left, Search + Headline + Products on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Desktop Left Column: Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-3 w-full lg:sticky lg:top-28">
            <SidebarFilter
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              selectedConcerns={selectedConcerns}
              onToggleConcern={handleToggleConcern}
              categoryCounts={categoryCounts}
              concernCounts={concernCounts}
            />
          </div>

          {/* Right Column: Search Controls + Headline + Product Grid */}
          <div className="lg:col-span-9 space-y-4 sm:space-y-6">
            
            {/* 1. Top Controls Bar: Search Input (Left) + Sort By Dropdown & Count (Right) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search Bar with Pill Button */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 max-w-full sm:max-w-sm w-full"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm text-[#1b221d] placeholder-gray-400 focus:outline-none focus:border-[#52664d] shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#b1fc85] hover:bg-[#a1f472] text-black font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full border border-black/85 transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Mobile Filter Trigger + Sort By & Count */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3.5 text-xs sm:text-sm text-[#5c685f]">
                
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 bg-white border border-gray-300 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#1b221d] shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline font-medium text-[#1b221d]">Sort by:</span>
                  <div className="relative inline-block">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-full px-3 sm:px-4 py-1.5 pr-7 sm:pr-8 text-[11px] sm:text-sm font-medium text-[#1b221d] focus:outline-none focus:border-[#52664d] cursor-pointer shadow-2xs"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <span className="font-semibold text-[#1b221d] whitespace-nowrap text-[11px] sm:text-sm">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                </span>
              </div>

            </div>

            {/* 2. Headline aligned over the products section */}
            <div className="pt-1">
              <h1 className="text-xl sm:text-3xl lg:text-[36px] font-bold text-[#1b221d] tracking-tight leading-snug">
                Science-backed hair wellness solutions trusted by thousands.
              </h1>
            </div>

            {/* 3. Product Cards Grid: 2-Column on Mobile, 3-Column on Desktop */}
            <div>
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-xs">
                  <h3 className="text-base sm:text-lg font-bold text-[#1b221d] mb-2">
                    No products matched your selection
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c685f] mb-6">
                    Try clearing your search or filter tags to discover available treatments.
                  </p>
                  <button
                    onClick={() => {
                      setActiveSearch("");
                      setSearchQuery("");
                      setSelectedCategories([]);
                      setSelectedConcerns([]);
                    }}
                    className="bg-[#52664d] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#43543e] transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Mobile Drawer Filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-bold text-base text-[#1b221d]">Filters</h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <SidebarFilter
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                selectedConcerns={selectedConcerns}
                onToggleConcern={handleToggleConcern}
                categoryCounts={categoryCounts}
                concernCounts={concernCounts}
              />
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#2d5236] text-white font-bold py-3 rounded-full text-xs shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
