"use client";

import React from "react";

import { COMPANY_NAME } from "@/config/constants";

export default function ImagePoster() {
  return (
    <section className="bg-white py-6 overflow-hidden">
      <div className="qht-large-container">
        <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-2-10-57-pm-mu16ng7ufd4rtc.jpeg"
            />
            <img
              src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-2-10-57-pm-mu16ng7ufd4rtc.jpeg"
              alt={`${COMPANY_NAME} Clinic Excellence Poster`}
              className="w-full h-auto object-cover block"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
