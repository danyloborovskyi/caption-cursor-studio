"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FileItem, updateFile } from "@/lib/api";
import { Button } from "./Button";

interface MyImageCardProps {
  photo: FileItem;
  isDeleting: boolean;
  onDelete: (photo: FileItem) => void;
  searchQuery?: string;
  onUpdate?: (updatedPhoto: FileItem) => void;
}

export const MyImageCard: React.FC<MyImageCardProps> = ({
  photo,
  isDeleting,
  onDelete,
  searchQuery = "",
  onUpdate,
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

  // Check if tags overflow
  useEffect(() => {
    if (tagsContainerRef.current && !isEditingTags) {
      const container = tagsContainerRef.current;
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
        updates.filename = editedFilename.trim();
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
      {/* Image */}
      <div className="aspect-square relative bg-white/5">
        <Image
          src={photo.public_url}
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
        <div className="mb-3 pb-3 border-b border-white/10">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-xs text-white/50 font-light">File:</span>
            {!isEditingFilename && (
              <button
                onClick={handleEditFilename}
                className="text-xs text-green-300 hover:text-green-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Edit filename"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit</span>
              </button>
            )}
          </div>
          {isEditingFilename ? (
            <input
              type="text"
              value={editedFilename}
              onChange={(e) => setEditedFilename(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter filename..."
            />
          ) : (
            <p
              className="text-white/90 text-sm font-medium truncate"
              title={photo.filename}
            >
              {highlightText(photo.filename)}
            </p>
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
                  <>
                    <button
                      onClick={handleEditDescription}
                      className="text-xs text-green-300 hover:text-green-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Edit description"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleCopyDescription}
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
                  </>
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
                />
              ) : (
                <>
                  <p
                    className={`text-white/80 text-sm font-light transition-all ${
                      isDescriptionExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {highlightText(photo.description)}
                  </p>
                  {photo.description.length > 100 && (
                    <button
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
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
                  <>
                    <button
                      onClick={handleEditTags}
                      className="text-xs text-green-300 hover:text-green-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Edit tags"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleCopyTags}
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
                  </>
                )}
              </div>
            </div>
            {isEditingTags ? (
              <input
                type="text"
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter tags separated by commas..."
              />
            ) : (
              <>
                <div
                  ref={tagsContainerRef}
                  className={`flex flex-wrap gap-2 transition-all duration-300 overflow-hidden ${
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
                {/* Show more/less button and creation date on same line */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1">
                    {(hasTagsOverflow || isTagsExpanded) && (
                      <button
                        onClick={() => setIsTagsExpanded(!isTagsExpanded)}
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
                  {photo.uploaded_at && (
                    <div className="text-right">
                      <p className="text-white/50 text-xs font-light">
                        {new Date(photo.uploaded_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
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

        {/* Delete Button - Stuck to Bottom */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting || showConfirmation}
            className="w-full text-red-300 hover:!text-red-600 hover:!bg-white border-red-300/50 hover:!border-white disabled:opacity-50 transition-colors"
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
    </div>
  );
};
