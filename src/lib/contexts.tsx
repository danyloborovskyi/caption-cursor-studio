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
    setNewPhotos((prev) => [...photos, ...prev]);
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
        removePhoto
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
