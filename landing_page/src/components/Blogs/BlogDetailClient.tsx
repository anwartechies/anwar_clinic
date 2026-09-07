"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ChevronRight,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
  PhoneCall,
} from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import type { BlogDetail, BlogCard } from "@/lib/blogs";

interface BlogDetailClientProps {
  blog: BlogDetail;
}

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const { openConsultation } = useConsultation();
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${blog.title} - Read more at: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(blog.title);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-20 lg:pt-32 pt-20 ">
      {/* Breadcrumbs Navigation */}
      <div className=" bg-white/70 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#52664d] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            <Link href="/blogs" className="hover:text-[#52664d] transition-colors">
              Blogs
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-gray-800 font-medium truncate max-w-xs sm:max-w-md">
              {blog.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Category & Title Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#eff4eb] text-[#3e5039] text-xs font-semibold uppercase tracking-wider">
              {blog.category}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {blog.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#232b21] tracking-tight leading-tight sm:leading-tight">
            {blog.title}
          </h1>

          {/* Excerpt Lead */}
          {blog.excerpt && (
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed pt-1">
              {blog.excerpt}
            </p>
          )}

          {/* Author Byline & Social Share Row */}
          <div className="pt-4 pb-6 border-b border-[#e5ebe1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {blog.authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={blog.authorAvatar}
                  alt={blog.authorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#52664d] text-white flex items-center justify-center font-bold text-base">
                  {blog.authorName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">{blog.authorName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{blog.authorRole}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            {/* <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
                <Share2 className="w-3.5 h-3.5" /> Share:
              </span>
              <button
                type="button"
                onClick={shareWhatsApp}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-semibold"
                title="Share on WhatsApp"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={shareTwitter}
                className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition text-xs font-semibold"
                title="Share on X / Twitter"
              >
                X
              </button>
              <button
                type="button"
                onClick={shareLinkedIn}
                className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-xs font-semibold"
                title="Share on LinkedIn"
              >
                LinkedIn
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-xs font-semibold flex items-center gap-1"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                {copied ? "Copied" : "Copy"}
              </button>
            </div> */}
          </div>
        </div>

        {/* Featured Cover Image */}
        {blog.coverImage && (
          <div className="my-8 sm:my-10 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-[#e5ebe1] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="prose prose-slate prose-lg max-w-none text-[#2b302c] leading-relaxed
            prose-headings:text-[#232b21] prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:my-4 prose-p:text-gray-700 prose-p:leading-relaxed
            prose-strong:text-[#232b21] prose-strong:font-bold
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-li:my-1.5 prose-li:text-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-[#52664d] prose-blockquote:bg-[#f6f9f3] prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-gray-800
            prose-img:rounded-2xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* In-Article Consultation Callout Box */}
        <div className="my-12 rounded-3xl bg-gradient-to-br from-[#eff4eb] to-[#e4ede0] border border-[#d6e2d1] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#41553c] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#52664d]" /> Personal Hairline & Graft Evaluation
            </span>
            <h4 className="text-xl font-bold text-[#232b21]">
              Considering Hair Restoration at Anwar Clinic?
            </h4>
            <p className="text-xs sm:text-sm text-[#5a6458] max-w-md">
              Speak directly with our surgical specialists. Get your estimated graft count, hairline design preview, and total cost breakdown.
            </p>
          </div>

          <button
            type="button"
            onClick={openConsultation}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#52664d] text-white font-bold text-sm shadow-md hover:bg-[#3f503a] hover:scale-102 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            Book Free Consultation
          </button>
        </div>

        {/* FAQs Accordion (if present) */}
        {blog.faqs && blog.faqs.length > 0 && (
          <div className="my-12 space-y-4 pt-6 border-t border-[#e5ebe1]">
            <h3 className="text-2xl font-bold text-[#232b21]">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 pt-2">
              {blog.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#e5ebe1] bg-white overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-[#232b21] hover:text-[#52664d] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === idx ? "rotate-180 text-[#52664d]" : ""
                        }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="pt-8 pb-10 border-t border-[#e5ebe1] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1">Tags:</span>
            {blog.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-white border border-[#dce5d7] text-xs font-medium text-[#41553c]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div className="my-10 p-6 sm:p-8 rounded-3xl bg-white border border-[#e5ebe1] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {blog.authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blog.authorAvatar}
              alt={blog.authorName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#52664d] text-white flex items-center justify-center font-bold text-2xl shrink-0">
              {blog.authorName.charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-base sm:text-lg font-bold text-gray-900">
                {blog.authorName}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff4eb] text-[#41553c] text-[11px] font-semibold">
                Medical Author
              </span>
            </div>
            <p className="text-xs font-medium text-[#52664d]">{blog.authorRole}</p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
              Dr. Anwar has performed over 3,000+ successful hair restoration procedures, specializing in dense-pack hairline reconstruction and advanced biological follicle preservation.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {blog.related && blog.related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#e5ebe1] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-[#232b21]">
                Related Articles
              </h3>
              <Link
                href="/blogs"
                className="text-xs sm:text-sm font-semibold text-[#52664d] hover:text-[#384c3c] flex items-center gap-1"
              >
                View all blogs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {blog.related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blogs/${item.slug}`}
                  className="group bg-white rounded-2xl border border-[#e5ebe1] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-36 bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.coverImage ||
                          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#3e5039] text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-[#232b21] group-hover:text-[#52664d] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <span>{item.readTime}</span>
                    <span className="text-[#52664d] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
