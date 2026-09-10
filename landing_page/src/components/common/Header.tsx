"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_ABOUT_LIST } from "@/data/qhtData";
import { useConsultation } from "@/context/ConsultationContext";
import TopOfferBanner from "./TopOfferBanner";
import { COMPANY_NAME } from "@/config/constants";
import type { ServiceCard } from "@/lib/services";

interface HeaderProps {
  onOpenConsultation?: () => void;
  initialServices?: ServiceCard[] | null;
}

interface HeaderBarProps {
  isSticky?: boolean;
  activeDropdown: string | null;
  onMouseEnter: (menu: string) => void;
  onMouseLeave: () => void;
  onCloseDropdown: () => void;
  onOpenConsultation: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  cliniUrl: string;
  services: ServiceCard[];
}

function HeaderBar({
  isSticky = false,
  activeDropdown,
  onMouseEnter,
  onMouseLeave,
  onCloseDropdown,
  onOpenConsultation,
  onToggleMobileMenu,
  isMobileMenuOpen,
  cliniUrl,
  services,
}: HeaderBarProps) {
  const serviceItems = services.map((s) => ({
    label: s.title,
    href: `/services/${s.slug}`,
  }));
  const half = Math.ceil(serviceItems.length / 2);
  const col1 = serviceItems.slice(0, half);
  const col2 = serviceItems.slice(half);

  return (
    <div className="w-full relative">
      <div className="qht-large-container flex items-center justify-between relative">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={onCloseDropdown}
          className="flex items-center gap-2 relative z-10 flex-shrink-0"
        >
          <img
            src="/images/logo3.png"
            alt={`${COMPANY_NAME} Clinic Logo`}
            className={`${isSticky ? "h-9 md:h-11" : "h-10 sm:h-12 md:h-13"} w-auto object-contain rounded-md transition-all duration-200`}
          />
        </Link>

        {/* Desktop Navigation Floating White Pill */}
        <div className="hidden lg:flex items-center bg-white rounded-xl md:rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/90 pl-7 pr-3 py-2.5 gap-6 xl:gap-8">
          <nav className="flex items-center gap-6 xl:gap-8 text-[14.5px] sm:text-[15px]">
            {/* Home */}
            <Link
              href="/"
              onClick={onCloseDropdown}
              className="font-semibold text-[#52664d] hover:text-[#384c3c] transition-colors"
            >
              Home
            </Link>

            {/* Results */}
            <Link
              href="/results"
              onClick={onCloseDropdown}
              className="font-medium text-[#2b302c] hover:text-[#52664d] transition-colors py-1"
            >
              Results
            </Link>

            {/* Services */}
            <div
              className="relative"
              onMouseEnter={() => onMouseEnter("services")}
              onMouseLeave={onMouseLeave}
            >
              <Link
                href="/services"
                onClick={onCloseDropdown}
                className="flex items-center gap-1.5 font-medium text-[#2b302c] hover:text-[#52664d] transition-colors py-1"
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${activeDropdown === "services" ? "rotate-180 text-[#52664d]" : ""
                    }`}
                />
              </Link>
            </div>

            {/* Hair Transplant Cost */}
            <Link
              href="/hair-transplant-cost-in-india"
              onClick={onCloseDropdown}
              className="font-medium text-[#2b302c] hover:text-[#52664d] transition-colors whitespace-nowrap"
            >
              Hair Transplant Cost
            </Link>

            {/* Medicines */}
            <a
              href={cliniUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onCloseDropdown}
              className="font-medium text-[#2b302c] hover:text-[#52664d] transition-colors"
            >
              Medicines
            </a>

            {/* About us */}
            <div
              className="relative"
              onMouseEnter={() => onMouseEnter("about")}
              onMouseLeave={onMouseLeave}
            >
              <button className="flex items-center gap-1.5 font-medium text-[#2b302c] hover:text-[#52664d] transition-colors py-1 cursor-pointer">
                <span>About us</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${activeDropdown === "about" ? "rotate-180 text-[#52664d]" : ""
                    }`}
                />
              </button>
            </div>

            {/* Our Clinic */}
            <Link
              href="/our-clinic"
              onClick={onCloseDropdown}
              className="font-medium text-[#2b302c] hover:text-[#52664d] transition-colors whitespace-nowrap"
            >
              Our Clinic
            </Link>
          </nav>

          {/* CTA Button: Book your surgery */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="bg-[#52664d] hover:bg-[#43543e] text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl md:rounded-2xl text-[14px] sm:text-[15px] font-bold transition-colors duration-200 shadow-md whitespace-nowrap ml-1"
          >
            Book your surgery
          </a>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#52664d] text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            Book Surgery
          </a>

          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Full-Width Animated Services Mega Dropdown */}
      <div
        onMouseEnter={() => onMouseEnter("services")}
        onMouseLeave={onMouseLeave}
        className={`absolute left-0 right-0 top-full transition-all duration-300 ease-out origin-top overflow-hidden z-50 px-4 md:px-6 lg:px-8 ${activeDropdown === "services"
          ? "max-h-[700px] opacity-100 pointer-events-auto pt-2 pb-6"
          : "max-h-0 opacity-0 pointer-events-none p-0"
          }`}
      >
        <div className="qht-large-container">
          <div className="bg-[#243527] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#344b38]">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Services
              </h3>
              <div className="flex-1 h-[1px] bg-white/15"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 bg-[#586d52] rounded-2xl p-6 sm:p-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                  <div className="space-y-3.5">
                    {col1.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onCloseDropdown}
                        className="flex items-center gap-2 text-[13.5px] font-medium text-white/95 hover:text-[#d7fbd0] hover:translate-x-1 transition-all duration-150 leading-tight group"
                      >
                        <ArrowUpRight className="w-4 h-4 text-white/80 group-hover:text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-3.5">
                    {col2.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onCloseDropdown}
                        className="flex items-center gap-2 text-[13.5px] font-medium text-white/95 hover:text-[#d7fbd0] hover:translate-x-1 transition-all duration-150 leading-tight group"
                      >
                        <ArrowUpRight className="w-4 h-4 text-white/80 group-hover:text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 relative rounded-2xl overflow-hidden min-h-[380px] flex flex-col justify-between p-7 bg-black shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                  alt="OT Hair Surgery"
                  className="absolute inset-0 w-full h-full object-cover object-center grayscale contrast-125 opacity-40 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>

                <div className="relative z-10">
                  <h4 className="text-2xl sm:text-[28px] font-bold text-white leading-tight tracking-tight">
                    let’s Start Your
                    <br />
                    Journey Today
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300 mt-4 leading-relaxed font-normal">
                    Restore your confidence with our expert-led hair transplant solutions.
                  </p>
                </div>

                <div className="relative z-10 pt-6">
                  <button
                    onClick={() => {
                      onCloseDropdown();
                      onOpenConsultation();
                    }}
                    className="bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm py-2.5 px-7 rounded-full shadow-lg transition-transform active:scale-95 duration-150 inline-block text-center cursor-pointer"
                  >
                    Start Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Animated About Us Mega Dropdown */}
      <div
        onMouseEnter={() => onMouseEnter("about")}
        onMouseLeave={onMouseLeave}
        className={`absolute left-0 right-0 top-full transition-all duration-300 ease-out origin-top overflow-hidden z-50 px-4 md:px-6 lg:px-8 ${activeDropdown === "about"
          ? "max-h-[700px] opacity-100 pointer-events-auto pt-2 pb-6"
          : "max-h-0 opacity-0 pointer-events-none p-0"
          }`}
      >
        <div className="qht-large-container">
          <div className="bg-[#243527] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#344b38]">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                About Us
              </h3>
              <div className="flex-1 h-[1px] bg-white/15"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {NAV_ABOUT_LIST.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onCloseDropdown}
                  className="group relative rounded-2xl overflow-hidden h-[260px] flex flex-col justify-between p-5 bg-black shadow-md border border-white/5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className="absolute inset-0 w-full h-full object-cover object-center grayscale contrast-125 opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>

                  <div className="relative z-10">
                    <h4 className="text-base sm:text-[17px] font-bold text-white leading-snug">
                      {item.label}
                    </h4>
                  </div>

                  <div className="relative z-10">
                    <div className="w-full bg-white group-hover:bg-gray-100 text-gray-900 font-semibold text-xs py-2 px-3.5 rounded-full flex items-center justify-between shadow-md transition-colors">
                      <span>Know More</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-normal leading-relaxed text-center sm:text-left">
                Regain your hair, rebuild confidence, and transform your life with expert hair restoration solutions tailored to your unique needs.
              </p>

              <button
                onClick={() => {
                  onCloseDropdown();
                  onOpenConsultation();
                }}
                className="bg-[#566c50] hover:bg-[#465b41] text-white text-sm font-semibold px-7 py-2.5 rounded-full shadow-md transition-all active:scale-95 whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header({ onOpenConsultation, initialServices }: HeaderProps) {
  const pathname = usePathname();
  const cliniUrl = process.env.NEXT_PUBLIC_CLINIC_URL || "#";
  const { openConsultation } = useConsultation();
  const handleOpenConsultation = onOpenConsultation || openConsultation;

  const [services, setServices] = useState<ServiceCard[]>(initialServices || []);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close any open dropdowns or mobile menu whenever route/page changes
  useEffect(() => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
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

  useEffect(() => {
    const handleScroll = () => {
      setIsStickyVisible(window.scrollY >= 320);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleCloseDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(null);
  };

  return (
    <>
      {/* 0. Top Announcement & Offer Banner */}
      <TopOfferBanner
        onOpenConsultation={handleOpenConsultation}
        onVisibilityChange={setIsBannerVisible}
      />

      {/* 1. Static Initial Header - Transparent overlay on every page */}
      <header
        className={`absolute left-0 right-0 z-40 bg-transparent pb-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isBannerVisible
          ? "top-[52px] sm:top-[54px] pt-4 sm:pt-6"
          : "top-0 pt-6 sm:pt-8"
          }`}
      >
        <HeaderBar
          isSticky={false}
          activeDropdown={!isStickyVisible ? activeDropdown : null}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onCloseDropdown={handleCloseDropdown}
          onOpenConsultation={handleOpenConsultation}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          cliniUrl={cliniUrl}
          services={services}
        />
      </header>

      {/* 2. Floating Sticky Header - Slides in smoothly from top on hero scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[#f4f7f4]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-b border-[#e5ebe5] py-2.5 transition-all duration-300 ease-out ${isStickyVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <HeaderBar
          isSticky={true}
          activeDropdown={isStickyVisible ? activeDropdown : null}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onCloseDropdown={handleCloseDropdown}
          onOpenConsultation={handleOpenConsultation}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          cliniUrl={cliniUrl}
          services={services}
        />
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <img
                src="/images/logo3.png"
                alt="Logo"
                className="h-9 w-auto object-contain rounded-md"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="py-6 space-y-4 flex-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#627566]"
              >
                Home
              </Link>

              <Link
                href="/results"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-semibold text-gray-800"
              >
                Results
              </Link>

              <div>
                <button
                  onClick={() =>
                    setMobileSubmenu(
                      mobileSubmenu === "services" ? null : "services"
                    )
                  }
                  className="w-full flex items-center justify-between text-base font-semibold text-gray-800 py-1"
                >
                  <span>Services</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${mobileSubmenu === "services" ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {mobileSubmenu === "services" && (
                  <div className="pl-4 pt-2 space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
                    <Link
                      href="/services"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-1 font-semibold text-[#1b392b]"
                    >
                      View All Services →
                    </Link>
                    {services.map((srv) => (
                      <Link
                        key={srv.slug}
                        href={`/services/${srv.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1"
                      >
                        {srv.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/hair-transplant-cost-in-india"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-semibold text-gray-800"
              >
                Hair Transplant Cost
              </Link>

              <a
                href={cliniUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-base font-semibold text-gray-800"
              >
                Medicines
              </a>

              <div>
                <button
                  onClick={() =>
                    setMobileSubmenu(
                      mobileSubmenu === "about" ? null : "about"
                    )
                  }
                  className="w-full flex items-center justify-between text-base font-semibold text-gray-800 py-1"
                >
                  <span>About us</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${mobileSubmenu === "about" ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {mobileSubmenu === "about" && (
                  <div className="pl-4 pt-2 space-y-2 text-sm text-gray-600">
                    {NAV_ABOUT_LIST.map((ab, idx) => (
                      <a key={idx} href={ab.href} className="block py-1">
                        {ab.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/our-clinic/"
                className="block text-base font-semibold text-gray-800"
              >
                Our Clinic
              </a>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <a
                href="https://pages.razorpay.com/pl_R9xTz14IIPBGyE/view"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 block text-center bg-[#596d53] text-white rounded-xl font-bold text-sm"
              >
                Book your surgery
              </a>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenConsultation();
                }}
                className="w-full py-2.5 border border-[#1b392b] text-[#1b392b] rounded-xl font-bold text-sm"
              >
                Book Free Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
