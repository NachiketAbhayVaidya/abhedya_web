import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  status: "idle", // idle | loading | authenticated | unauthenticated
  setSession: (user, profile = null) => set({ user, profile, status: "authenticated" }),
  clearSession: () => set({ user: null, profile: null, status: "unauthenticated" }),
  setStatus: (status) => set({ status }),
}));
