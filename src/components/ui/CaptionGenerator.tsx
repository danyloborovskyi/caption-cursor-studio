"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

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

    // Clear any existing refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: UploadResponse = await uploadAndAnalyzeImage(selectedImage);

      if (result.success && result.data && result.data.analysis) {
        setCaption(result.data.analysis.caption);
        setConfidence(result.data.analysis.confidence);

        // For single uploads, we don't get the real ID back from the API
        // Use a delayed refresh to reduce flickering and allow backend processing
        refreshTimeoutRef.current = setTimeout(() => {
          refreshGallery();
        }, 1000); // 1 second delay to reduce flickering
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
            relative border border-dashed border-white/30 rounded-2xl p-12 text-center transition-all
            ${isDragOver ? "border-white/60 bg-white/10" : ""}
            hover:border-white/50 hover:bg-white/5
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
            <p className="text-xl font-light text-white">
              Drop image or click to browse
            </p>
            <p className="text-sm text-white/50 font-light">
              JPG, PNG, GIF, WebP up to 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-white/10">
            <Image
              src={previewUrl}
              alt="Preview"
              width={800}
              height={600}
              className="w-full h-auto max-h-80 object-contain"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            {!caption && !isLoading && (
              <Button
                onClick={generateCaption}
                variant="primary"
                className="px-8"
              >
                Generate Caption
              </Button>
            )}
            <Button onClick={clearAll} variant="outline" size="sm">
              Remove
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <p className="text-white font-light">Analyzing image...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-center">
              <p className="text-white/90 font-light text-sm">{error}</p>
            </div>
          )}

          {/* Caption Result */}
          {caption && (
            <div className="p-6 bg-white/10 rounded-2xl border border-white/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-light text-lg leading-relaxed">
                    {caption}
                  </p>
                  {confidence && (
                    <p className="text-white/50 text-sm font-light mt-2">
                      {Math.round(confidence * 100)}% confidence
                    </p>
                  )}
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
