"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FileItem,
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
  addNewPhotos: (photos: FileItem[]) => void;
  newPhotos: FileItem[];
  clearNewPhotos: () => void;
  removePhoto: (photoId: number) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newPhotos, setNewPhotos] = useState<FileItem[]>([]);

  const refreshGallery = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const addNewPhotos = (photos: FileItem[]) => {
    setNewPhotos((prev) => {
      // Filter out duplicates based on filename and size to prevent duplicates
      const existingIds = new Set(
        prev.map((p) => `${p.filename}-${p.file_size}`)
      );
      const uniqueNewPhotos = photos.filter(
        (p) => !existingIds.has(`${p.filename}-${p.file_size}`)
      );
      return [...uniqueNewPhotos, ...prev];
    });

    // Auto-clear new photos after 30 seconds to prevent stale data
    setTimeout(() => {
      setNewPhotos((prev) => {
        const photosToRemove = new Set(photos.map((p) => p.id));
        return prev.filter((p) => !photosToRemove.has(p.id));
      });
    }, 30000);
  };

  const clearNewPhotos = () => {
    setNewPhotos([]);
  };

  const removePhoto = (photoId: number) => {
    setNewPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  return (
    <GalleryContext.Provider
      value={{
        refreshTrigger,
        refreshGallery,
        addNewPhotos,
        newPhotos,
        clearNewPhotos,
        removePhoto,
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

      console.log("AuthProvider: checkAuth started");
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_data");
      console.log(
        "AuthProvider: token exists:",
        !!token,
        "user_data exists:",
        !!storedUser
      );

      // Only restore user if we have BOTH token and user_data
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log(
            "AuthProvider: Restored user from localStorage:",
            parsedUser.email
          );
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
        console.log("AuthProvider: Verifying token with backend...");
        const response = await apiGetCurrentUser();
        console.log("AuthProvider: Token verification response:", response);

        if (response.success && response.data?.user) {
          // Update user data if backend returns newer data
          console.log("AuthProvider: Token valid, user verified");
          setUser(response.data.user);
          localStorage.setItem("user_data", JSON.stringify(response.data.user));
        } else {
          // Only clear on authentication errors (401, 403)
          const status = (response as { status?: number }).status;
          console.log(
            "AuthProvider: Token verification failed, status:",
            status
          );

          if (status === 401 || status === 403) {
            // Token is invalid, clear everything
            console.error("AuthProvider: Token invalid (401/403), logging out");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_data");
            setUser(null);
          } else {
            // On other errors, keep the user logged in with cached data
            console.log(
              "AuthProvider: Non-auth error, keeping user logged in with cached data"
            );
          }
        }
      } else if (token && !storedUser) {
        // Has token but no cached user data - fetch from backend
        console.log(
          "AuthProvider: Token exists but no user_data, fetching from backend"
        );
        const response = await apiGetCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem("user_data", JSON.stringify(response.data.user));
        } else {
          // Token is invalid, clear it
          console.log("AuthProvider: Failed to fetch user, clearing token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } else if (!token && storedUser) {
        // No token but has cached user data - clear the stale data
        console.log(
          "AuthProvider: No token but user_data exists, clearing stale data"
        );
        localStorage.removeItem("user_data");
        setUser(null);
      }

      console.log("AuthProvider: checkAuth completed");
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
    localStorage.removeItem("user_data");
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await apiGetCurrentUser();
    if (response.success && response.data?.user) {
      setUser(response.data.user);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
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
