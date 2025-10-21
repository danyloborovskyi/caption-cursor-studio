"use client";

import React from "react";
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
  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden transition-all duration-300">
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
      <div className="p-6">
        {/* Description */}
        {photo.description && (
          <p className="text-white/80 text-sm mb-3 line-clamp-2 font-light">
            {photo.description}
          </p>
        )}

        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="mb-4">
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

        {/* Delete Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(photo)}
          disabled={isDeleting}
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
  );
};
