const API_BASE_URL = "https://caption-studio-back.onrender.com";

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    successful_uploads?: number;
    total_attempts?: number;
    results?: Array<{
      id: number;
      filename: string;
      size: number;
      type: string;
      path: string;
      publicUrl: string;
      description: string;
      tags: string[];
      status: string;
      uploadedAt: string;
      analyzedAt: string;
      analysis: {
        success: boolean;
        error: null | string;
      };
    }>;
    // Keep backward compatibility for single upload
    filename?: string;
    analysis?: {
      caption: string;
      confidence: number;
      tags?: string[];
    };
  };
  error?: string;
}

export interface FileItem {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  public_url: string;
  description: string;
  tags: string[];
  status: string;
  uploaded_at: string;
  updated_at: string;
  file_size_mb: string;
  has_ai_analysis: boolean;
  is_image: boolean;
}

export interface FilesResponse {
  success: boolean;
  data: FileItem[];
  error?: string;
}

/**
 * Upload a single image and get AI-generated caption
 */
export async function uploadAndAnalyzeImage(
  file: File
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_BASE_URL}/api/upload/upload-and-analyze`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading and analyzing image:", error);
    return {
      success: false,
      message: "Failed to upload and analyze image",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upload multiple images (up to 3) and get AI-generated captions
 */
export async function bulkUploadAndAnalyzeImages(
  files: File[]
): Promise<UploadResponse> {
  // Try multiple field naming patterns since backends can vary
  const fieldPatterns = [
    // Pattern 1: image1, image2, image3 (most common)
    (formData: FormData, files: File[]) => {
      files.forEach((file, index) => {
        formData.append(`image${index + 1}`, file);
      });
      return "image1, image2, image3";
    },
    // Pattern 2: images[] (array notation)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("images[]", file);
      });
      return "images[]";
    },
    // Pattern 3: images (without brackets)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("images", file);
      });
      return "images (multiple)";
    },
    // Pattern 4: files[] (generic files array)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("files[]", file);
      });
      return "files[]";
    },
    // Pattern 5: files (without brackets)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("files", file);
      });
      return "files (multiple)";
    },
    // Pattern 6: uploads[] (specific to upload endpoints)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("uploads[]", file);
      });
      return "uploads[]";
    },
    // Pattern 7: file (single field name for multiple files)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("file", file);
      });
      return "file (multiple)";
    },
    // Pattern 8: image (single field name, backend might expect this)
    (formData: FormData, files: File[]) => {
      files.forEach((file) => {
        formData.append("image", file);
      });
      return "image (multiple)";
    },
    // Pattern 9: Try specific naming that might match your backend
    (formData: FormData, files: File[]) => {
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      return "file_0, file_1, file_2";
    },
  ];

  try {
    if (files.length > 3) {
      throw new Error("Maximum 3 files allowed for bulk upload");
    }

    // Try each pattern until one succeeds
    for (let i = 0; i < fieldPatterns.length; i++) {
      const formData = new FormData();
      const patternName = fieldPatterns[i](formData, files);

      console.log(`Attempt ${i + 1}: Using field pattern: ${patternName}`);
      console.log(
        "Files to upload:",
        files.map((f) => `${f.name} (${f.size} bytes, ${f.type})`)
      );

      // Debug: Log all FormData entries
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `${value.name} (${value.size} bytes)` : value
        );
      }

      console.log(
        "Sending bulk upload request to:",
        `${API_BASE_URL}/api/upload/bulk-upload-and-analyze`
      );

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/upload/bulk-upload-and-analyze`,
          {
            method: "POST",
            body: formData,
          }
        );

        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Bulk upload successful with pattern:", patternName);
          console.log("Response data:", data);
          return data;
        } else {
          // Get error details
          let errorText = "";
          try {
            errorText = await response.text();
            console.error(
              `Pattern ${patternName} failed (${response.status}):`,
              errorText
            );
          } catch (_e) {
            console.error(
              `Pattern ${patternName} failed (${response.status}): Could not read error response`
            );
          }

          // If this is the last pattern, throw the error
          if (i === fieldPatterns.length - 1) {
            throw new Error(
              `HTTP error! status: ${response.status} - ${errorText}`
            );
          }

          // Continue to next pattern
          console.log(`Trying next pattern...`);
          continue;
        }
      } catch (networkError) {
        console.error(
          `Network error with pattern ${patternName}:`,
          networkError
        );

        // If this is the last pattern, throw the error
        if (i === fieldPatterns.length - 1) {
          throw networkError;
        }

        // Continue to next pattern
        continue;
      }
    }

    throw new Error("All field patterns failed");
  } catch (error) {
    console.error("Error bulk uploading and analyzing images:", error);
    return {
      success: false,
      message: "Failed to bulk upload and analyze images",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of all uploaded files with pagination
 */
export async function getFiles(page = 1, limit = 10): Promise<FilesResponse> {
  try {
    console.log(
      `Fetching files from: ${API_BASE_URL}/api/files/?page=${page}&limit=${limit}`
    );

    // Don't send Content-Type header for GET requests to avoid CORS preflight
    const response = await fetch(
      `${API_BASE_URL}/api/files/?page=${page}&limit=${limit}`,
      {
        method: "GET",
        mode: "cors",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching files:", error);

    // Enhanced error logging for CORS debugging
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error(
        "CORS or Network Error: Check if backend allows your domain"
      );
      console.error("Backend URL:", `${API_BASE_URL}/api/files/`);
    }

    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
