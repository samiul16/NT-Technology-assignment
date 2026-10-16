import { create } from "zustand";
import type { AuthUser, AuthResponse } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;

  checkAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

async function authRequest(
  endpoint: string,
  method: "GET" | "POST",
  body?: Record<string, string>
): Promise<AuthResponse> {
  const response = await fetch(endpoint, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = (await response.json()) as AuthResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,

  checkAuth: async () => {
    try {
      const result = await authRequest("/api/auth/me", "GET");

      set({
        user: result.user ?? null,
        isAuthenticated: Boolean(result.user),
      });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ initialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });

    try {
      const result = await authRequest("/api/auth/signin", "POST", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.user) {
        throw new Error("The server did not return user details.");
      }

      set({
        user: result.user,
        isAuthenticated: true,
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true });

    try {
      const result = await authRequest("/api/auth/signup", "POST", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.user) {
        throw new Error("The server did not return user details.");
      }

      set({
        user: result.user,
        isAuthenticated: true,
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await authRequest("/api/auth/signout", "POST", {});
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        initialized: true,
        isLoading: false,
      });
    }
  },
}));
