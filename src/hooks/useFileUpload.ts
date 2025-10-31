/**
 * Custom Hook: useFileUpload
 *
 * Handles file upload logic with validation, progress tracking,
 * and error handling. Reduces complexity in BulkUpload component.
 */

import { useState, useCallback } from "react";
import { uploadFile } from "@/lib/api";
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

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  onUploadComplete?: () => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  selectedFiles: SelectedFile[];
  uploadProgress: UploadProgress[];
  isUploading: boolean;
  error: string | null;

  // Actions
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  uploadFiles: (tagStyle: string) => Promise<void>;
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
    onUploadComplete,
    onError,
  } = options;

  // State
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
        const validation = isValidImageFile(file, maxFileSize);

        if (!validation.valid) {
          errorMessage = `${sanitizeFilename(file.name)}: ${validation.error}`;
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

    // Remove from progress if exists
    setUploadProgress((prev) => prev.filter((p) => p.fileId !== id));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
    });
    setSelectedFiles([]);
    setUploadProgress([]);
    setError(null);
  }, [selectedFiles]);

  // Upload files
  const uploadFiles = useCallback(
    async (tagStyle: string) => {
      if (selectedFiles.length === 0) return;

      setIsUploading(true);
      setError(null);

      // Initialize progress
      const initialProgress: UploadProgress[] = selectedFiles.map((file) => ({
        fileId: file.id,
        filename: file.file.name,
        progress: 0,
        status: "pending" as const,
      }));
      setUploadProgress(initialProgress);

      try {
        // Upload files sequentially (can be changed to parallel)
        for (let i = 0; i < selectedFiles.length; i++) {
          const selectedFile = selectedFiles[i];

          // Update status to uploading
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.fileId === selectedFile.id
                ? { ...p, status: "uploading" as const, progress: 50 }
                : p
            )
          );

          try {
            const response = await uploadFile(selectedFile.file, tagStyle);

            if (response.success) {
              // Update status to success
              setUploadProgress((prev) =>
                prev.map((p) =>
                  p.fileId === selectedFile.id
                    ? { ...p, status: "success" as const, progress: 100 }
                    : p
                )
              );
            } else {
              // Update status to error
              setUploadProgress((prev) =>
                prev.map((p) =>
                  p.fileId === selectedFile.id
                    ? {
                        ...p,
                        status: "error" as const,
                        error: response.error || "Upload failed",
                      }
                    : p
                )
              );
            }
          } catch (err) {
            setUploadProgress((prev) =>
              prev.map((p) =>
                p.fileId === selectedFile.id
                  ? {
                      ...p,
                      status: "error" as const,
                      error:
                        err instanceof Error ? err.message : "Upload failed",
                    }
                  : p
              )
            );
          }
        }

        // Check if all uploads succeeded
        const allSuccess = uploadProgress.every((p) => p.status === "success");
        if (allSuccess) {
          onUploadComplete?.();
          clearFiles();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFiles, uploadProgress, onUploadComplete, onError, clearFiles]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedFiles,
    uploadProgress,
    isUploading,
    error,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    clearError,
  };
}
