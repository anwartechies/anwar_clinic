"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import ConsultationModal from "@/components/common/ConsultationModal";
import { OFFER_PAGE_PATH } from "@/config/offer";

/** Why the modal is open — decides what happens after a successful submit. */
export type ConsultationIntent = "consultation" | "offer";

interface ConsultationContextType {
  isConsultationOpen: boolean;
  openConsultation: () => void;
  /** Opens the modal for the banner offer; success redirects to /offer. */
  claimOffer: () => void;
  closeConsultation: () => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [intent, setIntent] = useState<ConsultationIntent>("consultation");

  // Read inside the timers below, which are set up once on mount.
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  // The offer page already is the offer — never auto-pop the generic modal over
  // it (e.g. after refreshing a claimed confirmation). Buttons still open it.
  const shouldAutoOpen = () => !pathnameRef.current?.startsWith(OFFER_PAGE_PATH);

  // Takes no arguments on purpose: many buttons pass it straight to onClick,
  // so any parameter would receive the click event.
  const openConsultation = () => {
    setIntent("consultation");
    setIsConsultationOpen(true);
  };
  const claimOffer = () => {
    setIntent("offer");
    setIsConsultationOpen(true);
  };
  const closeConsultation = () => {
    setIsConsultationOpen(false);
    setIntent("consultation");
  };

  // Auto-open on initial website load and recurring every 1 minute (60 seconds)
  useEffect(() => {
    // 1. Open on website initial load (slight delay for hydration smoothness)
    // These only flip visibility and never touch intent: a closed modal is
    // always back in "consultation" mode (closeConsultation resets it), and
    // re-opening an already-open offer claim is a no-op that keeps its intent.
    const initialLoadTimer = setTimeout(() => {
      if (shouldAutoOpen()) setIsConsultationOpen(true);
    }, 1000);

    // 2. Open recurringly every 1 minute
    const intervalTimer = setInterval(() => {
      if (shouldAutoOpen()) setIsConsultationOpen(true);
    }, 600000); // 60,000ms = 1 min

    return () => {
      clearTimeout(initialLoadTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  return (
    <ConsultationContext.Provider
      value={{
        isConsultationOpen,
        openConsultation,
        claimOffer,
        closeConsultation,
      }}
    >
      {children}
      <ConsultationModal
        isOpen={isConsultationOpen}
        intent={intent}
        onClose={closeConsultation}
      />
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (!context) {
    return {
      isConsultationOpen: false,
      openConsultation: () => { },
      claimOffer: () => { },
      closeConsultation: () => { },
    };
  }
  return context;
}
