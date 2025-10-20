"use client";

import React from "react";
import { BulkUpload } from "./BulkUpload";

interface UploadTabsProps {
  className?: string;
}

export const UploadTabs: React.FC<UploadTabsProps> = ({ className = "" }) => {
  return (
    <div className={`w-full ${className}`}>
      <BulkUpload />
    </div>
  );
};
