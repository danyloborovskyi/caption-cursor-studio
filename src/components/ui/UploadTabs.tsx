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
      <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("single")}
          className={`w-full px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "single"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          📸 Single Upload
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`w-full px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
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
            <CaptionGenerator />
          </div>
        )}

        {activeTab === "bulk" && (
          <div>
            <BulkUpload />
          </div>
        )}
      </div>
    </div>
  );
};
