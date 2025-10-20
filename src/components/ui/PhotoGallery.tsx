"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  getFiles,
  deleteFile,
  searchFiles,
  FileItem,
  DeleteResponse,
} from "@/lib/api";
import { useGallery, useAuth } from "@/lib/contexts";
import { Button } from "./Button";
import { SearchBar } from "./SearchBar";

interface PhotoGalleryProps {
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  className = "",
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const { refreshTrigger, newPhotos, removePhoto, clearNewPhotos } =
    useGallery();

  const fetchPhotos = useCallback(
    async (page = 1, showLoading = true) => {
      // Don't fetch if not authenticated or no token available
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

        const result = await getFiles(page, 12); // 12 photos per page

        if (result.success && result.data) {
          // Check if data has nested files array (Supabase format)
          let fetchedPhotos: FileItem[] = [];
          let paginationInfo = result.pagination;

          if (Array.isArray(result.data)) {
            // Format 1: data is array directly
            fetchedPhotos = result.data;
          } else if (result.data && typeof result.data === "object") {
            // Format 2: data is object with files property
            const dataObj = result.data as Record<string, unknown>;
            if (Array.isArray(dataObj.files)) {
              fetchedPhotos = dataObj.files as FileItem[];
            }
            if (dataObj.pagination) {
              paginationInfo = dataObj.pagination as typeof result.pagination;
            }
          }

          setPhotos(fetchedPhotos);

          // Use backend pagination info if available
          if (paginationInfo) {
            setCurrentPage(paginationInfo.current_page);
            setTotalPages(paginationInfo.total_pages);
          } else {
            // Fallback: if no pagination info, assume we got all data
            setCurrentPage(page);
            setTotalPages(Math.ceil(fetchedPhotos.length / 12) || 1);
          }
        } else {
          setError(result.error || "Failed to load photos");
        }
      } catch (err) {
        setError("An unexpected error occurred while loading photos");
        console.error("Photo gallery error:", err);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated]
  );

  // Initial fetch on component mount - only when authenticated and token exists
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Add a small delay to ensure token is fully written to localStorage
      const timeoutId = setTimeout(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
          fetchPhotos(1);
        } else {
          // No token, stop loading
          setIsLoading(false);
        }
      }, 100); // 100ms delay

      return () => clearTimeout(timeoutId);
    } else if (!authLoading && !isAuthenticated) {
      // Not authenticated, stop loading
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  // Refresh gallery when refreshTrigger changes (for deletion or errors)
  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated) {
      // Clear new photos before refreshing to avoid duplicates
      if (newPhotos.length > 0) {
        clearNewPhotos();
      }
      fetchPhotos(currentPage, false); // Background refresh without loading state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, currentPage]);

  const performSearch = async (query: string, page = 1) => {
    if (!query.trim()) {
      // Clear search results if query is empty
      setSearchResults([]);
      setSearchError(null);
      setSearchCurrentPage(1);
      setSearchTotalPages(1);
      return;
    }

    // Don't search if not authenticated or no token
    const token = localStorage.getItem("access_token");
    if (!isAuthenticated || !token) {
      setSearchError("Please log in to search photos");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await searchFiles(query, page, 12); // 12 results per page

      if (result.success) {
        setSearchResults(result.data);

        // Use backend pagination info if available
        if (result.pagination) {
          setSearchCurrentPage(result.pagination.current_page);
          setSearchTotalPages(result.pagination.total_pages);
        } else {
          // Fallback: assume single page if no pagination info
          setSearchCurrentPage(1);
          setSearchTotalPages(1);
        }
      } else {
        setSearchError(result.error || "Failed to search photos");
        setSearchResults([]);
        setSearchCurrentPage(1);
        setSearchTotalPages(1);
      }
    } catch (error) {
      setSearchError("An unexpected error occurred while searching");
      setSearchResults([]);
      setSearchCurrentPage(1);
      setSearchTotalPages(1);
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // Reset to page 1 when starting a new search
    await performSearch(query, 1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setSearchCurrentPage(1);
    setSearchTotalPages(1);
  };

  const handleSearchPageChange = (newPage: number) => {
    if (searchQuery.trim() && newPage >= 1 && newPage <= searchTotalPages) {
      performSearch(searchQuery, newPage);
    }
  };

  // Determine which photos to display (search results or regular photos)
  const isSearchMode = searchQuery.trim().length > 0;
  const displayPhotos = isSearchMode
    ? [...searchResults]
    : [...newPhotos, ...photos];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPhotos(newPage);
    }
  };

  const handleDeleteClick = async (photo: FileItem) => {
    // Don't delete if not authenticated or no token
    const token = localStorage.getItem("access_token");
    if (!isAuthenticated || !token) {
      alert("Please log in to delete photos");
      return;
    }

    setDeletingPhotoId(photo.id);

    // Optimistically remove photo immediately for smooth UX
    const isFromNewPhotos = newPhotos.some((p) => p.id === photo.id);
    const isFromSearchResults =
      isSearchMode && searchResults.some((p) => p.id === photo.id);
    const originalPhotos = photos; // Store original photos for potential revert
    const originalSearchResults = searchResults; // Store original search results for potential revert

    if (isFromNewPhotos) {
      // If it's from newPhotos, just remove it from there
      removePhoto(photo.id);
    } else if (isFromSearchResults) {
      // If it's from search results, remove it optimistically
      setSearchResults((prev) => prev.filter((p) => p.id !== photo.id));
    } else {
      // If it's from regular photos, remove it optimistically
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }

    try {
      const result: DeleteResponse = await deleteFile(photo.id);

      if (result.success) {
        console.log("File deleted successfully:", result.message);

        if (isSearchMode) {
          // Handle search results pagination after deletion
          const remainingSearchResults = originalSearchResults.filter(
            (p) => p.id !== photo.id
          );

          if (remainingSearchResults.length === 0 && searchCurrentPage > 1) {
            // Search page became completely empty, navigate to previous page
            console.log(
              "Search page became empty, navigating to previous page"
            );
            await performSearch(searchQuery, searchCurrentPage - 1);
          } else {
            // Refetch current search page to fill the gap with next available result
            console.log(
              "Refetching current search page to fill gap after deletion"
            );
            await performSearch(searchQuery, searchCurrentPage);
          }
        } else {
          // Handle regular gallery pagination after deletion
          const remainingPhotos = originalPhotos.filter(
            (p) => p.id !== photo.id
          );

          if (remainingPhotos.length === 0 && currentPage > 1) {
            // Page became completely empty, navigate to previous page
            console.log("Page became empty, navigating to previous page");
            setCurrentPage(currentPage - 1);
            await fetchPhotos(currentPage - 1, true);
          } else {
            // Refetch current page to fill the gap with next available photo
            console.log("Refetching current page to fill gap after deletion");
            await fetchPhotos(currentPage, false);
          }
        }
      } else {
        // Deletion failed, revert the optimistic update
        console.error("Delete failed, reverting optimistic update");
        setError(result.error || "Failed to delete photo");

        if (isSearchMode) {
          // Re-fetch search results to restore the photo that failed to delete
          await performSearch(searchQuery, searchCurrentPage);
        } else {
          // Re-fetch regular photos to restore the photo that failed to delete
          await fetchPhotos(currentPage, false);
        }
      }
    } catch (err) {
      // Network error, revert the optimistic update
      console.error("Delete error, reverting optimistic update:", err);
      setError("An unexpected error occurred while deleting photo");

      if (isSearchMode) {
        // Re-fetch search results to restore the photo that failed to delete
        await performSearch(searchQuery, searchCurrentPage);
      } else {
        // Re-fetch regular photos to restore the photo that failed to delete
        await fetchPhotos(currentPage, false);
      }
    } finally {
      setDeletingPhotoId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading photos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <svg
              className="w-6 h-6 text-red-500"
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading photos
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
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

  if (displayPhotos.length === 0 && !isSearchMode) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-light text-white mb-4">No photos yet</h3>
          <p className="text-white/70 font-light text-lg">
            Upload your first image to get started with AI caption generation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-light text-white mb-4 tracking-wide">
          Photo Gallery
        </h2>
        <p className="text-white/70 font-light text-lg mb-8">
          {displayPhotos.length} photo{displayPhotos.length !== 1 ? "s" : ""}{" "}
          with AI-generated captions
        </p>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onClear={clearSearch}
          placeholder="Search by description, tags, or filename..."
          isLoading={isSearching}
          className="mb-8"
        />

        {/* Search Status */}
        {isSearchMode && (
          <p className="text-white/60 text-sm mt-2 font-light text-center">
            {isSearching
              ? "Searching..."
              : searchResults.length > 0
              ? `Found ${searchResults.length} result${
                  searchResults.length !== 1 ? "s" : ""
                }${
                  searchTotalPages > 1
                    ? ` (Page ${searchCurrentPage} of ${searchTotalPages})`
                    : ""
                }`
              : "No photos found"}
          </p>
        )}

        {/* Search Error */}
        {searchError && (
          <p className="text-red-300 text-sm mt-2 font-light text-center">
            {searchError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayPhotos.map((photo) => (
          <div
            key={photo.id}
            className="glass glass-hover rounded-2xl overflow-hidden"
          >
            {/* Image Display */}
            <div className="aspect-square relative bg-white/10">
              <Image
                src={photo.public_url}
                alt={photo.description || photo.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Photo Info */}
            <div className="p-6">
              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs bg-white/20 text-white rounded-full font-light border border-white/30"
                      >
                        {tag}
                      </span>
                    ))}
                    {photo.tags.length > 5 && (
                      <span className="px-3 py-1 text-xs bg-white/10 text-white/70 rounded-full font-light border border-white/20">
                        +{photo.tags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Delete Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(photo)}
                disabled={deletingPhotoId === photo.id}
                className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/20 border-red-300/50 hover:border-red-300/70 disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {deletingPhotoId === photo.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Search Results */}
      {isSearchMode && displayPhotos.length === 0 && !isSearching && (
        <div className="text-center p-12 glass rounded-2xl">
          <div className="mx-auto w-16 h-16 text-white/40 mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-light text-white mb-4">
            No results found
          </h3>
          <p className="text-white/70 font-light text-lg mb-4">
            No photos match your search for &ldquo;{searchQuery}&rdquo;
          </p>
          <Button onClick={clearSearch} variant="outline" size="sm">
            Clear Search
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {((!isSearchMode && totalPages > 1) ||
        (isSearchMode && searchTotalPages > 1)) && (
        <div className="flex items-center justify-center space-x-3">
          {/* Use search pagination when in search mode, regular pagination otherwise */}
          {isSearchMode ? (
            <>
              <Button
                onClick={() => handleSearchPageChange(searchCurrentPage - 1)}
                disabled={searchCurrentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.min(5, searchTotalPages) },
                  (_, i) => {
                    const page =
                      searchCurrentPage <= 3
                        ? i + 1
                        : searchCurrentPage - 2 + i;
                    if (page > searchTotalPages) return null;

                    return (
                      <Button
                        key={page}
                        onClick={() => handleSearchPageChange(page)}
                        variant={
                          searchCurrentPage === page ? "primary" : "outline"
                        }
                        size="sm"
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                onClick={() => handleSearchPageChange(searchCurrentPage + 1)}
                disabled={searchCurrentPage === searchTotalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      className="min-w-[40px]"
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
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
