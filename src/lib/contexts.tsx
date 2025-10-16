"use client";

import React, { createContext, useContext, useState } from "react";

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
    <GalleryContext.Provider value={{ refreshTrigger, refreshGallery }}>
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
