"use client";

import React, { useState } from "react";
import { Star, CheckCircle, User, ChevronDown, MessageSquare } from "lucide-react";

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  headline: string;
  comment: string;
}

export const REVIEWS_LIST: CustomerReview[] = [
  {
    id: "rev-1",
    author: "Akanksha Mathur",
    rating: 5,
    headline: "Complete kit worth every rupee",
    comment:
      "Did the math before buying - the Total Hair Restoration Kit was about 20% cheaper than buying products individually. Got it 5 months ago. Topical plus supplement combo is working together. My hairline at the temples is filling in noticeably.",
  },
  {
    id: "rev-2",
    author: "Lakshmi Ghosh",
    rating: 5,
    headline: "Best starter kit for men",
    comment:
      "I was completely lost when I started looking into hair loss treatment - so many products, conflicting info. The Total Hair Restoration Kit just gave me everything I needed in one box with clear instructions. 4 months in and seeing improvement.",
  },
  {
    id: "rev-3",
    author: "Mayank Talwar",
    rating: 5,
    headline: "Kit ne sab aasaan kar diya",
    comment:
      "Itne saare products hain market mein, samajh nahi aata kaunsa lo. NexGen ka Total Hair Restoration Kit khareed liya, decision khatam. Sab ek saath, sab ek dusre ke saath kaam karte hain. 3 mahine mein dheere dheere progress dikh raha hai.",
  },
  {
    id: "rev-4",
    author: "Sachin Tandon",
    rating: 4,
    headline: "Great kit, takes commitment",
    comment:
      "This Total Hair Restoration Kit isn't a quick fix - you have to give it at least 3-4 months consistently. I almost gave up at month 2 thinking nothing was happening. Glad I stuck with it. Month 5 and the progress is real.",
  },
  {
    id: "rev-5",
    author: "Hemant Jha",
    rating: 5,
    headline: "Good value and real results",
    comment:
      "Total Hair Restoration Kit saves about 25% over buying things separately. Both products in the kit are good quality, not cheap fillers. Following the routine for 4 months, hair fall is way down and I can see small new hairs.",
  },
];

export default function CustomerReviewsSection() {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [reviews, setReviews] = useState<CustomerReview[]>(REVIEWS_LIST);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      headline: newHeadline || "Verified Review",
      comment: newComment,
    };

    setReviews([newRev, ...reviews]);
    setShowReviewModal(false);
    setNewAuthor("");
    setNewHeadline("");
    setNewComment("");
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">

        {/* Section Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1b221d] tracking-tight">
            Customer Reviews
          </h2>
        </div>

        {/* Reviews Summary Top Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-gray-200">

          {/* Left: Overall Score */}
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-[#2e7d32]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current text-[#2e7d32]" />
              ))}
              <span className="text-sm font-bold text-[#1b221d] ml-1">
                4.80 out of 5
              </span>
            </div>
            <p className="text-xs text-[#5c685f] flex items-center justify-center md:justify-start gap-1 font-medium">
              <span>Based on {reviews.length} reviews</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#00b573] inline" />
            </p>
          </div>

          {/* Center: Rating Distribution Progress Bars */}
          <div className="md:col-span-5 space-y-1.5">
            {/* 5 Stars */}
            <div className="flex items-center gap-2 text-xs text-[#5c685f]">
              <div className="flex text-[#2e7d32] text-[10px]">
                ★★★★★
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2e7d32] rounded-full w-[80%]" />
              </div>
              <span className="w-4 text-right text-[11px] font-semibold text-[#1b221d]">
                8
              </span>
            </div>

            {/* 4 Stars */}
            <div className="flex items-center gap-2 text-xs text-[#5c685f]">
              <div className="flex text-[#2e7d32] text-[10px]">
                ★★★★☆
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2e7d32] rounded-full w-[20%]" />
              </div>
              <span className="w-4 text-right text-[11px] font-semibold text-[#1b221d]">
                2
              </span>
            </div>

            {/* 3 Stars */}
            <div className="flex items-center gap-2 text-xs text-[#5c685f]">
              <div className="flex text-gray-300 text-[10px]">
                ★★★☆☆
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2e7d32] rounded-full w-[0%]" />
              </div>
              <span className="w-4 text-right text-[11px] text-gray-400">
                0
              </span>
            </div>

            {/* 2 Stars */}
            <div className="flex items-center gap-2 text-xs text-[#5c685f]">
              <div className="flex text-gray-300 text-[10px]">
                ★★☆☆☆
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2e7d32] rounded-full w-[0%]" />
              </div>
              <span className="w-4 text-right text-[11px] text-gray-400">
                0
              </span>
            </div>

            {/* 1 Star */}
            <div className="flex items-center gap-2 text-xs text-[#5c685f]">
              <div className="flex text-gray-300 text-[10px]">
                ★☆☆☆☆
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2e7d32] rounded-full w-[0%]" />
              </div>
              <span className="w-4 text-right text-[11px] text-gray-400">
                0
              </span>
            </div>
          </div>

          {/* Right: Write a Review Button */}
          <div className="md:col-span-3 flex justify-center md:justify-end">
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="bg-[#b1fc85] hover:bg-[#9ef56e] text-black font-semibold text-xs sm:text-sm px-7 py-3 rounded-full border border-black/85 shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Write a review
            </button>
          </div>

        </div>

        {/* Sort Trigger */}
        <div className="py-4 flex items-center justify-start text-xs font-semibold text-[#1b221d] cursor-pointer hover:text-[#52664d]">
          <span className="flex items-center gap-1">
            Most Recent <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-gray-200">
          {reviews.map((rev) => (
            <div key={rev.id} className="py-6 sm:py-7 space-y-2">

              {/* Star Rating */}
              <div className="flex text-[#2e7d32]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rev.rating
                        ? "fill-current text-[#2e7d32]"
                        : "text-gray-300"
                      }`}
                  />
                ))}
              </div>

              {/* Author Line */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2e7d32]">
                <User className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{rev.author}</span>
              </div>

              {/* Review Headline */}
              <h4 className="text-xs sm:text-[13.5px] font-bold text-[#1b221d] leading-snug">
                {rev.headline}
              </h4>

              {/* Review Text */}
              <p className="text-xs sm:text-[13px] text-[#4a554c] leading-relaxed font-normal">
                {rev.comment}
              </p>

            </div>
          ))}
        </div>

      </div>

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#1b221d] mb-4">
              Write a Review
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              {/* Rating selection */}
              <div>
                <label className="text-xs font-bold text-[#1b221d] block mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1 text-[#ffb400]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= newRating ? "fill-current" : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-[#1b221d] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#2e7d32]"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="text-xs font-bold text-[#1b221d] block mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Great results in 3 months"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#2e7d32]"
                />
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-bold text-[#1b221d] block mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#2e7d32]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2 text-xs font-semibold text-gray-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2d5236] hover:bg-[#22402a] text-white font-bold text-xs px-6 py-2.5 rounded-full cursor-pointer shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
