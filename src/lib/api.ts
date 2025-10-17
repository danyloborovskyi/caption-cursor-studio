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
  pagination?: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
    next_page?: number;
    prev_page?: number;
  };
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface SearchResponse {
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
  try {
    if (files.length > 3) {
      throw new Error("Maximum 3 files allowed for bulk upload");
    }

    console.log("🚀 Starting bulk upload with", files.length, "files");
    console.log(
      "Files to upload:",
      files.map((f) => `${f.name} (${f.size} bytes, ${f.type})`)
    );

    // Use the correct field pattern that matches your Postman setup
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    console.log("📤 Using field pattern: images (multiple)");

    const response = await fetch(
      `${API_BASE_URL}/api/upload/bulk-upload-and-analyze`,
      {
        method: "POST",
        body: formData,
        mode: "cors",
      }
    );

    if (response.ok) {
      try {
        const data = await response.json();
        console.log("✅ Bulk upload successful!");
        console.log("✅ Response data:", data);
        return data;
      } catch (parseError) {
        console.error("❌ Failed to parse successful response:", parseError);
        throw new Error("Invalid JSON response from server");
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Bulk upload failed (${response.status}): ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.log("🔄 Bulk upload failed, using individual uploads...");
    try {
      return await bulkUploadFallback(files);
    } catch (fallbackError) {
      console.error("❌ Both bulk upload and fallback failed:", fallbackError);
      return {
        success: false,
        message: "Both bulk upload and individual upload methods failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Fallback: Use multiple single uploads when bulk upload fails
 */
async function bulkUploadFallback(files: File[]): Promise<UploadResponse> {
  try {
    console.log("📤 Starting fallback: multiple single uploads");
    const results = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      console.log(
        `📤 Uploading file ${i + 1}/${files.length}: ${files[i].name}`
      );

      const singleResult = await uploadAndAnalyzeImage(files[i]);

      if (singleResult.success && singleResult.data) {
        successCount++;
        // Convert single upload response to bulk format
        results.push({
          id: Date.now() + i, // Temporary ID since single uploads don't return real IDs
          filename: singleResult.data.filename || files[i].name,
          size: files[i].size,
          type: files[i].type,
          path: `fallback-${Date.now()}-${i}`,
          publicUrl: URL.createObjectURL(files[i]), // Temporary preview URL
          description: singleResult.data.analysis?.caption || "",
          tags: singleResult.data.analysis?.tags || [],
          status: "completed",
          uploadedAt: new Date().toISOString(),
          analyzedAt: new Date().toISOString(),
          analysis: {
            success: true,
            error: null,
          },
        });
      } else {
        console.error(
          `❌ Failed to upload ${files[i].name}:`,
          singleResult.error
        );
      }
    }

    const message =
      successCount === files.length
        ? `✅ All ${successCount} images uploaded successfully (individual uploads)`
        : `⚠️  Individual uploads completed: ${successCount}/${files.length} images uploaded successfully`;

    console.log(message);

    return {
      success: successCount > 0,
      message: message,
      data: {
        successful_uploads: successCount,
        total_attempts: files.length,
        results: results,
      },
    };
  } catch (error) {
    console.error("Fallback upload error:", error);
    return {
      success: false,
      message: "Fallback upload failed",
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

/**
 * Delete a file by ID
 */
export async function deleteFile(fileId: number): Promise<DeleteResponse> {
  try {
    console.log(`Deleting file with ID: ${fileId}`);

    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: "DELETE",
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Delete API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      message: "Failed to delete file",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Interface for upload data that can be converted to FileItem
 */
export interface UploadData {
  id?: number;
  filename?: string;
  path?: string;
  file_path?: string;
  size?: number;
  file_size?: number;
  type?: string;
  mime_type?: string;
  publicUrl?: string;
  public_url?: string;
  description?: string;
  tags?: string[];
  status?: string;
  uploadedAt?: string;
  uploaded_at?: string;
  analyzedAt?: string;
  updated_at?: string;
  file_size_mb?: string;
  analysis?: {
    success?: boolean;
    error?: string | null;
  };
}

/**
 * Convert upload response data to FileItem format
 */
export function convertUploadToFileItem(uploadData: UploadData): FileItem {
  return {
    id: uploadData.id || 0,
    filename: uploadData.filename || "unknown-file",
    file_path: uploadData.path || uploadData.file_path || "",
    file_size: uploadData.size || uploadData.file_size || 0,
    mime_type:
      uploadData.type || uploadData.mime_type || "application/octet-stream",
    public_url: uploadData.publicUrl || uploadData.public_url || "",
    description: uploadData.description || "",
    tags: uploadData.tags || [],
    status: uploadData.status || "completed",
    uploaded_at:
      uploadData.uploadedAt ||
      uploadData.uploaded_at ||
      new Date().toISOString(),
    updated_at:
      uploadData.analyzedAt ||
      uploadData.updated_at ||
      new Date().toISOString(),
    file_size_mb:
      uploadData.file_size_mb ||
      ((uploadData.size || uploadData.file_size || 0) / (1024 * 1024)).toFixed(
        2
      ),
    has_ai_analysis: uploadData.analysis?.success ?? true,
    is_image:
      uploadData.type?.startsWith("image/") ||
      uploadData.mime_type?.startsWith("image/") ||
      true,
  };
}

/**
 * Search for files by query
 */
export async function searchFiles(query: string): Promise<SearchResponse> {
  try {
    if (!query.trim()) {
      return {
        success: true,
        data: [],
      };
    }

    console.log(`Searching files with query: "${query}"`);

    const response = await fetch(
      `${API_BASE_URL}/api/files/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        mode: "cors",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Search API response:", data);
    return data;
  } catch (error) {
    console.error("Error searching files:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
