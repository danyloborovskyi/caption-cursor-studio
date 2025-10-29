"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FileItem } from "@/lib/api";
import { Button } from "./Button";

interface ImageCardProps {
  photo: FileItem;
  isDeleting: boolean;
  onDelete: (photo: FileItem) => void;
  searchQuery?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  photo,
  isDeleting,
  onDelete,
  searchQuery = "",
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedDescription, setCopiedDescription] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

  // Check if we have a valid image URL
  const hasValidImage =
    photo.publicUrl && photo.publicUrl !== "." && photo.publicUrl.trim() !== "";

  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative">
      {/* Image */}
      <div className="aspect-square relative bg-white/5">
        {hasValidImage ? (
          <Image
            src={photo.publicUrl}
            alt={photo.description || photo.filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/30 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs">Image unavailable</p>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Description */}
        {photo.description && (
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs text-white/50 font-light">
                Description:
              </span>
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
            </div>
            <div className="relative">
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
            </div>
          </div>
        )}

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-white/50 font-light">Tags:</span>
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
            </div>
            <div className="flex flex-wrap gap-2">
              {photo.tags.slice(0, 5).map((tag, index) => {
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
              {photo.tags.length > 5 && (
                <span className="px-3 py-1 text-xs bg-white/10 text-white/60 rounded-full font-light border border-white/20">
                  +{photo.tags.length - 5} more
                </span>
              )}
            </div>
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
