import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionUser {
  id: number;
  fullName: string;
  role: string;
}

interface SessionState {
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  cartItemCount: number;
  setSession: (session: {
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setAccessToken: (accessToken: string) => void;
  setCartItemCount: (count: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      cartItemCount: 0,
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setCartItemCount: (cartItemCount) => set({ cartItemCount }),
      clearSession: () =>
        set({ user: null, accessToken: null, refreshToken: null, cartItemCount: 0 }),
    }),
    { name: "shophub-session", partialize: (state) => ({ ...state, cartItemCount: 0 }) },
  ),
);
