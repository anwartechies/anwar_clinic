"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface JourneyVideo {
  id: number;
  title: string;
  channel: string;
  youtubeId: string;
  thumbnail: string;
}

const COST_JOURNEY_VIDEOS: JourneyVideo[] = [
  {
    id: 1,
    title: "Hair Transplant Results | Best Hair Transplant in Patna",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "g0gOySSmaYg",
    thumbnail: "https://i.ytimg.com/vi/g0gOySSmaYg/hqdefault.jpg",
  },
  {
    id: 2,
    title: "New Hair, New Confidence | Transform Your Look & Say Goodbye to Baldness",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "2Dtm3lRxpg4",
    thumbnail: "https://i.ytimg.com/vi/2Dtm3lRxpg4/hqdefault.jpg",
  },
  {
    id: 3,
    title: `${COMPANY_NAME} Hair Transplant Clinic | Patient Experience & Results`,
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "l1zjtt4n92Q",
    thumbnail: "https://i.ytimg.com/vi/l1zjtt4n92Q/hqdefault.jpg",
  },
  {
    id: 4,
    title: `Hair Loss Solution & Baldness Treatment | ${COMPANY_NAME} Hair Transplant`,
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "je50o_PRQV8",
    thumbnail: "https://i.ytimg.com/vi/je50o_PRQV8/hqdefault.jpg",
  },
  {
    id: 5,
    title: `Natural Hair Restoration & Density | ${COMPANY_NAME} Hair Transplant`,
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "74GLSc0tbmE",
    thumbnail: "https://i.ytimg.com/vi/74GLSc0tbmE/hqdefault.jpg",
  },
  {
    id: 6,
    title: `Real Results | Honest Patient Experience at ${COMPANY_NAME} Hair Transplant`,
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "jfqv22Re2pI",
    thumbnail: "https://i.ytimg.com/vi/jfqv22Re2pI/hqdefault.jpg",
  },
];

function VideoCard({ video }: { video: JourneyVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-lg border border-gray-100/80 group">
      {isPlaying ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <div
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full cursor-pointer overflow-hidden select-none"
        >
          {/* Video Thumbnail */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Video Header Bar (Mimicking YouTube Player Top Bar) */}
          <div className="absolute inset-x-0 top-0 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-start gap-2.5 pointer-events-none">
            <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
              {COMPANY_NAME}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-sm leading-snug">
                {video.title}
              </h4>
              <span className="text-[10px] text-white/80 block">
                {video.channel}
              </span>
            </div>
          </div>

          {/* Dark Overlay on Hover */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

          {/* Red YouTube Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-9 sm:w-16 sm:h-11 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-red-700 transition-all duration-200">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Watch on YouTube Bottom Badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 pointer-events-none">
            <span>Watch on</span>
            <span className="font-bold text-red-500">YouTube</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CostVideoJourneySection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        {/* Heading */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.14]">
            Watch The Incredible Journey & <br />
            Transformation.
          </h2>
        </div>

        {/* 6 Video Cards Grid (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {COST_JOURNEY_VIDEOS.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

      </div>
    </section>
  );
}
