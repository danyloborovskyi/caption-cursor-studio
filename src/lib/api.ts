const API_BASE_URL = "https://caption-studio-back.onrender.com";

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    analysis: {
      caption: string;
      confidence: number;
      tags?: string[];
    };
  };
  error?: string;
}

export interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  analysis?: {
    caption: string;
    confidence: number;
    tags?: string[];
  };
}

export interface FilesResponse {
  success: boolean;
  data: {
    files: FileItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`image${index + 1}`, file);
    });

    const response = await fetch(
      `${API_BASE_URL}/api/upload/bulk-upload-and-analyze`,
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
    const response = await fetch(
      `${API_BASE_URL}/api/files/?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching files:", error);
    return {
      success: false,
      data: {
        files: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
