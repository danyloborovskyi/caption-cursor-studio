"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getFiles,
  deleteFile,
  searchFiles,
  bulkDeleteFiles,
  bulkRegenerateFiles,
  bulkDownloadFiles,
  FileItem,
} from "@/lib/api";
import { useGallery, useAuth } from "@/lib/contexts";
import { Button } from "./Button";
import { MyImageCard } from "./MyImageCard";
import { SearchBar } from "./SearchBar";
import { CustomSelect } from "./CustomSelect";
import { ConfirmationModal } from "./ConfirmationModal";

interface MyGalleryProps {
  className?: string;
}

export const MyGallery: React.FC<MyGalleryProps> = ({ className = "" }) => {
  const { isAuthenticated } = useAuth();
  const { refreshTrigger } = useGallery();
  const [photos, setPhotos] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(() => {
    // Load from localStorage or default to 12
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gallery_per_page");
      return saved ? Number(saved) : 12;
    }
    return 12;
  });

  // Sort order state - Load from localStorage
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gallery_sort_order");
      return (saved as "asc" | "desc") || "desc";
    }
    return "desc";
  });

  // Sort by state - Load from localStorage
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gallery_sort_by");
      return saved || "uploadedAt";
    }
    return "uploadedAt";
  });

  // Search state - Load from localStorage
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gallery_search_query") || "";
    }
    return "";
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("gallery_search_query");
    }
    return false;
  });

  // Bulk delete state
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Bulk regenerate state
  const [isBulkRegenerateMode, setIsBulkRegenerateMode] = useState(false);
  const [regenerateSelectedIds, setRegenerateSelectedIds] = useState<number[]>(
    []
  );
  const [isBulkRegenerating, setIsBulkRegenerating] = useState(false);
  const [bulkRegenerateTagStyle, setBulkRegenerateTagStyle] = useState<
    "neutral" | "playful" | "seo"
  >("playful");

  // Bulk download state
  const [isBulkDownloadMode, setIsBulkDownloadMode] = useState(false);
  const [downloadSelectedIds, setDownloadSelectedIds] = useState<number[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  // Confirmation modals
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkRegenerateConfirm, setShowBulkRegenerateConfirm] =
    useState(false);

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

        console.log(
          `📊 Fetching gallery - page: ${page}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`
        );
        const result = await getFiles(page, perPage, sortBy, sortOrder);

        if (result.success && result.data) {
          // Backend already returns paginated data - no need to slice
          console.log(
            "🖼️ Gallery: Displaying",
            result.data.length,
            "items on page",
            page
          );
          setPhotos(result.data);

          if (result.pagination) {
            console.log(
              "📊 Gallery: Setting totalPages to",
              result.pagination.total_pages
            );
            setCurrentPage(result.pagination.current_page);
            setTotalPages(result.pagination.total_pages);
            setTotalItems(result.pagination.total_items || 0);
          } else {
            console.log(
              "⚠️ Gallery: No pagination info, setting totalPages to 1"
            );
            setCurrentPage(page);
            setTotalPages(1);
            setTotalItems(0);
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
        setIsInitialLoading(false);
      }
    },
    [isAuthenticated, perPage, sortOrder, sortBy]
  );

  // Initial load - check for saved search or load regular gallery
  useEffect(() => {
    if (isAuthenticated) {
      const savedQuery = localStorage.getItem("gallery_search_query");
      if (savedQuery && savedQuery.trim()) {
        // If there's a saved search, perform it
        setIsLoading(true);
        setIsSearching(true);
        setIsSearchMode(true);
        setError(null);

        // Read sortBy and sortOrder from localStorage to avoid race conditions
        const savedSortBy =
          localStorage.getItem("gallery_sort_by") || "uploadedAt";
        const savedSortOrder = (localStorage.getItem("gallery_sort_order") ||
          "desc") as "asc" | "desc";

        searchFiles(savedQuery, 1, perPage, savedSortOrder, savedSortBy)
          .then((result) => {
            if (result.success) {
              // Backend already returns paginated data
              setPhotos(result.data);
              setCurrentPage(result.pagination?.current_page || 1);
              setTotalPages(result.pagination?.total_pages || 1);
              setTotalItems(result.pagination?.total_items || 0);
            } else {
              setError(result.error || "Search failed");
              setPhotos([]);
            }
          })
          .catch((err) => {
            setError("An error occurred while searching");
            console.error("Search error:", err);
          })
          .finally(() => {
            setIsSearching(false);
            setIsLoading(false);
            setIsInitialLoading(false);
          });
      } else {
        // Otherwise, load regular gallery
        fetchPhotos(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Refresh when trigger changes - reset to page 1 to show new uploads
  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated) {
      console.log("Gallery: Refresh triggered - fetching page 1");
      setIsSearchMode(false);
      setSearchQuery("");
      setCurrentPage(1);
      // Clear saved search from localStorage
      localStorage.removeItem("gallery_search_query");
      fetchPhotos(1, false);
    }
  }, [refreshTrigger, isAuthenticated, fetchPhotos]);

  // Auto-reload when sort settings change
  useEffect(() => {
    // Skip on initial mount
    if (isInitialLoading) return;

    console.log(`🔄 Sort changed - sortBy: ${sortBy}, sortOrder: ${sortOrder}`);
    console.log(
      `   isSearchMode: ${isSearchMode}, searchQuery: "${searchQuery}"`
    );

    if (isSearchMode && searchQuery) {
      // Re-run search with new sort settings
      console.log(
        `   🔍 Re-running search with sortBy: ${sortBy}, sortOrder: ${sortOrder}`
      );
      setIsSearching(true);
      searchFiles(searchQuery, 1, perPage, sortOrder, sortBy)
        .then((result) => {
          console.log(
            `   ✅ Search completed, got ${result.data?.length || 0} results`
          );
          if (result.success) {
            // Backend already returns paginated data
            setPhotos(result.data);
            setCurrentPage(1);
            setTotalPages(result.pagination?.total_pages || 1);
            setTotalItems(result.pagination?.total_items || 0);
          }
        })
        .catch((err) => {
          console.error("   ❌ Search with new sort settings error:", err);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      // Re-fetch regular gallery with new sort settings
      console.log(
        `   📂 Re-fetching regular gallery with sortBy: ${sortBy}, sortOrder: ${sortOrder}`
      );
      fetchPhotos(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, sortBy]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setIsSearchMode(true);
    setSearchQuery(query);
    setError(null);

    // Save search query to localStorage
    localStorage.setItem("gallery_search_query", query);

    console.log(
      `🔍 handleSearch called with query: "${query}", sortBy: ${sortBy}, sortOrder: ${sortOrder}`
    );

    try {
      const result = await searchFiles(query, 1, perPage, sortOrder, sortBy);

      if (result.success) {
        // Limit to perPage items
        // Backend already returns paginated data
        setPhotos(result.data);
        setCurrentPage(result.pagination?.current_page || 1);
        setTotalPages(result.pagination?.total_pages || 1);
        setTotalItems(result.pagination?.total_items || 0);
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
    // Clear saved search from localStorage
    localStorage.removeItem("gallery_search_query");
    fetchPhotos(1, true); // Show loading overlay
  };

  const handleSearchPageChange = async (newPage: number) => {
    if (!searchQuery.trim() || newPage < 1 || newPage > totalPages) return;

    setIsSearching(true);
    try {
      const result = await searchFiles(
        searchQuery,
        newPage,
        perPage,
        sortOrder,
        sortBy
      );

      if (result.success) {
        // Limit to perPage items
        // Backend already returns paginated data
        setPhotos(result.data);
        setCurrentPage(result.pagination?.current_page || newPage);
        setTotalPages(result.pagination?.total_pages || 1);
        setTotalItems(result.pagination?.total_items || 0);
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

  const handleSortOrderChange = (newSortOrder: "asc" | "desc") => {
    console.log(`📊 handleSortOrderChange called with: ${newSortOrder}`);
    console.log(`   Current sortOrder state: ${sortOrder}`);
    console.log(`   Current isSearchMode: ${isSearchMode}`);
    console.log(`   Current searchQuery: "${searchQuery}"`);
    // Save to localStorage
    localStorage.setItem("gallery_sort_order", newSortOrder);
    // Update state - this will trigger the useEffect to reload data
    setSortOrder(newSortOrder);
  };

  const handleSortByChange = (newSortBy: string) => {
    console.log(`📊 handleSortByChange called with: ${newSortBy}`);
    // Save to localStorage
    localStorage.setItem("gallery_sort_by", newSortBy);
    // Update state - this will trigger the useEffect to reload data
    setSortBy(newSortBy);
  };

  const handlePerPageChange = async (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    // Save to localStorage
    localStorage.setItem("gallery_per_page", newPerPage.toString());

    // Manually trigger fetch with new per_page value
    if (isSearchMode && searchQuery) {
      // If in search mode, re-run the search with new per_page
      setIsSearching(true);
      try {
        const result = await searchFiles(searchQuery, 1, newPerPage, sortOrder);
        if (result.success) {
          // Backend already returns paginated data
          setPhotos(result.data);
          setCurrentPage(result.pagination?.current_page || 1);
          setTotalPages(result.pagination?.total_pages || 1);
          setTotalItems(result.pagination?.total_items || 0);
        }
      } catch (err) {
        console.error("Search error on per page change:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Otherwise, fetch regular photos with new per_page
      setIsLoading(true);
      try {
        const result = await getFiles(1, newPerPage, sortBy, sortOrder);
        if (result.success && result.data) {
          // Backend already returns paginated data
          setPhotos(result.data);
          if (result.pagination) {
            setCurrentPage(result.pagination.current_page);
            setTotalPages(result.pagination.total_pages);
            setTotalItems(result.pagination.total_items || 0);
          }
        }
      } catch (err) {
        console.error("Fetch error on per page change:", err);
      } finally {
        setIsLoading(false);
      }
    }
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

        if (isSearchMode) {
          // If in search mode, re-run the search
          if (remainingPhotos.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
            await handleSearchPageChange(currentPage - 1);
          } else {
            await handleSearchPageChange(currentPage);
          }
        } else {
          // Regular gallery mode
          if (remainingPhotos.length === 0 && currentPage > 1) {
            await fetchPhotos(currentPage - 1, true);
          } else {
            await fetchPhotos(currentPage, false);
          }
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

  const handleUpdate = () => {
    console.log("📝 Card updated, reloading page to reflect sort order...");

    // Reload the current page to get updated data and correct sorting
    // This is especially important when sorting by filename or updatedAt
    if (isSearchMode && searchQuery) {
      // Reload search results
      handleSearchPageChange(currentPage);
    } else {
      // Reload regular gallery
      fetchPhotos(currentPage, false);
    }
  };

  const handleToggleBulkDelete = () => {
    // If switching from regenerate mode, clear those selections
    if (isBulkRegenerateMode) {
      setIsBulkRegenerateMode(false);
      setRegenerateSelectedIds([]);
    }
    setIsBulkDeleteMode(!isBulkDeleteMode);
    setSelectedIds([]); // Clear selections when toggling
  };

  const handleSelectImage = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map((p) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = async () => {
    setShowBulkDeleteConfirm(false);
    setIsBulkDeleting(true);

    try {
      const result = await bulkDeleteFiles(selectedIds);

      if (result.success) {
        // Remove deleted photos from the list
        setPhotos((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setIsBulkDeleteMode(false);

        // Reload to get accurate pagination
        if (isSearchMode && searchQuery) {
          handleSearchPageChange(currentPage);
        } else {
          fetchPhotos(currentPage, false);
        }
      } else {
        setError(result.error || "Failed to delete selected images");
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting images");
      console.error("Bulk delete error:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCancelBulkDelete = () => {
    setShowBulkDeleteConfirm(false);
  };

  // Bulk Regenerate Handlers
  const handleToggleBulkRegenerate = () => {
    // If switching from delete mode, clear those selections
    if (isBulkDeleteMode) {
      setIsBulkDeleteMode(false);
      setSelectedIds([]);
    }
    setIsBulkRegenerateMode(!isBulkRegenerateMode);
    setRegenerateSelectedIds([]);
  };

  const handleSelectImageForRegenerate = (id: number) => {
    setRegenerateSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllForRegenerate = () => {
    if (regenerateSelectedIds.length === photos.length) {
      setRegenerateSelectedIds([]);
    } else {
      setRegenerateSelectedIds(photos.map((p) => p.id));
    }
  };

  const handleBulkRegenerate = async () => {
    if (regenerateSelectedIds.length === 0) return;

    if (regenerateSelectedIds.length > 20) {
      setError("You can only regenerate up to 20 files at a time");
      return;
    }

    setShowBulkRegenerateConfirm(true);
  };

  const handleConfirmBulkRegenerate = async () => {
    setShowBulkRegenerateConfirm(false);
    setIsBulkRegenerating(true);

    try {
      const result = await bulkRegenerateFiles(
        regenerateSelectedIds,
        bulkRegenerateTagStyle
      );

      if (result.success && result.data) {
        // Update the photos with regenerated data
        const regeneratedData = result.data.regenerated || [];

        setPhotos((prev) =>
          prev.map((photo) => {
            const regenerated = regeneratedData.find(
              (r: {
                id: number;
                description: string;
                tags: string[];
                updatedAt: string;
              }) => r.id === photo.id
            );
            if (regenerated) {
              return {
                ...photo,
                description: regenerated.description,
                tags: regenerated.tags,
                updatedAt: regenerated.updatedAt,
              };
            }
            return photo;
          })
        );

        setRegenerateSelectedIds([]);
        setIsBulkRegenerateMode(false);

        // Reload to get accurate data
        if (isSearchMode && searchQuery) {
          handleSearchPageChange(currentPage);
        } else {
          fetchPhotos(currentPage, false);
        }
      } else {
        setError(result.error || "Failed to regenerate selected images");
      }
    } catch (err) {
      setError("An unexpected error occurred while regenerating images");
      console.error("Bulk regenerate error:", err);
    } finally {
      setIsBulkRegenerating(false);
    }
  };

  const handleCancelBulkRegenerate = () => {
    setShowBulkRegenerateConfirm(false);
    // Reset tag style to default when canceling
    setBulkRegenerateTagStyle("playful");
  };

  // Bulk Download Handlers
  const handleToggleBulkDownload = () => {
    // If switching from other modes, clear those selections
    if (isBulkDeleteMode) {
      setIsBulkDeleteMode(false);
      setSelectedIds([]);
    }
    if (isBulkRegenerateMode) {
      setIsBulkRegenerateMode(false);
      setRegenerateSelectedIds([]);
    }
    setIsBulkDownloadMode(!isBulkDownloadMode);
    setDownloadSelectedIds([]);
  };

  const handleSelectImageForDownload = (id: number) => {
    setDownloadSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllForDownload = () => {
    if (downloadSelectedIds.length === photos.length) {
      setDownloadSelectedIds([]);
    } else {
      setDownloadSelectedIds(photos.map((p) => p.id));
    }
  };

  const handleBulkDownload = async () => {
    if (downloadSelectedIds.length === 0) return;

    setIsBulkDownloading(true);

    try {
      const blob = await bulkDownloadFiles(downloadSelectedIds);

      if (blob) {
        // Create a download link for the zip file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `images-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setDownloadSelectedIds([]);
        setIsBulkDownloadMode(false);
      } else {
        setError("Failed to download files");
      }
    } catch (err) {
      setError("An unexpected error occurred while downloading images");
      console.error("Bulk download error:", err);
    } finally {
      setIsBulkDownloading(false);
    }
  };

  if (isInitialLoading) {
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

  // Empty state - but still show SearchBar if in search mode
  if (photos.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        {/* Show search bar if we're in search mode so user can clear it */}
        {isSearchMode && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-light text-white mb-2 tracking-wide">
                Your Gallery
              </h2>
              <p className="text-white/60 font-light">
                No results found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>

            {/* Search Bar and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  value={searchQuery}
                  placeholder="Search by description, tags, or filename..."
                  isLoading={isSearching}
                />
              </div>

              {/* Sort By Selector */}
              <CustomSelect
                id="sort-by-select-empty"
                label="Sort by:"
                value={sortBy}
                options={[
                  { value: "uploadedAt", label: "Upload Date" },
                  { value: "updatedAt", label: "Update Date" },
                  { value: "filename", label: "Filename" },
                ]}
                onChange={(value) => handleSortByChange(value as string)}
              />

              {/* Sort Order Selector */}
              <CustomSelect
                id="sort-order-select-empty"
                label="Order:"
                value={sortOrder}
                options={[
                  { value: "desc", label: "Newest First" },
                  { value: "asc", label: "Oldest First" },
                ]}
                onChange={(value) =>
                  handleSortOrderChange(value as "asc" | "desc")
                }
              />

              {/* Items Per Page Selector */}
              <CustomSelect
                id="per-page-select-empty"
                label="Items per page:"
                value={perPage}
                options={[
                  { value: 12, label: "12" },
                  { value: 24, label: "24" },
                  { value: 48, label: "48" },
                  { value: 100, label: "100" },
                ]}
                onChange={(value) => handlePerPageChange(Number(value))}
              />
            </div>
          </div>
        )}

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
            {isSearchMode ? "No Results Found" : "Your Gallery is Empty"}
          </h3>
          <p className="text-white/70 font-light text-lg mb-6">
            {isSearchMode ? (
              <>
                No images match your search. Try a different search term or
                clear the search to see all images.
              </>
            ) : (
              <>
                Upload your first images using the form above to get AI-powered
                captions and tags!
              </>
            )}
          </p>
          {isSearchMode ? (
            <Button onClick={handleClearSearch} variant="primary" size="sm">
              Clear Search
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-white mb-2 tracking-wide">
            Your Gallery
          </h2>
          <p className="text-white/60 font-light">
            {isSearchMode && searchQuery ? (
              <>
                Found {totalItems} result{totalItems !== 1 ? "s" : ""} for
                &ldquo;{searchQuery}&rdquo;
              </>
            ) : (
              <>
                {totalItems} image{totalItems !== 1 ? "s" : ""} with
                AI-generated tags
              </>
            )}
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
          {/* Sort By Selector */}
          <CustomSelect
            id="sort-by-select"
            label="Sort by:"
            value={sortBy}
            options={[
              { value: "uploadedAt", label: "Upload Date" },
              { value: "updatedAt", label: "Update Date" },
              { value: "filename", label: "Filename" },
            ]}
            onChange={(value) => handleSortByChange(value as string)}
          />

          {/* Sort Order Selector */}
          <CustomSelect
            id="sort-order-select"
            label="Order:"
            value={sortOrder}
            options={[
              { value: "desc", label: "Newest First" },
              { value: "asc", label: "Oldest First" },
            ]}
            onChange={(value) => handleSortOrderChange(value as "asc" | "desc")}
          />

          {/* Items Per Page Selector */}
          <CustomSelect
            id="per-page-select"
            label="Items per page:"
            value={perPage}
            options={[
              { value: 12, label: "12" },
              { value: 24, label: "24" },
              { value: 48, label: "48" },
              { value: 100, label: "100" },
            ]}
            onChange={(value) => handlePerPageChange(Number(value))}
          />

          {/* Bulk Download Button */}
          <button
            onClick={handleToggleBulkDownload}
            className={`flex items-center gap-2 px-4 rounded-xl border transition-all cursor-pointer h-[52px] ${
              isBulkDownloadMode
                ? "bg-green-500/20 border-green-500/50 text-green-300"
                : "glass border-white/20 text-white/70 hover:border-white/40 hover:text-white"
            }`}
            title="Bulk download mode"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="whitespace-nowrap text-sm font-light">
              Bulk Download
            </span>
            {isBulkDownloadMode && downloadSelectedIds.length > 0 && (
              <span className="font-medium">
                ({downloadSelectedIds.length})
              </span>
            )}
          </button>

          {/* Bulk Regenerate Button */}
          <button
            onClick={handleToggleBulkRegenerate}
            className={`flex items-center gap-2 px-4 rounded-xl border transition-all cursor-pointer h-[52px] ${
              isBulkRegenerateMode
                ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                : "glass border-white/20 text-white/70 hover:border-white/40 hover:text-white"
            }`}
            title="Bulk regenerate AI mode"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="whitespace-nowrap text-sm font-light">
              Bulk Regenerate
            </span>
            {isBulkRegenerateMode && regenerateSelectedIds.length > 0 && (
              <span className="font-medium">
                ({regenerateSelectedIds.length})
              </span>
            )}
          </button>

          {/* Bulk Delete Button */}
          <button
            onClick={handleToggleBulkDelete}
            className={`flex items-center gap-2 px-4 rounded-xl border transition-all cursor-pointer h-[52px] ${
              isBulkDeleteMode
                ? "bg-red-500/20 border-red-500/50 text-red-300"
                : "glass border-white/20 text-white/70 hover:border-white/40 hover:text-white"
            }`}
            title="Bulk delete mode"
          >
            <svg
              className="w-5 h-5"
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
            <span className="whitespace-nowrap text-sm font-light">
              Bulk Delete
            </span>
            {isBulkDeleteMode && selectedIds.length > 0 && (
              <span className="font-medium">({selectedIds.length})</span>
            )}
          </button>
        </div>

        {/* Search Bar Row */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              value={searchQuery}
              placeholder="Search by description, tags, or filename..."
              isLoading={isSearching}
            />
          </div>
        </div>

        {/* Bulk Download Actions Bar */}
        {isBulkDownloadMode && (
          <div className="mt-4 flex items-center justify-between glass rounded-xl px-4 py-3 border border-green-500/50">
            <div className="flex items-center gap-4">
              <span className="text-white/90 text-sm font-light">
                {downloadSelectedIds.length === 0
                  ? "Select images to download"
                  : `${downloadSelectedIds.length} image${
                      downloadSelectedIds.length > 1 ? "s" : ""
                    } selected`}
              </span>
              <button
                onClick={handleSelectAllForDownload}
                className="text-green-300 hover:text-green-200 text-sm font-medium cursor-pointer"
              >
                {downloadSelectedIds.length === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBulkDownload}
                disabled={isBulkDownloading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkDownload}
                disabled={downloadSelectedIds.length === 0 || isBulkDownloading}
                className="!bg-green-500 hover:!bg-green-600"
              >
                {isBulkDownloading
                  ? "Downloading..."
                  : `Download ${
                      downloadSelectedIds.length > 0
                        ? `(${downloadSelectedIds.length})`
                        : ""
                    }`}
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Regenerate Actions Bar */}
        {isBulkRegenerateMode && (
          <div className="mt-4 flex items-center justify-between glass rounded-xl px-4 py-3 border border-blue-500/50">
            <div className="flex items-center gap-4">
              <span className="text-white/90 text-sm font-light">
                {regenerateSelectedIds.length === 0
                  ? "Select images to regenerate AI analysis"
                  : `${regenerateSelectedIds.length} image${
                      regenerateSelectedIds.length > 1 ? "s" : ""
                    } selected ${
                      regenerateSelectedIds.length > 20 ? "(max 20)" : ""
                    }`}
              </span>
              <button
                onClick={handleSelectAllForRegenerate}
                className="text-blue-300 hover:text-blue-200 text-sm font-medium cursor-pointer"
              >
                {regenerateSelectedIds.length === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBulkRegenerate}
                disabled={isBulkRegenerating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkRegenerate}
                disabled={
                  regenerateSelectedIds.length === 0 ||
                  isBulkRegenerating ||
                  regenerateSelectedIds.length > 20
                }
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                {isBulkRegenerating
                  ? "Regenerating..."
                  : `Regenerate ${
                      regenerateSelectedIds.length > 0
                        ? `(${regenerateSelectedIds.length})`
                        : ""
                    }`}
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Delete Actions Bar */}
        {isBulkDeleteMode && (
          <div className="mt-4 flex items-center justify-between glass rounded-xl px-4 py-3 border border-blue-500/50">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-300 hover:text-blue-200 transition-colors cursor-pointer font-light"
              >
                {selectedIds.length === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span className="text-white/60 text-sm">
                {selectedIds.length} of {photos.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBulkDelete}
                disabled={isBulkDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || isBulkDeleting}
                className="!bg-red-500 hover:!bg-red-600"
              >
                {isBulkDeleting
                  ? "Deleting..."
                  : `Delete ${
                      selectedIds.length > 0 ? `(${selectedIds.length})` : ""
                    }`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Image Cards */}
      <div className="relative">
        {/* Loading overlay for subsequent loads */}
        {isLoading && !isInitialLoading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center space-x-3 glass p-4 rounded-xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-white/90 font-light">Updating...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {photos.map((photo) => (
            <MyImageCard
              key={photo.id}
              photo={photo}
              isDeleting={deletingPhotoId === photo.id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              searchQuery={isSearchMode ? searchQuery : ""}
              isBulkDeleteMode={isBulkDeleteMode}
              isSelected={selectedIds.includes(photo.id)}
              onSelect={handleSelectImage}
              isBulkRegenerateMode={isBulkRegenerateMode}
              isRegenerateSelected={regenerateSelectedIds.includes(photo.id)}
              onRegenerateSelect={handleSelectImageForRegenerate}
              isBulkDownloadMode={isBulkDownloadMode}
              isDownloadSelected={downloadSelectedIds.includes(photo.id)}
              onDownloadSelect={handleSelectImageForDownload}
            />
          ))}
        </div>
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
            {(() => {
              const pages = [];
              const showEllipsisStart = currentPage > 4;
              const showEllipsisEnd = currentPage < totalPages - 3;

              // Always show first page
              pages.push(1);

              // Show ellipsis after first page if needed
              if (showEllipsisStart) {
                pages.push("ellipsis-start");
              }

              // Show pages around current page (current ± 2)
              for (
                let i = Math.max(2, currentPage - 2);
                i <= Math.min(totalPages - 1, currentPage + 2);
                i++
              ) {
                if (i !== 1 && i !== totalPages) {
                  pages.push(i);
                }
              }

              // Show ellipsis before last page if needed
              if (showEllipsisEnd) {
                pages.push("ellipsis-end");
              }

              // Always show last page (if more than 1 page)
              if (totalPages > 1) {
                pages.push(totalPages);
              }

              return pages.map((page) => {
                if (typeof page === "string") {
                  // Render ellipsis
                  return (
                    <span key={page} className="px-2 text-white/50 font-light">
                      ...
                    </span>
                  );
                }

                const isActive = currentPage === page;

                return (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={isActive ? "primary" : "outline"}
                    size="sm"
                    className={`min-w-[40px] transition-all duration-200 ${
                      isActive
                        ? "!bg-white !border-white shadow-lg font-extrabold [&>*]:animate-gradient-text"
                        : "hover:bg-white/10"
                    }`}
                  >
                    {isActive ? (
                      <span
                        className="font-extrabold keyhole-text"
                        style={{
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          color: "transparent",
                        }}
                      >
                        {page}
                      </span>
                    ) : (
                      page
                    )}
                  </Button>
                );
              });
            })()}
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

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        title="Delete Selected Images?"
        message={`Are you sure you want to delete ${selectedIds.length} image${
          selectedIds.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
        confirmText={`Delete ${selectedIds.length} image${
          selectedIds.length > 1 ? "s" : ""
        }`}
        cancelText="Cancel"
        onConfirm={handleConfirmBulkDelete}
        onCancel={handleCancelBulkDelete}
        variant="danger"
        isLoading={isBulkDeleting}
      />

      {/* Bulk Regenerate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkRegenerateConfirm}
        title="Regenerate AI Analysis?"
        message={`Are you sure you want to regenerate AI analysis for ${
          regenerateSelectedIds.length
        } image${
          regenerateSelectedIds.length > 1 ? "s" : ""
        }? This will overwrite existing descriptions and tags. This action cannot be undone.`}
        confirmText={`Regenerate ${regenerateSelectedIds.length} image${
          regenerateSelectedIds.length > 1 ? "s" : ""
        }`}
        cancelText="Cancel"
        onConfirm={handleConfirmBulkRegenerate}
        onCancel={handleCancelBulkRegenerate}
        variant="warning"
        isLoading={isBulkRegenerating}
      >
        {/* Tag Style Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/90 text-center">
            Choose Tag Style:
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBulkRegenerateTagStyle("playful")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                bulkRegenerateTagStyle === "playful"
                  ? "bg-blue-500 text-white border-2 border-blue-400 shadow-lg"
                  : "bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              🎨 Playful
            </button>
            <button
              type="button"
              onClick={() => setBulkRegenerateTagStyle("neutral")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                bulkRegenerateTagStyle === "neutral"
                  ? "bg-blue-500 text-white border-2 border-blue-400 shadow-lg"
                  : "bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              📝 Neutral
            </button>
            <button
              type="button"
              onClick={() => setBulkRegenerateTagStyle("seo")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                bulkRegenerateTagStyle === "seo"
                  ? "bg-blue-500 text-white border-2 border-blue-400 shadow-lg"
                  : "bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              🚀 SEO
            </button>
          </div>
          <p className="text-xs text-white/50 text-center">
            {bulkRegenerateTagStyle === "playful" &&
              "Creative and engaging tags with personality"}
            {bulkRegenerateTagStyle === "neutral" &&
              "Professional and straightforward tags"}
            {bulkRegenerateTagStyle === "seo" &&
              "Search-optimized tags for better discoverability"}
          </p>
        </div>
      </ConfirmationModal>
    </div>
  );
};
