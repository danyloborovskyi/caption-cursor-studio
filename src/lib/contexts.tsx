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
      const token = localStorage.getItem("access_token");
      if (token) {
        const response = await apiGetCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await apiGetCurrentUser();
    if (response.success && response.data?.user) {
      setUser(response.data.user);
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
