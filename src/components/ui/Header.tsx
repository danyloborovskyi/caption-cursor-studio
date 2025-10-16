"use client";

import React from "react";
import { Button } from "./Button";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const handleGetStarted = () => {
    // Scroll to upload section
    const uploadSection = document.querySelector(
      '[aria-labelledby="upload-section-title"]'
    );
    if (uploadSection) {
      uploadSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3">
            {/* Logo/Icon */}
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Title and Subtitle */}
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Visual Caption & Tag Studio
              </h1>
              <p className="text-sm text-white/70 font-light">
                AI-powered image analysis
              </p>
            </div>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={handleGetStarted}
            variant="primary"
            size="sm"
            className="px-6"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
