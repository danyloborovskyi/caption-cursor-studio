/**
 * Custom Hook: useFileUpload
 *
 * Handles file upload logic with validation, progress tracking,
 * and error handling. Reduces complexity in BulkUpload component.
 */

import { useState, useCallback } from "react";
import {
  isValidImageFile,
  sanitizeFilename,
  generateSecureId,
} from "@/lib/security";

export interface SelectedFile {
  file: File;
  previewUrl: string;
  id: string;
}

export interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  onError?: (error: string) => void;
}

export interface UseFileUploadReturn {
  selectedFiles: SelectedFile[];
  error: string | null;

  // Actions
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  clearError: () => void;
}

const DEFAULT_MAX_FILES = 10;
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const {
    maxFiles = DEFAULT_MAX_FILES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    onError,
  } = options;

  // State
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Validate and add files
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: SelectedFile[] = [];
      let errorMessage = "";

      // Check total count
      if (selectedFiles.length + fileArray.length > maxFiles) {
        errorMessage = `Maximum ${maxFiles} files allowed`;
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      // Validate each file
      for (const file of fileArray) {
        const validation = isValidImageFile(file);

        if (!validation.valid) {
          errorMessage = `${sanitizeFilename(file.name)}: ${validation.error}`;
          setError(errorMessage);
          onError?.(errorMessage);
          continue;
        }

        // Check file size separately
        if (file.size > maxFileSize) {
          errorMessage = `${sanitizeFilename(
            file.name
          )}: File too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`;
          setError(errorMessage);
          onError?.(errorMessage);
          continue;
        }

        validFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
          id: generateSecureId(),
        });
      }

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setError(null);
      }
    },
    [selectedFiles.length, maxFiles, maxFileSize, onError]
  );

  // Remove file
  const removeFile = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
    });
    setSelectedFiles([]);
    setError(null);
  }, [selectedFiles]);

  // Note: uploadFiles method removed as BulkUpload component
  // handles the actual upload with bulkUploadAndAnalyzeImages.
  // This hook focuses on file selection, validation, and preview management.

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedFiles,
    error,
    addFiles,
    removeFile,
    clearFiles,
    clearError,
  };
}
