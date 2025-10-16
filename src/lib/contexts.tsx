"use client";

import React, { createContext, useContext, useState } from "react";
import { FileItem } from "@/lib/api";

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
