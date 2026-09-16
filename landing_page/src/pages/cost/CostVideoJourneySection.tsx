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
    title: "Rajpal Yadav | Bollywood Actor Hair Transplant Journey",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "8Z0B660p7nU",
    thumbnail: "https://www.qhtclinic.com/wp-content/uploads/2025/08/sd-why-us-thumb.webp",
  },
  {
    id: 2,
    title: "FUE Hair Transplant Results | DAYA's FUE Hair Transplant 21-Days Review",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "WJ5c2z4kZGE",
    thumbnail: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Puneet-Chandra-Grade-6-Post.webp",
  },
  {
    id: 3,
    title: "Hair Transplant in Mumbai (HX-LMAP) | Completely Hair Transplant",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "rK47G9_908Q",
    thumbnail: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Praveen-Kumar-Grade-Bangalore-DHI-Post.webp",
  },
  {
    id: 4,
    title: "Hair Transplant in Indore | 2 PATIENTS AMAZING RESULTS",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "_7sxUwnt5UA",
    thumbnail: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Irfan-Uttar-Pradesh-Grade-5A-Post.webp",
  },
  {
    id: 5,
    title: "Hair Transplant in Ahmedabad | Best Results & High Density",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "_N3b69JjCpI",
    thumbnail: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Kshitij-Ahuja-Jabalpur-Grade-4-Post.webp",
  },
  {
    id: 6,
    title: "Hair Transplant in Dehradun | Best Results & Real Transformation",
    channel: `${COMPANY_NAME} Hair Transplant Clinic`,
    youtubeId: "kk4TGEmal3Q",
    thumbnail: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Sagar-Kumar-Grade-4A-Post.webp",
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
