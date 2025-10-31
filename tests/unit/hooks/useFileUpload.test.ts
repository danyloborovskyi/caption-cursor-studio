import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "@/hooks/useFileUpload";

// Mock the security functions
vi.mock("@/lib/security", () => ({
  isValidImageFile: vi.fn((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type" };
    }
    return { valid: true };
  }),
  sanitizeFilename: vi.fn((filename: string) => filename),
  generateSecureId: vi.fn(() => Math.random().toString(36).substring(7)),
}));

describe("useFileUpload Hook", () => {
  // Helper to create mock File objects
  const createMockFile = (name: string, size: number, type: string): File => {
    const blob = new Blob(["x".repeat(size)], { type });
    return new File([blob], name, { type });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  describe("Initialization", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.selectedFiles).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("should accept custom options", () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useFileUpload({
          maxFiles: 5,
          maxFileSize: 5 * 1024 * 1024,
          onError,
        })
      );

      expect(result.current.selectedFiles).toEqual([]);
    });
  });

  describe("addFiles", () => {
    it("should add valid image files", () => {
      const { result } = renderHook(() => useFileUpload());

      const file1 = createMockFile("test1.jpg", 1000, "image/jpeg");
      const file2 = createMockFile("test2.png", 2000, "image/png");

      act(() => {
        result.current.addFiles([file1, file2]);
      });

      expect(result.current.selectedFiles).toHaveLength(2);
      expect(result.current.selectedFiles[0].file).toBe(file1);
      expect(result.current.selectedFiles[1].file).toBe(file2);
      expect(result.current.error).toBeNull();
    });

    it("should generate preview URLs for files", () => {
      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile("test.jpg", 1000, "image/jpeg");

      act(() => {
        result.current.addFiles([file]);
      });

      expect(result.current.selectedFiles[0].previewUrl).toBe("mock-url");
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it("should generate unique IDs for files", () => {
      const { result } = renderHook(() => useFileUpload());

      const file1 = createMockFile("test1.jpg", 1000, "image/jpeg");
      const file2 = createMockFile("test2.jpg", 1000, "image/jpeg");

      act(() => {
        result.current.addFiles([file1, file2]);
      });

      const id1 = result.current.selectedFiles[0].id;
      const id2 = result.current.selectedFiles[1].id;

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it("should reject invalid file types", () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      const invalidFile = createMockFile("test.txt", 1000, "text/plain");

      act(() => {
        result.current.addFiles([invalidFile]);
      });

      expect(result.current.selectedFiles).toHaveLength(0);
      expect(result.current.error).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });

    it("should reject files exceeding size limit", () => {
      const onError = vi.fn();
      const maxSize = 5 * 1024 * 1024; // 5MB
      const { result } = renderHook(() =>
        useFileUpload({ maxFileSize: maxSize, onError })
      );

      const largeFile = createMockFile("large.jpg", maxSize + 1, "image/jpeg");

      act(() => {
        result.current.addFiles([largeFile]);
      });

      expect(result.current.selectedFiles).toHaveLength(0);
      expect(result.current.error).toContain("too large");
      expect(onError).toHaveBeenCalled();
    });

    it("should respect maxFiles limit", () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useFileUpload({ maxFiles: 2, onError })
      );

      const files = [
        createMockFile("test1.jpg", 1000, "image/jpeg"),
        createMockFile("test2.jpg", 1000, "image/jpeg"),
        createMockFile("test3.jpg", 1000, "image/jpeg"),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.selectedFiles).toHaveLength(0);
      expect(result.current.error).toContain("Maximum 2 files");
      expect(onError).toHaveBeenCalled();
    });

    it("should add files incrementally up to maxFiles", () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 3 }));

      const file1 = createMockFile("test1.jpg", 1000, "image/jpeg");
      const file2 = createMockFile("test2.jpg", 1000, "image/jpeg");

      act(() => {
        result.current.addFiles([file1]);
      });

      expect(result.current.selectedFiles).toHaveLength(1);

      act(() => {
        result.current.addFiles([file2]);
      });

      expect(result.current.selectedFiles).toHaveLength(2);
    });

    it("should clear error on successful file addition", () => {
      const { result } = renderHook(() => useFileUpload());

      // First add invalid file
      const invalidFile = createMockFile("test.txt", 1000, "text/plain");
      act(() => {
        result.current.addFiles([invalidFile]);
      });

      expect(result.current.error).toBeTruthy();

      // Then add valid file
      const validFile = createMockFile("test.jpg", 1000, "image/jpeg");
      act(() => {
        result.current.addFiles([validFile]);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("removeFile", () => {
    it("should remove file by ID", () => {
      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile("test.jpg", 1000, "image/jpeg");

      act(() => {
        result.current.addFiles([file]);
      });

      const fileId = result.current.selectedFiles[0].id;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(result.current.selectedFiles).toHaveLength(0);
    });

    it("should revoke preview URL when removing file", () => {
      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile("test.jpg", 1000, "image/jpeg");

      act(() => {
        result.current.addFiles([file]);
      });

      const fileId = result.current.selectedFiles[0].id;
      const previewUrl = result.current.selectedFiles[0].previewUrl;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(previewUrl);
    });

    it("should only remove specified file", () => {
      const { result } = renderHook(() => useFileUpload());

      const file1 = createMockFile("test1.jpg", 1000, "image/jpeg");
      const file2 = createMockFile("test2.jpg", 1000, "image/jpeg");

      act(() => {
        result.current.addFiles([file1, file2]);
      });

      const fileId1 = result.current.selectedFiles[0].id;

      act(() => {
        result.current.removeFile(fileId1);
      });

      expect(result.current.selectedFiles).toHaveLength(1);
      expect(result.current.selectedFiles[0].file).toBe(file2);
    });
  });

  describe("clearFiles", () => {
    it("should clear all files", () => {
      const { result } = renderHook(() => useFileUpload());

      const files = [
        createMockFile("test1.jpg", 1000, "image/jpeg"),
        createMockFile("test2.jpg", 1000, "image/jpeg"),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.selectedFiles).toHaveLength(2);

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.selectedFiles).toHaveLength(0);
    });

    it("should revoke all preview URLs when clearing", () => {
      const { result } = renderHook(() => useFileUpload());

      const files = [
        createMockFile("test1.jpg", 1000, "image/jpeg"),
        createMockFile("test2.jpg", 1000, "image/jpeg"),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      act(() => {
        result.current.clearFiles();
      });

      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });

    it("should clear error when clearing files", () => {
      const { result } = renderHook(() => useFileUpload());

      // Add invalid file to set error
      const invalidFile = createMockFile("test.txt", 1000, "text/plain");
      act(() => {
        result.current.addFiles([invalidFile]);
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      const { result } = renderHook(() => useFileUpload());

      // Set error by adding invalid file
      const invalidFile = createMockFile("test.txt", 1000, "text/plain");
      act(() => {
        result.current.addFiles([invalidFile]);
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
