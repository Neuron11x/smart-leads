import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: (user: User) => void; // Restore user info after page refresh
}

// Zustand store - simple global state (like a mini Redux)
export const useAuthStore = create<AuthState>((set) => ({
  // Initialize from localStorage so user stays logged in on refresh
  user: (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  setAuth: (user, token) => {
    localStorage.setItem("token", token); // Persist token
    localStorage.setItem("user", JSON.stringify(user)); // Persist user
    set({ user, token, isAuthenticated: true });
  },

  hydrate: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
