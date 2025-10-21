"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { bulkUploadAndAnalyzeImages, UploadResponse } from "@/lib/api";
import { Button } from "./Button";

interface BulkUploadProps {
  className?: string;
  onUploadSuccess?: () => void;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
  id: string;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
  className = "",
  onUploadSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setSuccessMessage(null);
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

  const clearAll = useCallback(() => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setError(null);
    setSuccessMessage(null);
  }, [selectedFiles]);

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const files = selectedFiles.map((f) => f.file);
      const result: UploadResponse = await bulkUploadAndAnalyzeImages(files);

      if (result.success) {
        const count =
          result.data?.successfulUploads ||
          result.data?.results?.length ||
          selectedFiles.length;
        const processingTime = result.data?.processingTimeSeconds;

        let message = `Successfully uploaded and analyzed ${count} image${
          count !== 1 ? "s" : ""
        }!`;
        if (processingTime) {
          message += ` (${processingTime.toFixed(1)}s)`;
        }

        setSuccessMessage(message);

        // Clear form after successful upload
        clearAll();

        // Call success callback if provided
        onUploadSuccess?.();
      } else {
        const errorMsg =
          result.error || result.message || "Failed to upload images";
        setError(errorMsg);
      }
    } catch (err) {
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
          ${isDragOver ? "border-blue-500 bg-blue-50/10" : "border-white/30"}
          hover:border-white/50
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
          <div className="mx-auto w-10 h-10 text-white/60">
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
            <p className="text-lg font-light text-white">
              Drop up to 10 images here
            </p>
            <p className="text-sm text-white/60">or click to select files</p>
          </div>
          <p className="text-xs text-white/50">
            Supports: JPG, PNG, GIF, WebP (max 10MB each) •{" "}
            {selectedFiles.length}/10 selected
          </p>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-light text-white">
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
                className="relative glass rounded-lg overflow-hidden"
              >
                <div className="aspect-video relative bg-white/5">
                  <Image
                    src={fileObj.previewUrl}
                    alt={fileObj.file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-light text-white truncate">
                    {fileObj.file.name}
                  </p>
                  <p className="text-xs text-white/60">
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
        <div className="flex items-center justify-center p-8 glass rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-white/70">
              Uploading and analyzing {selectedFiles.length} image
              {selectedFiles.length !== 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 glass rounded-lg mb-6 border border-green-500/30">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-green-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-400">Success!</h4>
              <p className="text-sm text-white/70 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 glass rounded-lg mb-6 border border-red-500/30">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5"
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
              <h4 className="text-sm font-medium text-red-400">Upload Error</h4>
              <p className="text-sm text-white/70 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
