"use client";

import React, { useState } from "react";
import Image from "next/image";
import { uploadAndAnalyzeImage, UploadResponse } from "@/lib/api";
import { useGallery } from "@/lib/contexts";
import { Button } from "./Button";

interface CaptionGeneratorProps {
  className?: string;
}

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const { refreshGallery } = useGallery();

  const handleImageSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    // Clear previous states
    setError(null);
    setCaption(null);
    setConfidence(null);

    // Set new file
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
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

  const generateCaption = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const result: UploadResponse = await uploadAndAnalyzeImage(selectedImage);

      if (result.success && result.data && result.data.analysis) {
        setCaption(result.data.analysis.caption);
        setConfidence(result.data.analysis.confidence);

        // For single uploads, we don't get the real ID back from the API
        // So we need to refresh the gallery to get the actual data
        // This is different from bulk uploads which return proper IDs
        refreshGallery();
      } else {
        setError(
          result.error || result.message || "Failed to generate caption"
        );
      }
    } catch (err) {
      setError("An unexpected error occurred while generating caption");
      console.error("Caption generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setCaption(null);
    setError(null);
    setConfidence(null);
  };

  const copyCaption = async () => {
    if (caption) {
      try {
        await navigator.clipboard.writeText(caption);
        // You could add a toast notification here
        alert("Caption copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy caption:", err);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      {!previewUrl ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
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
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
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
                Drop your image here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supports: JPG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={previewUrl}
              alt="Preview"
              width={800}
              height={600}
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          {/* File Info and Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600 dark:text-green-400"
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedImage?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedImage &&
                    `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!caption && (
                <Button
                  onClick={generateCaption}
                  disabled={isLoading}
                  variant="primary"
                >
                  {isLoading ? "Generating..." : "Generate Caption"}
                </Button>
              )}
              <Button onClick={clearAll} variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-8 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-blue-700 dark:text-blue-300">
                  AI is analyzing your image...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
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
                    Error generating caption
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Caption Result */}
          {caption && (
            <div className="p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Generated Caption
                    {confidence && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        ({Math.round(confidence * 100)}% confidence)
                      </span>
                    )}
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-base leading-relaxed">
                    {caption}
                  </p>
                </div>
                <Button onClick={copyCaption} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
