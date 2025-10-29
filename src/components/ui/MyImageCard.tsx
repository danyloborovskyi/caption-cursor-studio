"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FileItem, updateFile, regenerateFile, downloadFile } from "@/lib/api";
import { Button } from "./Button";
import { ConfirmationModal } from "./ConfirmationModal";

interface MyImageCardProps {
  photo: FileItem;
  isDeleting: boolean;
  onDelete: (photo: FileItem) => void;
  searchQuery?: string;
  onUpdate?: (updatedPhoto: FileItem) => void;
  isBulkDeleteMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  isBulkRegenerateMode?: boolean;
  isRegenerateSelected?: boolean;
  onRegenerateSelect?: (id: number) => void;
  isBulkDownloadMode?: boolean;
  isDownloadSelected?: boolean;
  onDownloadSelect?: (id: number) => void;
}

export const MyImageCard: React.FC<MyImageCardProps> = ({
  photo,
  isDeleting,
  onDelete,
  searchQuery = "",
  onUpdate,
  isBulkDeleteMode = false,
  isSelected = false,
  onSelect,
  isBulkRegenerateMode = false,
  isRegenerateSelected = false,
  onRegenerateSelect,
  isBulkDownloadMode = false,
  isDownloadSelected = false,
  onDownloadSelect,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedDescription, setCopiedDescription] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [hasTagsOverflow, setHasTagsOverflow] = useState(false);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  // Edit states
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    photo.description || ""
  );
  const [editedTags, setEditedTags] = useState((photo.tags || []).join(", "));
  const [editedFilename, setEditedFilename] = useState(photo.filename || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Regenerate state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if tags overflow
  useEffect(() => {
    if (tagsContainerRef.current && !isEditingTags) {
      // Wait for animation to complete before checking
      const timer = setTimeout(
        () => {
          if (tagsContainerRef.current) {
            const hasOverflow =
              tagsContainerRef.current.scrollHeight >
              tagsContainerRef.current.clientHeight;
            setHasTagsOverflow(hasOverflow);
          }
        },
        isTagsExpanded ? 0 : 350
      ); // Wait for collapse animation
      return () => clearTimeout(timer);
    }
  }, [photo.tags, isEditingTags, isTagsExpanded]);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    onDelete(photo);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleRegenerateClick = () => {
    setShowRegenerateConfirm(true);
  };

  const handleConfirmRegenerate = async () => {
    if (isRegenerating) return;

    setShowRegenerateConfirm(false);
    setIsRegenerating(true);
    setRegenerateError(null);
    setRegenerateSuccess(false);

    try {
      const result = await regenerateFile(photo.id);

      if (result.success && result.data) {
        setRegenerateSuccess(true);
        setTimeout(() => setRegenerateSuccess(false), 3000);

        // Update the local state with new data
        setEditedDescription(result.data.description || "");
        setEditedTags((result.data.tags || []).join(", "));

        // Call onUpdate to refresh the parent component
        if (onUpdate) {
          onUpdate(result.data);
        }
      } else {
        setRegenerateError(result.error || "Failed to regenerate AI analysis");
        setTimeout(() => setRegenerateError(null), 5000);
      }
    } catch (error) {
      setRegenerateError("An unexpected error occurred");
      setTimeout(() => setRegenerateError(null), 5000);
      console.error("Regenerate error:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCancelRegenerate = () => {
    setShowRegenerateConfirm(false);
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const blob = await downloadFile(photo.id);

      if (blob) {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = photo.filename || `image-${photo.id}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyTags = async () => {
    if (!photo.tags || photo.tags.length === 0) return;

    const tagsText = photo.tags.join(", ");
    try {
      await navigator.clipboard.writeText(tagsText);
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    } catch (err) {
      console.error("Failed to copy tags:", err);
    }
  };

  const handleCopyDescription = async () => {
    if (!photo.description) return;

    try {
      await navigator.clipboard.writeText(photo.description);
      setCopiedDescription(true);
      setTimeout(() => setCopiedDescription(false), 2000);
    } catch (err) {
      console.error("Failed to copy description:", err);
    }
  };

  const handleEditDescription = () => {
    setEditedDescription(photo.description || "");
    setIsEditingDescription(true);
    setSaveError(null);
  };

  const handleEditTags = () => {
    setEditedTags((photo.tags || []).join(", "));
    setIsEditingTags(true);
    setSaveError(null);
  };

  const handleEditFilename = () => {
    setEditedFilename(photo.filename || "");
    setIsEditingFilename(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setIsEditingTags(false);
    setIsEditingFilename(false);
    setEditedDescription(photo.description || "");
    setEditedTags((photo.tags || []).join(", "));
    setEditedFilename(photo.filename || "");
    setSaveError(null);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updates: {
        description?: string;
        tags?: string[];
        filename?: string;
      } = {};

      if (isEditingDescription) {
        updates.description = editedDescription.trim();
      }

      if (isEditingTags) {
        // Split tags by comma and clean them
        const tagsArray = editedTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        updates.tags = tagsArray;
      }

      if (isEditingFilename) {
        let filename = editedFilename.trim();

        // Check if filename has an extension
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(filename);

        // If no extension, add .jpg
        if (!hasExtension && filename.length > 0) {
          filename = `${filename}.jpg`;
        }

        updates.filename = filename;
        // Update the local state to reflect the added extension
        setEditedFilename(filename);
      }

      const result = await updateFile(photo.id, updates);

      if (result.success && result.data) {
        setSaveSuccess(true);
        setIsEditingDescription(false);
        setIsEditingTags(false);
        setIsEditingFilename(false);

        // Call onUpdate callback if provided
        if (onUpdate && result.data) {
          onUpdate(result.data);
        }

        // Show success message briefly
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        setSaveError(result.error || "Failed to update");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const isTagHighlighted = (tag: string) => {
    if (!searchQuery || !searchQuery.trim()) return false;
    return tag.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const highlightText = (text: string) => {
    if (!searchQuery || !searchQuery.trim()) return text;

    const query = searchQuery.trim();
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-yellow-500/40 text-yellow-100 font-medium px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative">
      {/* Bulk Delete Checkbox */}
      {/* Custom checkbox for bulk delete */}
      {isBulkDeleteMode && onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(photo.id);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
              isSelected
                ? "bg-red-500 border-red-500"
                : "bg-white/10 border-white/40 backdrop-blur-sm hover:border-white/60"
            }`}
          >
            {isSelected && (
              <svg
                className="w-5 h-5 text-white"
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
            )}
          </button>
        </div>
      )}

      {/* Custom checkbox for bulk regenerate */}
      {isBulkRegenerateMode && onRegenerateSelect && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerateSelect(photo.id);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
              isRegenerateSelected
                ? "bg-blue-500 border-blue-500"
                : "bg-white/10 border-white/40 backdrop-blur-sm hover:border-white/60"
            }`}
          >
            {isRegenerateSelected && (
              <svg
                className="w-5 h-5 text-white"
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
            )}
          </button>
        </div>
      )}

      {/* Custom checkbox for bulk download */}
      {isBulkDownloadMode && onDownloadSelect && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadSelect(photo.id);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 ${
              isDownloadSelected
                ? "bg-green-500 border-green-500"
                : "bg-white/10 border-white/40 backdrop-blur-sm hover:border-white/60"
            }`}
          >
            {isDownloadSelected && (
              <svg
                className="w-5 h-5 text-white"
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
            )}
          </button>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square relative bg-white/5">
        <Image
          src={photo.publicUrl}
          alt={photo.description || photo.filename}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Filename */}
        <div className="mb-3">
          {isEditingFilename ? (
            <>
              <div className="mb-1">
                <span className="text-xs text-white/50 font-light">File:</span>
              </div>
              <input
                type="text"
                value={editedFilename}
                onChange={(e) => setEditedFilename(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter filename..."
                autoFocus
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-light">File:</span>
              <p
                onClick={handleEditFilename}
                className="text-white/90 text-sm font-medium truncate cursor-pointer hover:text-white hover:bg-white/5 px-2 py-1 rounded transition-all flex-1"
                title={photo.filename}
              >
                {highlightText(photo.filename)}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {photo.description && (
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs text-white/50 font-light">
                Description:
              </span>
              <div className="flex items-center gap-2">
                {!isEditingDescription && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyDescription();
                    }}
                    className="text-xs text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy description"
                  >
                    {copiedDescription ? (
                      <>
                        <svg
                          className="w-3 h-3"
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
                        <span className="text-green-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              {isEditingDescription ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  rows={3}
                  placeholder="Enter description..."
                  autoFocus
                />
              ) : (
                <>
                  <p
                    onClick={handleEditDescription}
                    className={`text-white/80 text-sm font-light transition-all cursor-pointer hover:text-white hover:bg-white/5 px-2 py-1 rounded ${
                      isDescriptionExpanded ? "" : "line-clamp-2"
                    }`}
                    title={photo.description}
                  >
                    {highlightText(photo.description)}
                  </p>
                  {photo.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded(!isDescriptionExpanded);
                      }}
                      className="text-xs text-blue-300 hover:text-blue-200 transition-colors mt-1 cursor-pointer font-light"
                    >
                      {isDescriptionExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-white/50 font-light">Tags:</span>
              <div className="flex items-center gap-2">
                {!isEditingTags && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTags();
                    }}
                    className="text-xs text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy all tags"
                  >
                    {copiedTags ? (
                      <>
                        <svg
                          className="w-3 h-3"
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
                        <span className="text-green-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            {isEditingTags ? (
              <textarea
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                placeholder="Enter tags separated by commas..."
                autoFocus
              />
            ) : (
              <>
                <div
                  ref={tagsContainerRef}
                  onClick={handleEditTags}
                  className={`flex flex-wrap gap-2 transition-all duration-300 overflow-hidden cursor-pointer hover:bg-white/5 px-2 py-1 rounded ${
                    isTagsExpanded ? "max-h-96" : "max-h-[4.5rem]"
                  }`}
                >
                  {photo.tags.map((tag, index) => {
                    const isHighlighted = isTagHighlighted(tag);
                    return (
                      <span
                        key={index}
                        className={`px-3 py-1 text-xs rounded-full font-light transition-all ${
                          isHighlighted
                            ? "bg-yellow-500/30 text-yellow-200 border-2 border-yellow-400/60 shadow-lg shadow-yellow-500/20 font-medium"
                            : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                        }`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
                {/* Show more/less button */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1">
                    {(hasTagsOverflow || isTagsExpanded) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTagsExpanded(!isTagsExpanded);
                        }}
                        className="text-xs text-blue-300 hover:text-blue-200 transition-colors cursor-pointer font-light flex items-center gap-1"
                      >
                        <span>
                          {isTagsExpanded ? "Show less" : "Show more"}
                        </span>
                        <svg
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isTagsExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Save/Cancel Buttons - Show when editing */}
        {(isEditingDescription || isEditingTags || isEditingFilename) && (
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg text-xs text-green-300">
            ✓ Changes saved successfully!
          </div>
        )}
        {saveError && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
            {saveError}
          </div>
        )}

        {/* Regenerate Messages */}
        {regenerateSuccess && (
          <div className="mb-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg text-xs text-green-300">
            ✓ AI analysis regenerated successfully!
          </div>
        )}
        {regenerateError && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
            {regenerateError}
          </div>
        )}

        {/* Action Buttons - Stuck to Bottom */}
        <div className="mt-auto">
          {/* Action Buttons Row */}
          <div className="flex gap-2">
            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || isDeleting || isRegenerating}
              className="flex-1 text-green-300 hover:!text-green-600 hover:!bg-white border-green-300/50 hover:!border-white disabled:opacity-50 transition-colors"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isDownloading ? "Downloading..." : "Download"}
            </Button>

            {/* Regenerate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateClick}
              disabled={
                isRegenerating ||
                isDeleting ||
                showConfirmation ||
                isDownloading
              }
              className="flex-1 text-blue-300 hover:!text-blue-600 hover:!bg-white border-blue-300/50 hover:!border-white disabled:opacity-50 transition-colors"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </Button>

            {/* Delete Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={
                isDeleting ||
                showConfirmation ||
                isRegenerating ||
                isDownloading
              }
              className="flex-1 text-red-300 hover:!text-red-600 hover:!bg-white border-red-300/50 hover:!border-white disabled:opacity-50 transition-colors"
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
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>

          {/* Dates under delete button */}
          <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
            {photo.uploadedAt && (
              <p className="text-white/50 text-xs font-light">
                Created:{" "}
                {new Date(photo.uploadedAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {photo.updatedAt && (
              <p className="text-white/40 text-xs font-light">
                Updated:{" "}
                {new Date(photo.updatedAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inline Confirmation Overlay */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in z-10">
          <div className="text-center">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Image?
            </h3>

            {/* Message */}
            <p className="text-white/70 text-sm mb-4 font-light">
              This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelDelete}
                className="flex-1 text-white/80 hover:text-white border-white/30 hover:border-white/50"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRegenerateConfirm}
        title="Regenerate AI Analysis?"
        message="This will overwrite the current description and tags with new AI-generated content. This action cannot be undone."
        confirmText="Regenerate"
        cancelText="Cancel"
        onConfirm={handleConfirmRegenerate}
        onCancel={handleCancelRegenerate}
        variant="warning"
        isLoading={isRegenerating}
      />
    </div>
  );
};
