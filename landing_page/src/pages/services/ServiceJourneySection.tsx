"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";

interface JourneyVideo {
  id?: number;
  title: string;
  youtubeId: string;
  thumbnail?: string;
}

interface ServiceJourneySectionProps {
  title?: string;
  videos?: JourneyVideo[];
}

// User can easily swap or add links here
const DEFAULT_VIDEOS: JourneyVideo[] = [
  {
    id: 1,
    title: "Hair Transplant in Pune | Best Results & Cost",
    youtubeId: "kk4TGEmal3Q",
  },
  {
    id: 2,
    title: "Hair Transplant in Istanbul | Repair Case",
    youtubeId: "_N3b69JjCpI",
  },
  {
    id: 3,
    title: "Hair Transplant in Trivandrum | 8 Months Result",
    youtubeId: "_7sxUwnt5UA",
  },
  {
    id: 4,
    title: "Hair Transplant in Greater Noida | Best Results",
    youtubeId: "rK47G9_908Q",
  },
  {
    id: 5,
    title: "Hair Transplant in Varanasi | 3800 Grafts Bad Hair Transplant Repair",
    youtubeId: "WJ5c2z4kZGE",
  },
  {
    id: 6,
    title: "Hair Transplant in Sambhaji Nagar | Failed Hair Transplant Repair",
    youtubeId: "8Z0B660p7nU",
  },
];

function VideoCard({ video }: { video: JourneyVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-md border border-gray-100 group">
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
          className="relative w-full h-full cursor-pointer overflow-hidden"
        >
          {/* YouTube HQ Thumbnail */}
          <img
            src={
              video.thumbnail ||
              `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
            }
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to placeholder
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80";
            }}
          />

          {/* Top Gradient & Title Bar Overlay */}
          <div className="absolute inset-x-0 top-0 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-sm">
              {video.title}
            </h4>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

          {/* Big Red YouTube Play Button Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-10 sm:w-16 sm:h-11 bg-[#ff0000] rounded-xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Bottom YouTube Label */}
          <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90 font-medium pointer-events-none">
            Watch on <span className="font-bold text-white">YouTube</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiceJourneySection({
  title = "Watch The Incredible Journey &\nTransformation.",
  videos = DEFAULT_VIDEOS,
}: ServiceJourneySectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-large-container">
        
        {/* Section Heading */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18] whitespace-pre-line">
            {title}
          </h2>
        </div>

        {/* 3-Column Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {videos.map((video, idx) => (
            <VideoCard key={video.id ?? video.youtubeId ?? idx} video={video} />
          ))}
        </div>

      </div>
    </section>
  );
}
