import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import FloatingActionBar from "@/components/common/FloatingActionBar";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { ConsultationProvider } from "@/context/ConsultationContext";
import { COMPANY_NAME } from "@/config/constants";

import { fetchServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Best Hair Transplant Clinic In India | ${COMPANY_NAME} Clinic`,
  description: `Discover India’s leading hair-transplant clinic. Advanced ${COMPANY_NAME} technique & 15,000+ results. Book now.`,
  keywords: `hair transplant India, ${COMPANY_NAME} clinic, best hair transplant Delhi, hair restoration, FUE hair transplant, celebrity hair transplant India`,
  openGraph: {
    title: `Best Hair Transplant Clinic In India | ${COMPANY_NAME} Clinic`,
    description: `Discover India’s leading hair-transplant clinic. Advanced ${COMPANY_NAME} technique & 15,000+ results. Book now.`,
    url: "/",
    siteName: `${COMPANY_NAME} Clinic`,
    images: [
      {
        url: "/images/logo1.png",
        width: 900,
        height: 560,
        alt: `${COMPANY_NAME} Clinic Hair Restoration`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/images/logo1.png",
    apple:
      "/images/logo1.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const services = await fetchServices();

  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-white selection:bg-[#1b392b] selection:text-white">
        <ConsultationProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <Header initialServices={services} />
            <main className="flex-grow">{children}</main>
            <Footer initialServices={services} />
            <FloatingActionBar />
          </div>

          <WhatsAppButton />
        </ConsultationProvider>
      </body>
    </html>
  );
}
