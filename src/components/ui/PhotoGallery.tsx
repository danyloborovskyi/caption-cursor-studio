"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getFiles, FileItem } from "@/lib/api";
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
  const { refreshTrigger } = useGallery();

  const fetchPhotos = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getFiles(page, 12); // 12 photos per page

      if (result.success && result.data) {
        // Backend returns data as array directly
        setPhotos(Array.isArray(result.data) ? result.data : []);
        setCurrentPage(page);
        // Since backend doesn't provide pagination info, calculate based on data
        setTotalPages(Math.ceil(result.data.length / 12) || 1);
      } else {
        setError(result.error || "Failed to load photos");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading photos");
      console.error("Photo gallery error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(1);
  }, []);

  // Refresh gallery when refreshTrigger changes (new image uploaded)
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPhotos(currentPage);
    }
  }, [refreshTrigger, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPhotos(newPage);
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

  if (photos.length === 0) {
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your first image to get started with AI caption generation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Photo Gallery
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} with
          AI-generated captions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image Display */}
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
              <Image
                src={photo.public_url}
                alt={photo.description || photo.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Photo Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
                {photo.filename}
              </h3>

              {/* AI Caption */}
              {photo.description && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {photo.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    AI Generated • {photo.status}
                  </p>
                </div>
              )}

              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {photo.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {photo.tags.length > 5 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        +{photo.tags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 space-y-1 border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(photo.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span>{formatDate(photo.uploaded_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
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
