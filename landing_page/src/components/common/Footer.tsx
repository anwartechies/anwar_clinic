"use client";

import React from "react";
import Link from "next/link";
import { useConsultation } from "@/context/ConsultationContext";
import { COMPANY_NAME, CLINIC_PHONE, CLINIC_EMAIL } from "@/config/constants";
import type { ServiceCard } from "@/lib/services";

interface FooterProps {
  onOpenConsultation?: () => void;
  initialServices?: ServiceCard[] | null;
}

export default function Footer({ onOpenConsultation, initialServices }: FooterProps) {
  const { openConsultation } = useConsultation();
  const handleOpenConsultation = onOpenConsultation || openConsultation;
  const currentYear = new Date().getFullYear();

  const [services, setServices] = React.useState<ServiceCard[]>(initialServices || []);

  React.useEffect(() => {
    if (initialServices && initialServices.length > 0) {
      setServices(initialServices);
    } else {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      fetch(`${apiUrl}/public/services`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setServices(data);
        })
        .catch(() => { });
    }
  }, [initialServices]);

  const serviceItems = services.map((s) => ({
    label: s.title,
    href: `/services/${s.slug}`,
  }));
  const half = Math.ceil(serviceItems.length / 2);
  const col1 = serviceItems.slice(0, half);
  const col2 = serviceItems.slice(half);

  return (
    <footer className="bg-[#3b493a] text-white pt-16 pb-14">
      <div className="qht-large-container">
        {/* Main Grid: Sticky Left Branch Info + Right Links Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Sticky on Scroll, Logo, Branch Addresses, Contact & Book Surgery */}
          <div className="lg:col-span-4 space-y-5 text-sm sm:text-[15px] text-[#cdd7cb] lg:sticky lg:top-24 lg:self-start">
            {/* Logo */}
            <Link href="/" className="inline-block mb-3">
              <img
                src="/images/logo3.png"
                alt={`${COMPANY_NAME} Clinic Logo`}
                className="h-11 md:h-12 w-auto object-contain rounded-md"
              />
            </Link>

            {/* Main Clinic Center */}
            <div className="pt-1 pb-4 border-b border-white/10">
              <span className="inline-block bg-white/10 text-white font-semibold text-xs px-3 py-1 rounded border border-white/15 mb-2.5">
                Main Clinic Branch
              </span>
              <p className="font-bold text-white text-base">
                {COMPANY_NAME}
              </p>
              <p className="leading-relaxed text-xs sm:text-sm text-[#cdd7cb] mt-1.5">
                Vishal Residency Wing-1, Pillar No-56, Raja Bazar, Patna, Bihar 800014
              </p>

              {/* Embedded Google Maps View */}
              <div className="mt-3 w-full h-36 rounded-xl overflow-hidden border border-white/15 shadow-inner">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2806.264183401463!2d85.0827563740967!3d25.604422915088595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed57924bf8c993%3A0xc9a79dda2a64c183!2sNEXGEN%20HAIR%20TRANSPLANT!5e1!3m2!1sen!2sin!4v1789286019174!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={`${COMPANY_NAME} Google Maps Location`}
                  className="w-full h-full"
                />
              </div>

              <a
                href="https://www.google.com/maps/place/NEXGEN+HAIR+TRANSPLANT/@25.6044229,85.0827564,17z"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#baf788] hover:underline font-medium mt-3"
              >
                <span>Get Directions on Google Maps →</span>
              </a>
            </div>

            {/* Second Clinic Center - Mumbai */}
            <div className="pt-1 pb-4 border-b border-white/10">
              <span className="inline-block bg-white/10 text-white font-semibold text-xs px-3 py-1 rounded border border-white/15 mb-2.5">
                Second Branch
              </span>
              <p className="font-bold text-white text-base">
                {COMPANY_NAME} Mumbai
              </p>
              <p className="leading-relaxed text-xs sm:text-sm text-[#cdd7cb] mt-1.5">
                Bandra West / Andheri, Mumbai, Maharashtra
              </p>
              <a
                href="https://maps.google.com/?q=Mumbai+Maharashtra"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#baf788] hover:underline font-medium mt-2"
              >
                <span>View on Google Maps →</span>
              </a>
            </div>

            {/* Phone & Email Row */}
            <div className="flex items-center justify-between pt-2 text-sm sm:text-[15px] font-medium text-white">
              <a
                href={`tel:${CLINIC_PHONE.replace(/[^0-9+]/g, "")}`}
                className="hover:text-[#baf788] transition-colors"
              >
                {CLINIC_PHONE}
              </a>
              <a
                href={`mailto:${CLINIC_EMAIL}`}
                className="hover:text-[#baf788] transition-colors"
              >
                {CLINIC_EMAIL}
              </a>
            </div>

            {/* Book Your Surgery Button */}
            <div className="pt-2">
              <a
                href="https://pages.razorpay.com/pl_R9xTz14IIPBGyE/view"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#596d53] hover:bg-[#495c44] text-white font-semibold text-sm py-2.5 px-7 rounded-full shadow-sm transition-colors"
              >
                Book your Surgery
              </a>
            </div>
          </div>

          {/* Right Column: Company Links, Our Services, In Your City */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Company Links */}
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-4 tracking-tight">
                Company Links
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-[15px] text-[#cdd7cb]">
                <div className="space-y-3">
                  <p><Link href="/about" className="hover:text-white transition-colors">About us</Link></p>
                  <p><Link href="/results" className="hover:text-white transition-colors">Results</Link></p>
                  <p><Link href="/medical-tourism" className="hover:text-white transition-colors">Medical Tourism</Link></p>
                  <p><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></p>
                </div>
                <div className="space-y-3">
                  <p><Link href="/hair-transplant-cost-in-india" className="hover:text-white transition-colors">Hair Transplant Cost</Link></p>
                  <p><Link href="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></p>
                  <p><Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link></p>
                  <p><Link href="/career" className="hover:text-white transition-colors">Career</Link></p>
                </div>
              </div>
            </div>

            <div className="border-b border-white/15" />

            {/* 2. Our Services */}
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-4 tracking-tight">
                Our Services
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-[15px] text-[#cdd7cb]">
                <div className="space-y-3">
                  {col1.map((item, idx) => (
                    <p key={idx}>
                      <Link href={item.href} className="hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    </p>
                  ))}
                </div>
                <div className="space-y-3">
                  {col2.map((item, idx) => (
                    <p key={idx}>
                      <Link href={item.href} className="hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-b border-white/15" />

            {/* 3. In Your City */}
            {/* <div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-4 tracking-tight">
                In Your City
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-[15px] text-[#cdd7cb]">
                <div className="space-y-3">
                  <p><Link href="/delhi/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Delhi</Link></p>
                  <p><Link href="/bangalore/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Bangalore</Link></p>
                  <p><Link href="/chennai/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Chennai</Link></p>
                  <p><Link href="/ghaziabad/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Ghaziabad</Link></p>
                  <p><Link href="/guwahati/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Guwahati</Link></p>
                  <p><Link href="/hyderabad/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Hyderabad</Link></p>
                  <p><Link href="/jaipur/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Jaipur</Link></p>
                  <p><Link href="/kolkata/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Kolkata</Link></p>
                  <p><Link href="/mumbai/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Mumbai</Link></p>
                  <p><Link href="/noida/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Noida</Link></p>
                  <p><Link href="/pune/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Pune</Link></p>
                </div>
                <div className="space-y-3">
                  <p><Link href="/ahmedabad/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Ahmedabad</Link></p>
                  <p><Link href="/chandigarh/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Chandigarh</Link></p>
                  <p><Link href="/dehradun/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Dehradun</Link></p>
                  <p><Link href="/gurgaon/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Gurgaon</Link></p>
                  <p><Link href="/haridwar/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Haridwar</Link></p>
                  <p><Link href="/indore/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Indore</Link></p>
                  <p><Link href="/kochi/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Kochi</Link></p>
                  <p><Link href="/lucknow/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Lucknow</Link></p>
                  <p><Link href="/nagpur/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Nagpur</Link></p>
                  <p><Link href="/patna/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Patna</Link></p>
                  <p><Link href="/surat/hair-transplant" className="hover:text-white transition-colors">Hair Transplant in Surat</Link></p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Full-Width Line + Copyright & Appointment CTA */}
        <div className="border-t border-white/15 pt-8 mt-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-[#cdd7cb] font-normal">
            © {currentYear} {COMPANY_NAME} Regrow Hair |{" "}
            <Link href="/privacy-policy" className="hover:text-white underline">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link href="/terms-conditions" className="hover:text-white underline">
              Terms & Conditions
            </Link>
          </p>

          <button
            onClick={handleOpenConsultation}
            className="bg-[#596d53] hover:bg-[#495c44] text-white font-semibold text-sm py-3 px-8 rounded-full shadow-sm transition-colors"
          >
            Book an Appointment
          </button>
        </div>
      </div>
    </footer>
  );
}
