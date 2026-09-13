import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "NexGen Hair Care & Clinical Medicines | Official Store",
  description:
    "Explore clinical hair care formulations, post-transplant care serums, natural growth oils, and dermatologist-recommended hair restoration products by NexGen Hair Clinic.",
  icons: {
    icon: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/logo1-mtznnfev83t5nb.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8faf8] text-[#1b221d] min-h-screen flex flex-col">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
