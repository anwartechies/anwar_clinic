"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, ExternalLink, PenLine } from "lucide-react";
import { fetchGoogleReviews, type GoogleReviewsData, type GoogleReviewItem } from "@/lib/googleReviews";

interface GoogleReviewsProps {
  className?: string;
}

/** Reviews longer than this get a "Read more" toggle. */
const LONG_REVIEW_CHARS = 220;
const AVATAR_COLORS = ["#52664d", "#1b392b", "#7a6a3a", "#3f5f6b", "#6b4f5f", "#4f6b58"];

function GoogleG({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27c-.82 1.63-1.27 3.48-1.27 5.39s.45 3.76 1.27 5.39l4.01-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
    </svg>
  );
}

/** Five stars filled to the exact rating (e.g. 4.7 fills the fifth star 70%). */
function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (cls: string) => (
    <div className={`flex gap-0.5 ${cls}`}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} fill-current flex-shrink-0`} strokeWidth={0} />
      ))}
    </div>
  );
  return (
    <div className="relative inline-block" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {row("text-gray-200")}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("text-amber-400")}
      </div>
    </div>
  );
}

function Avatar({ review }: { review: GoogleReviewItem }) {
  const [failed, setFailed] = useState(false);
  const initial = review.authorName.trim().charAt(0).toUpperCase() || "G";
  if (review.authorPhotoUri && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google-hosted author photo
      <img
        src={review.authorPhotoUri}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-11 h-11 rounded-full object-cover flex-shrink-0 bg-gray-100"
      />
    );
  }
  const color = AVATAR_COLORS[review.authorName.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span
      className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white text-base font-semibold"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function ReviewCard({ review }: { review: GoogleReviewItem }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > LONG_REVIEW_CHARS;

  return (
    <article className="min-h-[292px] bg-white rounded-3xl p-6 border border-[#e4eae4] shadow-[0_2px_12px_rgba(27,34,29,0.04)] flex flex-col">
      <header className="flex items-start gap-3">
        <Avatar review={review} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[#1b221d] leading-snug truncate">
            {review.authorUri ? (
              <a href={review.authorUri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {review.authorName}
              </a>
            ) : (
              review.authorName
            )}
          </h3>
          {review.relativeTime && <p className="text-xs text-[#7a857c] mt-0.5">{review.relativeTime}</p>}
        </div>
        <GoogleG className="w-5 h-5 flex-shrink-0 mt-0.5" />
      </header>

      <div className="mt-4">
        <Stars rating={review.rating} size="w-4 h-4" />
      </div>

      <p
        className={`mt-3 text-sm text-[#4a554c] leading-relaxed whitespace-pre-line ${
          isLong && !expanded ? "line-clamp-5" : ""
        }`}
      >
        {review.text}
      </p>

      <div className="mt-auto pt-4 flex items-center justify-between gap-3 text-xs">
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="font-semibold text-[#52664d] hover:text-[#384c3c] cursor-pointer"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : (
          <span />
        )}
        {review.reviewUri && (
          <a
            href={review.reviewUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#7a857c] hover:text-[#52664d]"
          >
            View on Google <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
}

export default function GoogleReviews({ className = "" }: GoogleReviewsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchGoogleReviews(ctrl.signal).then(setData);
    return () => ctrl.abort();
  }, []);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ atStart: el.scrollLeft <= 4, atEnd: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [data, updateEdges]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = trackRef.current;
    const card = el?.querySelector<HTMLElement>("[data-review-card]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
  };

  // Only ever real reviews: nothing renders until live data arrives, and the
  // section stays hidden if Google isn't configured, fails, or has no reviews.
  if (!data) return null;

  const scrollable = !(edges.atStart && edges.atEnd);
  const countLabel = `${data.userRatingCount.toLocaleString("en-IN")} ${data.userRatingCount === 1 ? "review" : "reviews"}`;

  return (
    <section
      aria-labelledby="google-reviews-heading"
      className={`py-16 sm:py-20 lg:py-24 bg-[#f8faf8] overflow-hidden ${className}`}
    >
      <div className="qht-large-container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end mb-10 sm:mb-12">
          {/* Heading */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 shadow-xs mb-4">
              <GoogleG />
              <span>Google Reviews</span>
            </div>
            <h2
              id="google-reviews-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight"
            >
              Patient Experiences & Feedback
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5c685f] max-w-xl">
              Real reviews from patients, straight from our Google profile.
            </p>
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-3xl border border-[#e4eae4] shadow-[0_8px_30px_rgba(27,34,29,0.06)] p-6">
            <div className="flex items-center gap-4">
              {data.rating !== null && (
                <span className="text-5xl font-semibold text-[#1b221d] tracking-tight leading-none tabular-nums">
                  {data.rating.toFixed(1)}
                </span>
              )}
              <div>
                {data.rating !== null && <Stars rating={data.rating} size="w-5 h-5" />}
                <p className="mt-1 text-sm text-[#5c685f]">
                  Based on{" "}
                  {data.googleMapsUri ? (
                    <a
                      href={data.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#1b221d] underline decoration-gray-300 underline-offset-2 hover:decoration-[#52664d]"
                    >
                      {countLabel}
                    </a>
                  ) : (
                    <span className="font-semibold text-[#1b221d]">{countLabel}</span>
                  )}
                </p>
              </div>
              <GoogleG className="w-8 h-8 ml-auto self-start" />
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 whitespace-nowrap">
              <a
                href={data.writeReviewUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 border border-transparent bg-[#52664d] hover:bg-[#43543e] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
              >
                <PenLine className="w-4 h-4" /> Write a review
              </a>
              {data.googleMapsUri && (
                <a
                  href={data.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 border border-[#cfd8cf] text-[#1b221d] hover:border-[#52664d] hover:text-[#52664d] text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                >
                  View all <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Reviews track */}
        <div className="relative">
          <div
            ref={trackRef}
            role="region"
            aria-label="Google reviews"
            tabIndex={0}
            className="flex items-start gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52664d]/40 rounded-3xl"
          >
            {data.reviews.map((review, idx) => (
              <div
                key={`${review.authorName}-${review.publishTime ?? idx}`}
                data-review-card
                className="snap-start flex-shrink-0 w-[85%] sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] xl:w-[calc((100%-60px)/4)]"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls + attribution */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400">Ratings and reviews from Google Maps</p>
          {scrollable && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={edges.atStart}
                aria-label="Previous reviews"
                className="w-11 h-11 rounded-full bg-white border border-gray-200 text-[#1b221d] flex items-center justify-center shadow-xs transition-colors enabled:hover:bg-[#52664d] enabled:hover:text-white enabled:hover:border-[#52664d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={edges.atEnd}
                aria-label="Next reviews"
                className="w-11 h-11 rounded-full bg-white border border-gray-200 text-[#1b221d] flex items-center justify-center shadow-xs transition-colors enabled:hover:bg-[#52664d] enabled:hover:text-white enabled:hover:border-[#52664d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
