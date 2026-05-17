import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refresh: string | null;
  user: any | null;
  setAuth: (token: string, refresh: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refresh: null,
      user: null,
      setAuth: (token, refresh, user) => set({ token, refresh, user }),
      logout: () => set({ token: null, refresh: null, user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
