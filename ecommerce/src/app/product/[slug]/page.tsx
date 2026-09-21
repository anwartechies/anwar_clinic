import React from "react";
import Header from "@/components/Header";
import ProductDetailHero from "@/components/ProductDetailHero";
import WhatsInsideKitSection from "@/components/WhatsInsideKitSection";
import KeyBenefitsSection from "@/components/KeyBenefitsSection";
import HowToUseSection from "@/components/HowToUseSection";
import RealResultsVideoSection from "@/components/RealResultsVideoSection";
import ClinicalStudiesSection from "@/components/ClinicalStudiesSection";
import BackedByExpertsSection from "@/components/BackedByExpertsSection";
import CustomerReviewsSection from "@/components/CustomerReviewsSection";
import ProductFAQSection from "@/components/ProductFAQSection";
import StickyProductBottomBar from "@/components/StickyProductBottomBar";
import { fetchProduct, fetchProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product } = await fetchProduct(params.slug);
  if (!product) {
    return {
      title: "Product Not Found | NexGen Hair Transplant Clinic",
    };
  }
  return {
    title: product.seoTitle || `${product.name} | NexGen Hair Transplant Clinic`,
    description: product.seoDescription || product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { product } = await fetchProduct(params.slug);
  if (!product) {
    notFound();
  }

  const sections = product.sections || {};
  const hidden: string[] = product.hiddenSections || [];

  const isHidden = (key: string) => hidden.includes(key);

  // USER'S EXPLICIT RULE:
  // "if it is a kit then only show inside kit but if it is a single product then dont show"
  const isKit = product.isKit ?? (product.category === "Kits & Combos");
  const showWhatsInside = isKit && !isHidden("whatsInside");

  return (
    <div className="min-h-screen bg-[#eff5f1] flex flex-col antialiased">
      <Header />
      <main className="flex-1">
        <ProductDetailHero product={product} />

        {/* What's Inside Kit: Shown ONLY for kits & combos; hidden for single products */}
        {showWhatsInside && (
          <WhatsInsideKitSection
            items={sections.whatsInside?.items}
          />
        )}

        {!isHidden("keyBenefits") && (
          <KeyBenefitsSection
            benefits={sections.keyBenefits?.benefits}
            image={sections.keyBenefits?.image}
          />
        )}

        {!isHidden("howToUse") && (
          <HowToUseSection
            routines={sections.howToUse?.routines}
            image={sections.howToUse?.image}
          />
        )}

        {!isHidden("realResultsVideo") && <RealResultsVideoSection />}
        {!isHidden("clinicalStudies") && <ClinicalStudiesSection />}
        {!isHidden("backedByExperts") && <BackedByExpertsSection />}
        {!isHidden("customerReviews") && <CustomerReviewsSection />}

        {!isHidden("faqs") && (
          <ProductFAQSection
            items={sections.faqs?.items}
            title={sections.faqs?.title}
            subtitle={sections.faqs?.subtitle}
          />
        )}
      </main>

      {/* Sticky Bottom Bar on Scroll */}
      <StickyProductBottomBar product={product} />
    </div>
  );
}
