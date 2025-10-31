"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  bulkUploadAndAnalyzeImages,
  checkRecentFilesAnalyzed,
  UploadResponse,
} from "@/lib/api";
import { useGallery } from "@/lib/contexts";
import { useFileUpload } from "@/hooks";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { Button } from "./Button";

interface BulkUploadProps {
  className?: string;
  onUploadSuccess?: () => void;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
  className = "",
  onUploadSuccess,
}) => {
  const { refreshGallery } = useGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook for file management
  const {
    selectedFiles,
    error: uploadError,
    addFiles,
    removeFile,
    clearFiles,
  } = useFileUpload({
    maxFiles: 10,
    onError: (err) => {
      setError(err);
    },
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isWaitingForAnalysis, setIsWaitingForAnalysis] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [tagStyle, setTagStyle] = useState<"neutral" | "playful" | "seo">(
    "playful"
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
      setError(null);
      setSuccessMessage(null);
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

  const handleRemoveFile = (id: string) => {
    removeFile(id);
    setError(null);
    setSuccessMessage(null);
  };

  const clearAll = useCallback(() => {
    clearFiles();
    setError(null);
    setSuccessMessage(null);
    setIsWaitingForAnalysis(false);
    setAnalysisComplete(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearFiles]);

  const handleUploadSuccess = () => {
    refreshGallery();
    onUploadSuccess?.();
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setIsWaitingForAnalysis(false);
    setAnalysisComplete(false);

    try {
      const files = selectedFiles.map((f) => f.file);
      const result: UploadResponse = await bulkUploadAndAnalyzeImages(
        files,
        tagStyle
      );

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

        console.log(`BulkUpload: Backend processing took ${processingTime}s`);
        console.log(
          `BulkUpload: Starting polling to wait for all ${count} images to be fully analyzed`
        );

        setIsWaitingForAnalysis(true);

        // Poll until all images are fully analyzed
        const pollForAnalysis = async () => {
          let attempts = 0;
          const maxAttempts = 30; // Max 30 attempts (1 minute with 2s intervals)
          const pollInterval = 2000; // Check every 2 seconds

          const checkAnalysis = async (): Promise<void> => {
            attempts++;
            console.log(
              `BulkUpload: Polling attempt ${attempts}/${maxAttempts}`
            );

            const { allAnalyzed, processingCount } =
              await checkRecentFilesAnalyzed(count);

            if (allAnalyzed) {
              console.log(
                "BulkUpload: All images fully analyzed! Refreshing gallery..."
              );
              setIsWaitingForAnalysis(false);
              setAnalysisComplete(true);
              refreshGallery();

              // Show success state briefly, then clear form
              setTimeout(() => {
                clearAll();
                setAnalysisComplete(false);
              }, 2000);
              return;
            }

            if (attempts >= maxAttempts) {
              console.warn(
                `BulkUpload: Max polling attempts reached. ${processingCount} images still processing. Refreshing anyway...`
              );
              setIsWaitingForAnalysis(false);
              refreshGallery();
              // Clear form even if not all analyzed
              clearAll();
              return;
            }

            console.log(
              `BulkUpload: ${processingCount} images still processing, checking again in ${
                pollInterval / 1000
              }s...`
            );
            setTimeout(checkAnalysis, pollInterval);
          };

          // Start initial check after a small delay (backend needs time to save)
          setTimeout(checkAnalysis, 3000);
        };

        pollForAnalysis();

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
      setIsWaitingForAnalysis(false);
      setAnalysisComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tag Style Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-3">
          Tag Style
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTagStyle("neutral")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tagStyle === "neutral"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "glass text-white/70 hover:text-white"
            }`}
          >
            <div className="font-semibold">Neutral</div>
            <div className="text-xs opacity-80 mt-1">
              Professional, balanced descriptions
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTagStyle("playful")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tagStyle === "playful"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "glass text-white/70 hover:text-white"
            }`}
          >
            <div className="font-semibold">Playful</div>
            <div className="text-xs opacity-80 mt-1">
              Creative, engaging language
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTagStyle("seo")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tagStyle === "seo"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "glass text-white/70 hover:text-white"
            }`}
          >
            <div className="font-semibold">SEO</div>
            <div className="text-xs opacity-80 mt-1">
              Search-optimized keywords
            </div>
          </button>
        </div>
      </div>

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
          ref={fileInputRef}
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
          <div className="mb-4">
            <h4 className="font-light text-white text-lg">
              Selected Images ({selectedFiles.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                    className={`object-cover transition-opacity duration-300 ${
                      isWaitingForAnalysis ? "opacity-60" : ""
                    }`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Loading Overlay During Analysis */}
                  {isWaitingForAnalysis && !analysisComplete && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/30 border-t-blue-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-white mt-3 font-medium">
                        Analyzing...
                      </p>
                    </div>
                  )}

                  {/* Success Overlay After Analysis Complete */}
                  {analysisComplete && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                      <div className="relative">
                        <div className="rounded-full h-10 w-10 bg-green-500 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-white mt-3 font-medium">
                        Analyzed ✓
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-light text-white truncate">
                    {fileObj.file.name}
                  </p>
                  <p className="text-xs text-white/60">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isLoading && !isWaitingForAnalysis && (
                  <button
                    onClick={() => handleRemoveFile(fileObj.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!isLoading && !isWaitingForAnalysis && (
              <>
                <Button
                  onClick={uploadFiles}
                  variant="primary"
                  className="px-8 py-3 text-base"
                >
                  Analyze All Images
                </Button>
                <Button onClick={clearAll} variant="outline" className="px-6">
                  Clear All
                </Button>
              </>
            )}
            {isWaitingForAnalysis && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400/30 border-t-blue-400"></div>
                <span className="font-medium">AI Analysis in progress...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6">
          <LoadingState
            message={`Uploading and analyzing ${selectedFiles.length} image${
              selectedFiles.length !== 1 ? "s" : ""
            }...`}
            size="md"
          />
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
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-400">Success!</h4>
              <p className="text-sm text-white/70 mt-1">{successMessage}</p>
              {isWaitingForAnalysis ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                  <p className="text-xs text-white/50">
                    Waiting for AI analysis to complete... Checking every 2
                    seconds
                  </p>
                </div>
              ) : (
                successMessage && (
                  <p className="text-xs text-green-300 mt-2">
                    ✓ Gallery updated with your fully analyzed images!
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorDisplay
          error={error}
          title="Upload Error"
          variant="error"
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
};
