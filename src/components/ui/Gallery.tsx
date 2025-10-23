"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getFiles, deleteFile, searchFiles, FileItem } from "@/lib/api";
import { useGallery, useAuth } from "@/lib/contexts";
import { Button } from "./Button";
import { ImageCard } from "./ImageCard";
import { SearchBar } from "./SearchBar";

interface GalleryProps {
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ className = "" }) => {
  const { isAuthenticated } = useAuth();
  const { refreshTrigger } = useGallery();
  const [photos, setPhotos] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [perPage, setPerPage] = useState(() => {
    // Load from localStorage or default to 12
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gallery_per_page");
      return saved ? Number(saved) : 12;
    }
    return 12;
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const fetchPhotos = useCallback(
    async (page = 1, showLoading = true) => {
      const token = localStorage.getItem("access_token");
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);

        const result = await getFiles(page, perPage);

        if (result.success && result.data) {
          // Limit to perPage items
          const limitedPhotos = result.data.slice(0, perPage);
          console.log(
            "🖼️ Gallery: Displaying",
            limitedPhotos.length,
            "of",
            result.data?.length,
            "items"
          );
          setPhotos(limitedPhotos);

          if (result.pagination) {
            console.log(
              "📊 Gallery: Setting totalPages to",
              result.pagination.total_pages
            );
            setCurrentPage(result.pagination.current_page);
            setTotalPages(result.pagination.total_pages);
          } else {
            console.log(
              "⚠️ Gallery: No pagination info, setting totalPages to 1"
            );
            setCurrentPage(page);
            setTotalPages(1);
          }
        } else {
          setError(result.error || "Failed to load photos");
        }
      } catch (err) {
        setError("An unexpected error occurred while loading photos");
        console.error("Gallery error:", err);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, perPage]
  );

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos(1);
    }
  }, [isAuthenticated, fetchPhotos]);

  // Refresh when trigger changes - reset to page 1 to show new uploads
  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated) {
      console.log("Gallery: Refresh triggered - fetching page 1");
      setIsSearchMode(false);
      setSearchQuery("");
      setCurrentPage(1);
      fetchPhotos(1, false);
    }
  }, [refreshTrigger, isAuthenticated, fetchPhotos]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setIsSearchMode(true);
    setSearchQuery(query);
    setError(null);

    try {
      const result = await searchFiles(query, 1, perPage);

      if (result.success) {
        // Limit to perPage items
        const limitedPhotos = result.data.slice(0, perPage);
        setPhotos(limitedPhotos);
        setCurrentPage(result.pagination?.current_page || 1);
        setTotalPages(result.pagination?.total_pages || 1);
      } else {
        setError(result.error || "Search failed");
        setPhotos([]);
      }
    } catch (err) {
      setError("An error occurred while searching");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentPage(1);
    fetchPhotos(1, true);
  };

  const handleSearchPageChange = async (newPage: number) => {
    if (!searchQuery.trim() || newPage < 1 || newPage > totalPages) return;

    setIsSearching(true);
    try {
      const result = await searchFiles(searchQuery, newPage, perPage);

      if (result.success) {
        // Limit to perPage items
        const limitedPhotos = result.data.slice(0, perPage);
        setPhotos(limitedPhotos);
        setCurrentPage(result.pagination?.current_page || newPage);
        setTotalPages(result.pagination?.total_pages || 1);
      }
    } catch (err) {
      console.error("Search pagination error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isSearchMode) {
      handleSearchPageChange(newPage);
    } else {
      if (newPage >= 1 && newPage <= totalPages) {
        fetchPhotos(newPage);
      }
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    // Save to localStorage
    localStorage.setItem("gallery_per_page", newPerPage.toString());
    // fetchPhotos will be called automatically due to perPage dependency
  };

  const handleDelete = async (photo: FileItem) => {
    const token = localStorage.getItem("access_token");
    if (!isAuthenticated || !token) {
      alert("Please log in to delete photos");
      return;
    }

    setDeletingPhotoId(photo.id);

    // Optimistic update
    const originalPhotos = photos;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));

    try {
      const result = await deleteFile(photo.id);

      if (result.success) {
        console.log("Photo deleted successfully");
        // Refetch to ensure sync with backend
        const remainingPhotos = originalPhotos.filter((p) => p.id !== photo.id);
        if (remainingPhotos.length === 0 && currentPage > 1) {
          await fetchPhotos(currentPage - 1, true);
        } else {
          await fetchPhotos(currentPage, false);
        }
      } else {
        // Revert on error
        setPhotos(originalPhotos);
        setError(result.error || "Failed to delete photo");
      }
    } catch (err) {
      // Revert on error
      setPhotos(originalPhotos);
      setError("An unexpected error occurred while deleting photo");
      console.error("Delete error:", err);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-white/70 font-light">Loading your gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="glass rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center space-x-3 text-red-300">
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium">Error loading gallery</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => fetchPhotos(currentPage)}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center p-12 glass rounded-2xl border-2 border-dashed border-white/20">
          <div className="mx-auto w-20 h-20 text-white/30 mb-6">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-light text-white mb-4">
            Your Gallery is Empty
          </h3>
          <p className="text-white/70 font-light text-lg mb-6">
            Upload your first images using the form above to get AI-powered
            captions and tags!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-400/30">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            Scroll up to upload images
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-light text-white mb-2 tracking-wide">
            Your Gallery
          </h2>
          <p className="text-white/60 font-light">
            {isSearchMode && searchQuery ? (
              <>
                Found {photos.length} result{photos.length !== 1 ? "s" : ""} for
                &ldquo;{searchQuery}&rdquo;
              </>
            ) : (
              <>
                {photos.length} image{photos.length !== 1 ? "s" : ""} with
                AI-generated tags
              </>
            )}
          </p>
        </div>

        {/* Search Bar and Per Page Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search by description, tags, or filename..."
              isLoading={isSearching}
            />
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-2 border border-white/20">
            <label
              htmlFor="per-page-select"
              className="text-white/70 text-sm font-light whitespace-nowrap"
            >
              Items per page:
            </label>
            <select
              id="per-page-select"
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="bg-white/10 text-white rounded-lg px-3 py-1.5 text-sm font-light border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:bg-white/20"
            >
              <option value={12} className="bg-gray-800">
                12
              </option>
              <option value={24} className="bg-gray-800">
                24
              </option>
              <option value={48} className="bg-gray-800">
                48
              </option>
              <option value={100} className="bg-gray-800">
                100
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {photos.map((photo) => (
          <ImageCard
            key={photo.id}
            photo={photo}
            isDeleting={deletingPhotoId === photo.id}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;

              const isActive = currentPage === page;

              return (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  className={`min-w-[40px] transition-all duration-200 ${
                    isActive
                      ? "!bg-white !border-white shadow-lg font-extrabold"
                      : "hover:bg-white/10"
                  }`}
                  style={
                    isActive
                      ? {
                          color: "transparent",
                          WebkitTextStroke: "1.5px rgba(128, 90, 213, 0.8)",
                        }
                      : undefined
                  }
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};
