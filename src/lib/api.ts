const API_BASE_URL = "https://caption-studio-back.onrender.com";
// =====================
// Auth Types
// =====================

export interface User {
  id: number;
  email: string;
  username?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    session?: {
      access_token: string;
      refresh_token?: string;
      expires_at?: number;
      expires_in?: number;
    };
  };
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface UpdateProfileData {
  username?: string;
  metadata?: Record<string, unknown>;
}

// =====================
// Auth Functions
// =====================

/**
 * Get auth headers with token
 */
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Register a new user
 */
export async function signup(
  credentials: SignupCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Store tokens - check both camelCase and snake_case
    if (data.data?.session?.accessToken) {
      localStorage.setItem("access_token", data.data.session.accessToken);
    } else if (data.data?.session?.access_token) {
      localStorage.setItem("access_token", data.data.session.access_token);
    }

    if (data.data?.session?.refreshToken) {
      localStorage.setItem("refresh_token", data.data.session.refreshToken);
    } else if (data.data?.session?.refresh_token) {
      localStorage.setItem("refresh_token", data.data.session.refresh_token);
    }

    return data;
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign up",
    };
  }
}

/**
 * Login with email and password
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Store tokens - try multiple possible paths (camelCase and snake_case)
    // Path 1: data.data.session.accessToken (camelCase - your backend)
    if (data.data?.session?.accessToken) {
      localStorage.setItem("access_token", data.data.session.accessToken);
    }
    // Path 2: data.data.session.access_token (snake_case - Supabase format)
    else if (data.data?.session?.access_token) {
      localStorage.setItem("access_token", data.data.session.access_token);
    }
    // Path 3: data.data.access_token
    else if (data.data?.access_token) {
      localStorage.setItem("access_token", data.data.access_token);
    }
    // Path 4: data.access_token
    else if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }

    // Store refresh_token if available (check both camelCase and snake_case)
    if (data.data?.session?.refreshToken) {
      localStorage.setItem("refresh_token", data.data.session.refreshToken);
    } else if (data.data?.session?.refresh_token) {
      localStorage.setItem("refresh_token", data.data.session.refresh_token);
    } else if (data.data?.refresh_token) {
      localStorage.setItem("refresh_token", data.data.refresh_token);
    } else if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to login",
    };
  }
}

/**
 * Logout and revoke token
 */
export async function logout(): Promise<AuthResponse> {
  const token = localStorage.getItem("access_token");

  // Clear tokens from local storage immediately
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Try to notify the backend, but don't fail if it doesn't work
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(token),
        mode: "cors",
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {
      // Silently fail - we already cleared local tokens
      console.log(
        "Backend logout call failed (tokens already cleared locally)"
      );
    }
  }

  // Always return success since local tokens are cleared
  return {
    success: true,
    message: "Logged out successfully",
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<AuthResponse> {
  try {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Update access token
    if (data.data?.access_token) {
      localStorage.setItem("access_token", data.data.access_token);
    }

    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to refresh token",
    };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<
  AuthResponse & { status?: number }
> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return {
        success: false,
        error: "No access token available",
        status: 401,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: "GET",
      headers: getAuthHeaders(token),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting current user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  profileData: UpdateProfileData
): Promise<AuthResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Send password reset email
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send reset email",
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, new_password: newPassword }),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

/**
 * Update password for authenticated user
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

// =====================
// Upload Types and Functions
// =====================

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    successfulUploads?: number;
    totalAttempts?: number;
    processingTimeSeconds?: number;
    results?: Array<{
      id: number;
      filename: string;
      size: number;
      mimeType: string;
      filePath: string;
      publicUrl: string;
      description: string;
      tags: string[];
      status: string;
      uploadedAt: string;
      analyzedAt: string;
      hasAiAnalysis: boolean;
      isImage: boolean;
      analysis: {
        success: boolean;
        error: null | string;
      };
    }>;
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
    next_page?: number | null;
    prev_page?: number | null;
  };
  filters?: {
    status: string;
    sort_by: string;
    sort_order: string;
  };
  summary?: {
    total_files: number;
    page_count: number;
    files_with_ai: number;
    image_files: number;
  };
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface UpdateFileRequest {
  description?: string;
  tags?: string[];
  filename?: string;
}

export interface UpdateFileResponse {
  success: boolean;
  message: string;
  data?: FileItem;
  error?: string;
}

export interface BulkRegenerateResponse {
  success: boolean;
  message: string;
  data?: {
    regenerated: Array<{
      id: number;
      filename: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      publicUrl: string;
      description: string;
      tags: string[];
      status: string;
      uploadedAt: string;
      updatedAt: string;
      fileSizeMb: string;
      hasAiAnalysis: boolean;
      isImage: boolean;
    }>;
    totalRegenerated: number;
    totalRequested: number;
    tagStyle: string;
    processingTimeSeconds: number;
  };
  error?: string;
}

export interface SearchResponse {
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

/**
 * Upload multiple images (up to 10) and get AI-generated captions
 */
export async function bulkUploadAndAnalyzeImages(
  files: File[],
  tagStyle: "neutral" | "playful" | "seo" = "playful"
): Promise<UploadResponse> {
  try {
    if (files.length > 10) {
      throw new Error("Maximum 10 files allowed for bulk upload");
    }

    if (files.length === 0) {
      throw new Error("Please select at least one file");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("tagStyle", tagStyle);

    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${API_BASE_URL}/api/upload/bulk-upload-and-analyze`,
      {
        method: "POST",
        headers: getAuthHeaders(token || undefined),
        body: formData,
        mode: "cors",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Bulk upload error:", error);
    return {
      success: false,
      message: "Failed to upload images",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of all uploaded files with pagination
 */
export async function getFiles(
  page = 1,
  limit = 12,
  sortBy = "uploaded_at",
  sortOrder: "asc" | "desc" = "desc"
): Promise<FilesResponse> {
  try {
    const token = localStorage.getItem("access_token");

    // Build URL with query parameters - backend expects per_page, not limit
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: limit.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder,
    });

    const url = `${API_BASE_URL}/api/files?${params.toString()}`;

    console.log("===============================================");
    console.log("🚀 FETCHING FILES - URL:", url);
    console.log("📄 Query params:", params.toString());
    console.log("📊 sortBy:", sortBy, "| sortOrder:", sortOrder);
    console.log("===============================================");

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token || undefined),
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("===============================================");
    console.log("✅ API RESPONSE:");
    console.log("📦 Items received:", data.data?.length);
    console.log("📄 Pagination:", {
      current_page: data.pagination?.current_page,
      per_page: data.pagination?.per_page,
      total_items: data.pagination?.total_items,
      total_pages: data.pagination?.total_pages,
    });
    console.log("===============================================");

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
 * Check if recent files are fully analyzed (helper for polling)
 */
export async function checkRecentFilesAnalyzed(
  count: number
): Promise<{ allAnalyzed: boolean; processingCount: number }> {
  try {
    const result = await getFiles(1, count);

    if (!result.success || !result.data) {
      return { allAnalyzed: false, processingCount: count };
    }

    // Check first 'count' files - recent uploads should be at the top
    const recentFiles = result.data.slice(0, count);
    const processingFiles = recentFiles.filter(
      (file) =>
        file.status === "processing" ||
        !file.has_ai_analysis ||
        !file.tags ||
        file.tags.length === 0
    );

    console.log(
      `checkRecentFilesAnalyzed: Checked ${recentFiles.length} files, ${processingFiles.length} still processing`
    );

    return {
      allAnalyzed: processingFiles.length === 0,
      processingCount: processingFiles.length,
    };
  } catch (error) {
    console.error("Error checking file analysis status:", error);
    return { allAnalyzed: false, processingCount: count };
  }
}

/**
 * Delete a single file by ID
 */
export async function deleteFile(fileId: number): Promise<DeleteResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Delete Error: ${response.status} - ${errorText}`);
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
 * Bulk delete multiple files
 */
export async function bulkDeleteFiles(ids: number[]): Promise<DeleteResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log(`🗑️ Bulk deleting ${ids.length} files:`, ids);

    const response = await fetch(`${API_BASE_URL}/api/files`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Bulk Delete Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Bulk delete completed:`, data);
    return data;
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return {
      success: false,
      message: "Failed to delete files",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Regenerate AI analysis for a single file
 */
export async function regenerateFile(
  fileId: number
): Promise<UpdateFileResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log(`🔄 Regenerating AI analysis for file ${fileId}`);

    const response = await fetch(
      `${API_BASE_URL}/api/files/${fileId}/regenerate`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        mode: "cors",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Regenerate Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ AI analysis regenerated:`, data);
    return data;
  } catch (error) {
    console.error("Error regenerating file:", error);
    return {
      success: false,
      message: "Failed to regenerate AI analysis",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Bulk regenerate AI analysis for multiple files
 */
export async function bulkRegenerateFiles(
  ids: number[]
): Promise<BulkRegenerateResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log(`🔄 Bulk regenerating ${ids.length} files:`, ids);

    const response = await fetch(`${API_BASE_URL}/api/files/regenerate`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Bulk Regenerate Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Bulk regenerate completed:`, data);
    return data;
  } catch (error) {
    console.error("Error in bulk regenerate:", error);
    return {
      success: false,
      message: "Failed to regenerate files",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update file metadata (description and/or tags)
 */
export async function updateFile(
  fileId: number,
  updates: UpdateFileRequest
): Promise<UpdateFileResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Update Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating file:", error);
    return {
      success: false,
      message: "Failed to update file",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search files by query (searches description, tags, and filename)
 */
export async function searchFiles(
  query: string,
  page = 1,
  limit = 12,
  sortOrder: "asc" | "desc" = "desc",
  sortBy = "uploaded_at"
): Promise<SearchResponse> {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: limit.toString(),
      sortOrder: sortOrder,
      sortBy: sortBy,
    });

    console.log(
      `🔍 API: Searching files with sortBy=${sortBy}, sortOrder=${sortOrder}: ${API_BASE_URL}/api/files/search?${params.toString()}`
    );

    const response = await fetch(
      `${API_BASE_URL}/api/files/search?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
        mode: "cors",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Search results:", data);

    return {
      success: data.success,
      data: data.data || [],
      pagination: data.pagination,
      error: data.error,
    };
  } catch (error) {
    console.error("Error searching files:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
