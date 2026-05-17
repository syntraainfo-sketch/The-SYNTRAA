"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestStore {
  guestToken: string | null;
  hasHydrated: boolean;
  setGuestToken: (t: string | null) => void;
  setHasHydrated: (v: boolean) => void;
}

type GuestPersist = Pick<GuestStore, "guestToken">;

export const useGuestStore = create(
  persist<GuestStore, [], [], GuestPersist>(
    (set) => ({
      guestToken: null,
      hasHydrated: false,
      setGuestToken: (t) => set({ guestToken: t }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "syntraa_guest_cart",
      partialize: (state) => ({ guestToken: state.guestToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
