/**
 * Custom Hook: useGalleryData
 *
 * Centralized hook for managing gallery data fetching and state.
 * Reduces code duplication between Gallery.tsx and MyGallery.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { getFiles, searchFiles, FileItem } from "@/lib/api";

interface UseGalleryDataOptions {
  /** Whether to fetch only user's own files */
  userFilesOnly?: boolean;
  /** Initial search query */
  initialQuery?: string;
  /** Items per page */
  pageSize?: number;
}

interface UseGalleryDataReturn {
  photos: FileItem[];
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  searchQuery: string;

  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  handleSearch: (query: string) => void;
  clearError: () => void;
  updatePhoto: (id: string, updates: Partial<FileItem>) => void;
  removePhoto: (id: string) => void;
}

const DEFAULT_PAGE_SIZE = 50;

export function useGalleryData(
  options: UseGalleryDataOptions = {}
): UseGalleryDataReturn {
  const {
    userFilesOnly = false,
    initialQuery = "",
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  // State
  const [photos, setPhotos] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Fetch photos
  const fetchPhotos = useCallback(
    async (page: number, query: string, append: boolean = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = query
          ? await searchFiles(query, page, pageSize)
          : await getFiles(page, pageSize);

        if (response.success && response.data) {
          const newPhotos = response.data;

          setPhotos((prev) => (append ? [...prev, ...newPhotos] : newPhotos));

          // Check if there are more pages
          setHasMore(newPhotos.length === pageSize);
        } else {
          setError(response.error || "Failed to load photos");
          setHasMore(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load photos");
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    },
    [pageSize]
  );

  // Initial load
  useEffect(() => {
    fetchPhotos(1, searchQuery);
  }, [searchQuery, fetchPhotos]);

  // Load more
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchPhotos(nextPage, searchQuery, true);
  }, [isLoading, hasMore, currentPage, searchQuery, fetchPhotos]);

  // Refresh
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await fetchPhotos(1, searchQuery, false);
  }, [searchQuery, fetchPhotos]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setPhotos([]);
    setHasMore(true);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update photo in state
  const updatePhoto = useCallback((id: string, updates: Partial<FileItem>) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...updates } : photo))
    );
  }, []);

  // Remove photo from state
  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  }, []);

  return {
    photos,
    isLoading,
    isInitialLoading,
    error,
    currentPage,
    hasMore,
    searchQuery,
    loadMore,
    refresh,
    handleSearch,
    clearError,
    updatePhoto,
    removePhoto,
  };
}
