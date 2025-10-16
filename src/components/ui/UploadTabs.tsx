"use client";

import React, { useState } from "react";
import { CaptionGenerator } from "./CaptionGenerator";
import { BulkUpload } from "./BulkUpload";

interface UploadTabsProps {
  className?: string;
}

export const UploadTabs: React.FC<UploadTabsProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("single")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "single"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          📸 Single Upload
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "bulk"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          📚 Bulk Upload (up to 3)
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === "single" && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Single Upload:</strong> Upload one image at a time for
                detailed AI analysis with caption and tags.
              </p>
            </div>
            <CaptionGenerator />
          </div>
        )}

        {activeTab === "bulk" && (
          <div>
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <strong>Bulk Upload:</strong> Upload up to 3 images
                simultaneously for batch AI processing.
              </p>
            </div>
            <BulkUpload />
          </div>
        )}
      </div>
    </div>
  );
};
