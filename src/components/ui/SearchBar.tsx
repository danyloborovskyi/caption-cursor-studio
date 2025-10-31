"use client";

import React, { useState, useCallback } from "react";
import { Button } from "./Button";
import { sanitizeSearchQuery } from "@/lib/security";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  value?: string;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  value = "",
  placeholder = "Search images...",
  isLoading = false,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(value);

  // Update internal state when value prop changes
  React.useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Auto-clear when user manually deletes all text
  React.useEffect(() => {
    // If the search query becomes empty and the parent value is not empty,
    // it means user manually cleared it, so trigger onClear
    if (searchQuery === "" && value !== "") {
      onClear();
    }
  }, [searchQuery, value, onClear]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (trimmed) {
        // Sanitize search query to prevent injection attacks
        const sanitized = sanitizeSearchQuery(trimmed);
        onSearch(sanitized);
      }
    },
    [searchQuery, onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    onClear();
  }, [onClear]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          disabled={isLoading}
          maxLength={200}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
              title="Clear search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading || !searchQuery.trim()}
            className="!py-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
