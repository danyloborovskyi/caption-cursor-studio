"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  bulkUploadAndAnalyzeImages,
  UploadResponse,
  convertUploadToFileItem,
  UploadData,
} from "@/lib/api";
import { useGallery } from "@/lib/contexts";
import { Button } from "./Button";

interface BulkUploadProps {
  className?: string;
}

interface BulkUploadResult {
  message?: string;
  uploadCount?: number;
  results?: Array<{
    id: number;
    filename: string;
    description: string;
    tags: string[];
  }>;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
  id: string;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ className = "" }) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addNewPhotos } = useGallery();

  const createFilePreview = (file: File): SelectedFile => ({
    file,
    previewUrl: URL.createObjectURL(file),
    id: Math.random().toString(36).substr(2, 9),
  });

  const validateAndAddFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} is not a valid image file`);
          continue;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          setError(`${file.name} is too large (max 10MB)`);
          continue;
        }

        validFiles.push(file);
      }

      // Check total count (max 3 files)
      const totalFiles = selectedFiles.length + validFiles.length;
      if (totalFiles > 3) {
        setError("Maximum 3 images allowed for bulk upload");
        return;
      }

      // Clear error and add files
      setError(null);
      const newFilePreviews = validFiles.map(createFilePreview);
      setSelectedFiles((prev) => [...prev, ...newFilePreviews]);
    },
    [selectedFiles.length]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      // Revoke URL for removed file
      const removedFile = prev.find((f) => f.id === id);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }
      return updated;
    });
  };

  const clearAll = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setResults(null);
    setError(null);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const files = selectedFiles.map((f) => f.file);
      console.log(
        "Starting bulk upload for files:",
        files.map((f) => `${f.name} (${f.type})`)
      );

      const result: UploadResponse = await bulkUploadAndAnalyzeImages(files);

      if (result.success) {
        // Handle the new bulk response structure
        const successMessage = result.message || "Upload successful";
        const uploadCount =
          result.data?.successful_uploads || selectedFiles.length;

        console.log("Bulk upload successful:", {
          message: successMessage,
          uploads: uploadCount,
          results: result.data?.results,
        });

        // Check if this was individual uploads (indicated by message content)
        const isIndividualUploads =
          successMessage.includes("individual uploads");
        const displayMessage = isIndividualUploads
          ? successMessage.replace(
              "(individual uploads)",
              "- processed individually"
            )
          : successMessage;

        setResults({
          message: displayMessage,
          uploadCount,
          results: result.data?.results || [],
        });

        // Add new photos to gallery without full refresh
        if (result.data?.results) {
          const newPhotos = result.data.results.map(convertUploadToFileItem);
          addNewPhotos(newPhotos);
        }

        // Clear files after successful upload
        clearAll();
      } else {
        const errorMsg =
          result.error || result.message || "Failed to upload images";
        console.error("Bulk upload failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600"
          }
          hover:border-gray-400 dark:hover:border-gray-500
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading || selectedFiles.length >= 3}
        />
        <div className="space-y-3">
          <div className="mx-auto w-10 h-10 text-gray-400">
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Drop up to 3 images here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Supports: JPG, PNG, GIF, WebP (max 10MB each) •{" "}
            {selectedFiles.length}/3 selected
          </p>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Selected Images ({selectedFiles.length})
            </h4>
            <div className="flex gap-2">
              {!isLoading && (
                <>
                  <Button onClick={uploadFiles} variant="primary">
                    Analyze All Images
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={fileObj.previewUrl}
                    alt={fileObj.file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {fileObj.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isLoading && (
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-blue-50 dark:bg-blue-950 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 dark:text-blue-300">
              AI is analyzing {selectedFiles.length} image
              {selectedFiles.length !== 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg mb-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
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
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Upload Error
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Results */}
      {results && (
        <div className="p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h4 className="text-lg font-medium text-green-800 dark:text-green-200">
              Bulk Upload Successful!
            </h4>
          </div>
          <p className="text-green-700 dark:text-green-300 mb-3">
            {results?.message ||
              "All images have been processed and added to your gallery."}
          </p>
          {results?.uploadCount && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Successfully processed {results.uploadCount} image
              {results.uploadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
