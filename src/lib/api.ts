const API_BASE_URL = "https://caption-studio-back-auth.onrender.com";

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
    uploadId?: string;
    totalFiles?: number;
    progressUrl?: string;
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
  files: File[]
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
export async function getFiles(page = 1, limit = 10): Promise<FilesResponse> {
  try {
    const token = localStorage.getItem("access_token");

    console.log(
      `Fetching files from: ${API_BASE_URL}/api/files/?page=${page}&limit=${limit}`
    );

    const response = await fetch(
      `${API_BASE_URL}/api/files/?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(token || undefined),
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
    const token = localStorage.getItem("access_token");
    console.log(`Deleting file with ID: ${fileId}`);

    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token || undefined),
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
 * Search for files by query with pagination
 */
export async function searchFiles(
  query: string,
  page = 1,
  limit = 12
): Promise<SearchResponse> {
  try {
    if (!query.trim()) {
      return {
        success: true,
        data: [],
      };
    }

    const token = localStorage.getItem("access_token");

    console.log(
      `Searching files with query: "${query}", page: ${page}, limit: ${limit}`
    );

    const response = await fetch(
      `${API_BASE_URL}/api/files/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(token || undefined),
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
