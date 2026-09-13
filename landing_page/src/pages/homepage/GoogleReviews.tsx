"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, ExternalLink, PenLine } from "lucide-react";
import { fetchGoogleReviews, type GoogleReviewsData, type GoogleReviewItem } from "@/lib/googleReviews";

interface GoogleReviewsProps {
  className?: string;
}

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
function Stars({ rating, size = "w-3.5 h-3.5" }: { rating: number; size?: string }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (cls: string) => (
    <div className={`flex ${cls}`}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} fill-current flex-shrink-0`} />
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
  if (review.authorPhotoUri && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google-hosted author photo
      <img
        src={review.authorPhotoUri}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }
  return (
    <span className="w-full h-full rounded-full flex items-center justify-center text-white text-base font-bold">
      {review.authorName.trim().charAt(0).toUpperCase() || "G"}
    </span>
  );
}

export default function GoogleReviews({ className = "" }: GoogleReviewsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [data, setData] = useState<GoogleReviewsData | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchGoogleReviews(ctrl.signal).then(setData);
    return () => ctrl.abort();
  }, []);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
    }
  };

  const scroll = (direction: "left" | "right") => {
    sliderRef.current?.scrollBy({ left: direction === "left" ? -340 : 340, behavior: "smooth" });
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [data]);

  // Only ever real reviews: nothing is rendered until live data arrives, and the
  // section stays hidden if Google isn't configured, fails, or has no reviews.
  if (!data) return null;

  return (
    <section className={`py-16 sm:py-20 lg:py-24 bg-[#f8faf8] overflow-hidden ${className}`}>
      <div className="qht-large-container">

        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-800 shadow-xs mb-3">
              <GoogleG />
              <span>Reviews from Google</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight">
              Patient Experiences & Feedback
            </h2>
          </div>

          {/* Right: Aggregate Score + Prev/Next Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {data.rating !== null && (
              <a
                href={data.googleMapsUri ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors"
              >
                <span className="text-3xl font-extrabold text-[#1b221d] font-mono">
                  {data.rating.toFixed(1)}
                </span>
                <div>
                  <Stars rating={data.rating} />
                  <span className="block text-[11px] text-gray-500 font-medium">
                    {data.userRatingCount.toLocaleString("en-IN")} Google {data.userRatingCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </a>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 hover:bg-[#596d53] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="Previous Review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 hover:bg-[#596d53] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="Next Review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Horizontal Slider Track */}
        <div
          ref={sliderRef}
          className="flex gap-6 sm:gap-7 overflow-x-auto no-scrollbar pt-8 pb-8 snap-x snap-mandatory"
        >
          {data.reviews.map((rev, idx) => (
            <article
              key={`${rev.authorName}-${rev.publishTime ?? idx}`}
              className="flex-shrink-0 w-[280px] sm:w-[310px] md:w-[320px] bg-white rounded-3xl p-6 sm:p-7 pt-10 border border-[#e4eae4] shadow-xs flex flex-col justify-between relative snap-start hover:shadow-md transition-shadow"
            >
              {/* Floating Top Center Avatar */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#1b392b] p-0.5">
                <Avatar review={rev} />
              </div>

              <span className="absolute top-4 right-5 text-3xl font-serif text-gray-200 select-none pointer-events-none" aria-hidden="true">
                “
              </span>

              <div>
                {/* Author (links to their Google profile, as Google's attribution rules require) */}
                <div className="text-center mb-3">
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {rev.authorUri ? (
                      <a href={rev.authorUri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {rev.authorName}
                      </a>
                    ) : (
                      rev.authorName
                    )}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <Stars rating={rev.rating} size="w-3 h-3" />
                    {rev.relativeTime && (
                      <span className="text-[11px] text-gray-400">{rev.relativeTime}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed text-center font-normal line-clamp-5 whitespace-pre-line">
                  {rev.text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <GoogleG className="w-3 h-3" /> Google review
                </span>
                {rev.reviewUri && (
                  <a
                    href={rev.reviewUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#52664d] font-semibold hover:underline"
                  >
                    Read on Google <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Scroll Progress Track */}
        <div className="mt-4 flex items-center gap-3 max-w-4xl mx-auto px-4">
          <button onClick={() => scroll("left")} className="text-gray-400 hover:text-gray-700 text-xs" aria-label="Scroll reviews left">
            ◀
          </button>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 rounded-full transition-all duration-150"
              style={{ width: "25%", transform: `translateX(${scrollProgress * 3}%)` }}
            />
          </div>
          <button onClick={() => scroll("right")} className="text-gray-400 hover:text-gray-700 text-xs" aria-label="Scroll reviews right">
            ▶
          </button>
        </div>

        {/* Calls to action + attribution */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={data.writeReviewUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#52664d] hover:bg-[#43543e] text-white text-sm font-semibold px-6 py-3 rounded-full shadow-sm transition-colors"
          >
            <PenLine className="w-4 h-4" /> Write a review
          </a>
          {data.googleMapsUri && (
            <a
              href={data.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#52664d] text-[#52664d] hover:bg-[#52664d] hover:text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              See all reviews on Google <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="mt-4 text-center text-[11px] text-gray-400">Ratings and reviews from Google Maps</p>

      </div>
    </section>
  );
}
