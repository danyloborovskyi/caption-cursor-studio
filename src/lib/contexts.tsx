"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  getCurrentUser as apiGetCurrentUser,
  logout as apiLogout,
} from "@/lib/api";

// =====================
// Gallery Context
// =====================

interface GalleryContextType {
  refreshTrigger: number;
  refreshGallery: () => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshGallery = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <GalleryContext.Provider
      value={{
        refreshTrigger,
        refreshGallery,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
};

// =====================
// Auth Context
// =====================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Ensure we're on the client side
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_data");

      // Only restore user if we have BOTH token and user_data
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse stored user data:", e);
          localStorage.removeItem("user_data");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Verify token with backend in the background
        const response = await apiGetCurrentUser();

        if (response.success && response.data?.user) {
          // Update user data if backend returns newer data
          setUser(response.data.user);
          localStorage.setItem("user_data", JSON.stringify(response.data.user));
        } else {
          // Only clear on authentication errors (400, 401, 403)
          const status = (response as { status?: number }).status;

          if (status === 400 || status === 401 || status === 403) {
            // Token is invalid, clear everything
            console.log("Token expired or invalid, clearing auth data");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_data");
            setUser(null);

            // Redirect to home page if not already there
            if (
              typeof window !== "undefined" &&
              window.location.pathname !== "/"
            ) {
              window.location.href = "/";
            }
          }
          // On other errors, keep the user logged in with cached data
        }
      } else if (token && !storedUser) {
        // Has token but no cached user data - fetch from backend
        const response = await apiGetCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem("user_data", JSON.stringify(response.data.user));
        } else {
          // Token is invalid, clear it
          console.log("Token invalid, clearing auth data");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");

          // Redirect to home page
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/"
          ) {
            window.location.href = "/";
          }
        }
      } else if (!token && storedUser) {
        // No token but has cached user data - clear the stale data
        localStorage.removeItem("user_data");
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);

    // Store user data for persistence across reloads
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  };

  const logout = async () => {
    await apiLogout();

    // Clear user data on client side only
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_data");
    }

    setUser(null);
  };

  const refreshUser = async () => {
    const response = await apiGetCurrentUser();
    if (response.success && response.data?.user) {
      setUser(response.data.user);

      // Store user data on client side only
      if (typeof window !== "undefined") {
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
