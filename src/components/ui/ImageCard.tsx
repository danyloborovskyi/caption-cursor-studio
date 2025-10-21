"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FileItem } from "@/lib/api";
import { Button } from "./Button";

interface ImageCardProps {
  photo: FileItem;
  isDeleting: boolean;
  onDelete: (photo: FileItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  photo,
  isDeleting,
  onDelete,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

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
        {/* Description */}
        {photo.description && (
          <p className="text-white/80 text-sm mb-3 line-clamp-2 font-light">
            {photo.description}
          </p>
        )}

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="flex flex-wrap gap-2">
              {photo.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs bg-blue-500/20 text-blue-200 rounded-full font-light border border-blue-400/30"
                >
                  {tag}
                </span>
              ))}
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
            className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/20 border-red-300/50 hover:border-red-300/70 disabled:opacity-50 transition-colors"
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
