"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { OfferBannerConfig, STATIC_OFFER } from "@/config/offer";
import { fetchActiveOffer } from "@/lib/offers";

interface OfferContextType {
  offer: OfferBannerConfig;
  refreshOffer: () => Promise<void>;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

export function OfferProvider({
  children,
  initialOffer = STATIC_OFFER,
}: {
  children: ReactNode;
  initialOffer?: OfferBannerConfig;
}) {
  const [offer, setOffer] = useState<OfferBannerConfig>(initialOffer);

  const refreshOffer = async () => {
    try {
      const active = await fetchActiveOffer();
      setOffer(active);
    } catch {
      // Keep existing state
    }
  };

  useEffect(() => {
    // If initialOffer wasn't passed or to ensure client-fresh state on mount
    refreshOffer();
  }, []);

  return (
    <OfferContext.Provider value={{ offer, refreshOffer }}>
      {children}
    </OfferContext.Provider>
  );
}

export function useOffer(): OfferBannerConfig {
  const context = useContext(OfferContext);
  if (!context) {
    return STATIC_OFFER;
  }
  return context.offer;
}
