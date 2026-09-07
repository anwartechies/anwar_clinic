"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, Calendar, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import type { BlogCard } from "@/lib/blogs";

interface BlogsPageClientProps {
  initialBlogs: BlogCard[];
}

export default function BlogsPageClient({ initialBlogs }: BlogsPageClientProps) {
  const { openConsultation } = useConsultation();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const list = ["All"];
    initialBlogs.forEach((b) => {
      if (b.category && !list.includes(b.category)) {
        list.push(b.category);
      }
    });
    return list;
  }, [initialBlogs]);

  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((blog) => {
      if (activeCategory !== "All" && blog.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = blog.title?.toLowerCase().includes(q);
        const matchesExcerpt = blog.excerpt?.toLowerCase().includes(q);
        const matchesTags = blog.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesTags) return false;
      }
      return true;
    });
  }, [initialBlogs, activeCategory, searchQuery]);

  const featuredBlog = useMemo(() => {
    return filteredBlogs.find((b) => b.featured) || filteredBlogs[0] || null;
  }, [filteredBlogs]);

  const gridBlogs = useMemo(() => {
    if (!featuredBlog) return filteredBlogs;
    return filteredBlogs.filter((b) => b.id !== featuredBlog.id);
  }, [filteredBlogs, featuredBlog]);

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f3f6f1] via-[#f7f9f5] to-[#fcfbf9] pt-18 pb-16 md:pt-40 md:pb-24 border-b border-[#e5ebe1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e3ecd9] text-[#41553c] text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#52664d]" />
            Clinical Insights & Patient Guides
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#232b21] tracking-tight max-w-3xl mx-auto leading-tight sm:leading-tight">
            Hair Restoration Knowledge Base & Expert Articles
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#5a6458] max-w-2xl mx-auto leading-relaxed">
            Written by leading hair transplant surgeons and dermatologists. Explore science-backed
            advice on techniques, aftercare routines, and permanent results.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#dce5d7] p-1.5 focus-within:border-[#52664d] focus-within:ring-2 focus-within:ring-[#52664d]/20 transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search procedures, aftercare, recovery, PRP…"
                className="w-full px-3 py-2.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-2 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${activeCategory === cat
                  ? "bg-[#52664d] text-white shadow-md shadow-[#52664d]/25 scale-102"
                  : "bg-white text-[#41553c] border border-[#dce5d7] hover:border-[#52664d] hover:bg-[#f6f9f3]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No articles found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any posts matching &ldquo;{searchQuery}&rdquo; in {activeCategory}.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="mt-5 inline-flex items-center px-4 py-2 rounded-xl bg-[#52664d] text-white text-xs font-semibold hover:bg-[#3f503a] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Spotlight / Featured Hero Post */}
            {featuredBlog && (
              <div className="group relative bg-white rounded-3xl border border-[#e5ebe1] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left Cover Image */}
                  <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        featuredBlog.coverImage ||
                        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80"
                      }
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#52664d] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                        <Sparkles className="w-3 h-3" /> Featured Article
                      </span>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-[#63735f] font-medium mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#eff4eb] text-[#3e5039]">
                          {featuredBlog.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredBlog.readTime}
                        </span>
                      </div>

                      <Link href={`/blogs/${featuredBlog.slug}`}>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#232b21] group-hover:text-[#52664d] transition-colors leading-snug">
                          {featuredBlog.title}
                        </h2>
                      </Link>

                      <p className="mt-3 text-sm sm:text-base text-gray-600 line-clamp-3 leading-relaxed">
                        {featuredBlog.excerpt}
                      </p>
                    </div>

                    {/* Author & CTA Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {featuredBlog.authorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featuredBlog.authorAvatar}
                            alt={featuredBlog.authorName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#52664d] text-white flex items-center justify-center font-bold text-sm">
                            {featuredBlog.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                            {featuredBlog.authorName}
                          </p>
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            {featuredBlog.authorRole}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/blogs/${featuredBlog.slug}`}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#52664d] hover:text-[#384c3c] group-hover:translate-x-0.5 transition-all"
                      >
                        Read Post <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Grid Cards */}
            {gridBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {gridBlogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="group bg-white rounded-2xl border border-[#e5ebe1] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Image */}
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="block relative h-48 sm:h-52 overflow-hidden bg-slate-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            blog.coverImage ||
                            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80"
                          }
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#3e5039] text-[11px] font-semibold tracking-wide shadow-xs">
                            {blog.category}
                          </span>
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {blog.readTime}
                          </span>
                        </div>

                        <Link href={`/blogs/${blog.slug}`}>
                          <h3 className="text-lg font-bold text-[#232b21] group-hover:text-[#52664d] transition-colors leading-snug line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>

                        <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {blog.authorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={blog.authorAvatar}
                            alt={blog.authorName}
                            className="w-7 h-7 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#52664d] text-white flex items-center justify-center font-bold text-xs">
                            {blog.authorName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700">
                          {blog.authorName}
                        </span>
                      </div>

                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#52664d] hover:text-[#384c3c]"
                      >
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* Bottom Consultation Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#52664d] to-[#384c3c] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider mb-3">
              Confidential Surgeon Consultation
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Questions About Your Hair Loss?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed">
              Get an accurate graft estimation, hairline design assessment, and honest medical
              recommendation from Dr. Anwar.
            </p>
          </div>

          <button
            type="button"
            onClick={openConsultation}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-white text-[#384c3c] font-bold text-sm sm:text-base shadow-lg hover:bg-[#f0f4ee] hover:scale-102 transition-all cursor-pointer"
          >
            Book Free Hair Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
