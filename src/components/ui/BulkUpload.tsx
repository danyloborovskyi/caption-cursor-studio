"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  bulkUploadAndAnalyzeImages,
  UploadResponse,
  UploadProgress,
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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [results, setResults] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshGallery } = useGallery();

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

      // Check total count (max 10 files)
      const totalFiles = selectedFiles.length + validFiles.length;
      if (totalFiles > 10) {
        setError("Maximum 10 images allowed for bulk upload");
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
    setResults(null);
    setError(null);
    setUploadProgress(null);

    try {
      const files = selectedFiles.map((f) => f.file);

      const result: UploadResponse = await bulkUploadAndAnalyzeImages(
        files,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        const successMessage =
          result.message || "Upload completed successfully";
        const uploadCount =
          result.data?.totalFiles ||
          result.data?.successful_uploads ||
          selectedFiles.length;

        setResults({
          message: successMessage,
          uploadCount,
          results: result.data?.results || [],
        });

        // Refresh gallery to show new photos from backend
        refreshGallery();

        // Clear files and progress after successful upload
        clearAll();
        setUploadProgress(null);
      } else {
        const errorMsg =
          result.error || result.message || "Failed to upload images";
        setError(errorMsg);
        setUploadProgress(null);
      }
    } catch (err) {
      setError(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setUploadProgress(null);
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
          disabled={isLoading || selectedFiles.length >= 10}
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
              Drop up to 10 images here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Supports: JPG, PNG, GIF, WebP (max 10MB each) •{" "}
            {selectedFiles.length}/10 selected
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

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {uploadProgress.status === "uploading"
                  ? "📤 Uploading files..."
                  : uploadProgress.status === "processing"
                  ? "🤖 Processing with AI..."
                  : uploadProgress.status === "completed"
                  ? "✅ Upload complete!"
                  : "❌ Upload error"}
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {uploadProgress.processedFiles}/{uploadProgress.totalFiles}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2.5">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            {uploadProgress.currentFile && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Processing: {uploadProgress.currentFile}
              </p>
            )}
            {uploadProgress.message && (
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {uploadProgress.message}
              </p>
            )}
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
