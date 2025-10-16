"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getFiles, deleteFile, FileItem, DeleteResponse } from "@/lib/api";
import { useGallery } from "@/lib/contexts";
import { Button } from "./Button";

interface PhotoGalleryProps {
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  className = "",
}) => {
  const [photos, setPhotos] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const {
    refreshTrigger,
    refreshGallery,
    newPhotos,
    clearNewPhotos,
    removePhoto,
  } = useGallery();

  const fetchPhotos = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const result = await getFiles(page, 12); // 12 photos per page

      if (result.success && result.data) {
        // Backend returns data as array directly
        const fetchedPhotos = Array.isArray(result.data) ? result.data : [];
        setPhotos(fetchedPhotos);

        // Use backend pagination info if available, otherwise calculate
        if (result.pagination) {
          setCurrentPage(result.pagination.current_page);
          setTotalPages(result.pagination.total_pages);
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
  };

  useEffect(() => {
    fetchPhotos(1);
  }, []);

  // Refresh gallery when refreshTrigger changes (for deletion or errors)
  // Only refresh if we don't have new photos (to avoid disrupting smooth additions)
  useEffect(() => {
    if (refreshTrigger > 0 && newPhotos.length === 0) {
      fetchPhotos(currentPage, false); // Background refresh without loading state
    }
  }, [refreshTrigger, currentPage, newPhotos.length]);

  // Merge new photos with existing ones
  const allPhotos = [...newPhotos, ...photos];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPhotos(newPage);
    }
  };

  const handleDeleteClick = async (photo: FileItem) => {
    setDeletingPhotoId(photo.id);

    // Optimistically remove photo immediately for smooth UX
    const isFromNewPhotos = newPhotos.some((p) => p.id === photo.id);

    if (isFromNewPhotos) {
      // If it's from newPhotos, just remove it from there
      removePhoto(photo.id);
    } else {
      // If it's from regular photos, remove it optimistically
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }

    try {
      const result: DeleteResponse = await deleteFile(photo.id);

      if (result.success) {
        console.log("File deleted successfully:", result.message);
        // Photo already removed optimistically, no need to re-fetch

        // Handle pagination if needed - only if we removed the last photo and we're not on page 1
        const remainingPhotos = photos.filter((p) => p.id !== photo.id);
        if (remainingPhotos.length === 0 && currentPage > 1) {
          console.log("Page became empty, navigating to previous page");
          await fetchPhotos(currentPage - 1, true); // Show loading for page navigation
        }
      } else {
        // Deletion failed, revert the optimistic update
        console.error("Delete failed, reverting optimistic update");
        setError(result.error || "Failed to delete photo");

        // Re-fetch to restore the photo that failed to delete
        await fetchPhotos(currentPage, false);
      }
    } catch (err) {
      // Network error, revert the optimistic update
      console.error("Delete error, reverting optimistic update:", err);
      setError("An unexpected error occurred while deleting photo");

      // Re-fetch to restore the photo that failed to delete
      await fetchPhotos(currentPage, false);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  if (allPhotos.length === 0) {
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
        <p className="text-white/70 font-light text-lg">
          {allPhotos.length} photo{allPhotos.length !== 1 ? "s" : ""} with
          AI-generated captions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {allPhotos.map((photo) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3">
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
        </div>
      )}
    </div>
  );
};
