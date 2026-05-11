"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestStore {
  guestToken: string | null;
  setGuestToken: (t: string | null) => void;
}

export const useGuestStore = create(
  persist<GuestStore>(
    (set) => ({
      guestToken: null,
      setGuestToken: (t) => set({ guestToken: t }),
    }),
    { name: "syntraa_guest_cart" }
  )
);
