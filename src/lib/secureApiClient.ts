/**
 * Secure API Client
 *
 * A comprehensive API client that implements all security best practices:
 * - Rate limiting
 * - CSRF protection
 * - Input/output validation
 * - Secure token handling
 * - Error sanitization
 * - Request/response logging
 */

import {
  sanitizeInput,
  sanitizeSearchQuery,
  sanitizeFilename,
  sanitizeTags,
  isTokenExpired,
  isSafeUrl,
} from "./security";

import { withRateLimit, rateLimitConfigs, addCSRFHeader } from "./apiWrapper";

// =====================
// Configuration
// =====================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://caption-studio-back.onrender.com";
const API_TIMEOUT = 30000; // 30 seconds

// =====================
// Types
// =====================

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRateLimit?: boolean;
  rateLimitKey?: string;
  timeout?: number;
  validateResponse?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface RequestMetadata {
  url: string;
  method: string;
  timestamp: number;
  duration?: number;
  status?: number;
  error?: string;
}

// =====================
// Request Logging
// =====================

class RequestLogger {
  private logs: RequestMetadata[] = [];
  private maxLogs = 100;

  log(metadata: RequestMetadata): void {
    this.logs.push(metadata);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${metadata.method} ${metadata.url}`, {
        duration: metadata.duration,
        status: metadata.status,
        error: metadata.error,
      });
    }
  }

  getRecentLogs(count: number = 10): RequestMetadata[] {
    return this.logs.slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getFailedRequests(): RequestMetadata[] {
    return this.logs.filter(
      (log) => log.error || (log.status && log.status >= 400)
    );
  }
}

const requestLogger = new RequestLogger();

// =====================
// Token Management
// =====================

export class TokenManager {
  private static readonly TOKEN_KEY = "access_token";
  private static readonly REFRESH_KEY = "refresh_token";
  private static readonly EXPIRY_KEY = "token_expiry";
  private static readonly USER_KEY = "user_data";

  /**
   * Get access token from storage
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /**
   * Get token expiry timestamp
   */
  static getTokenExpiry(): number | null {
    if (typeof window === "undefined") return null;
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    return isTokenExpired(expiry);
  }

  /**
   * Set tokens with expiry
   */
  static setTokens(
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.TOKEN_KEY, accessToken);

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, refreshToken);
    }

    if (expiresIn) {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + expiresIn;
      localStorage.setItem(this.EXPIRY_KEY, expiryTimestamp.toString());
    }
  }

  /**
   * Clear all tokens and user data
   */
  static clearTokens(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    if (this.isTokenExpired()) {
      this.clearTokens();
      return false;
    }
    return true;
  }

  /**
   * Get authorization header value
   */
  static getAuthHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}

// =====================
// Request Interceptor
// =====================

class RequestInterceptor {
  /**
   * Add authentication headers
   */
  static addAuthHeaders(headers: HeadersInit = {}): HeadersInit {
    const authHeader = TokenManager.getAuthHeader();

    if (authHeader) {
      return {
        ...headers,
        Authorization: authHeader,
      };
    }

    return headers;
  }

  /**
   * Add security headers
   */
  static addSecurityHeaders(headers: HeadersInit = {}): HeadersInit {
    return {
      ...headers,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      // Add CSRF token
      ...addCSRFHeader(headers),
    };
  }

  /**
   * Validate and sanitize request body
   */
  static sanitizeRequestBody(body: unknown): unknown {
    if (!body) return body;

    // Handle different types
    if (typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(this.sanitizeObject(parsed));
      } catch {
        return body;
      }
    }

    if (typeof body === "object") {
      return this.sanitizeObject(body);
    }

    return body;
  }

  /**
   * Recursively sanitize object
   */
  private static sanitizeObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        // Sanitize string values
        if (typeof value === "string") {
          // Special handling for different field types
          if (key.includes("email")) {
            sanitized[key] = value.trim().toLowerCase();
          } else if (key.includes("filename")) {
            sanitized[key] = sanitizeFilename(value);
          } else if (key.includes("search") || key.includes("query")) {
            sanitized[key] = sanitizeSearchQuery(value);
          } else if (key.includes("tags") && Array.isArray(value)) {
            sanitized[key] = sanitizeTags(value as string[]);
          } else {
            sanitized[key] = sanitizeInput(value);
          }
        } else {
          sanitized[key] = this.sanitizeObject(value);
        }
      }

      return sanitized;
    }

    return obj;
  }
}

// =====================
// Response Interceptor
// =====================

class ResponseInterceptor {
  /**
   * Handle successful response
   */
  static async handleSuccess<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");

    // Handle JSON responses
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return {
        success: true,
        data,
        status: response.status,
      };
    }

    // Handle blob responses (file downloads)
    if (
      contentType?.includes("application/octet-stream") ||
      contentType?.includes("image/")
    ) {
      const blob = await response.blob();
      return {
        success: true,
        data: blob as T,
        status: response.status,
      };
    }

    // Handle text responses
    const text = await response.text();
    return {
      success: true,
      data: text as T,
      status: response.status,
    };
  }

  /**
   * Handle error response
   */
  static async handleError(response: Response): Promise<ApiResponse> {
    const status = response.status;
    let errorMessage = this.getStatusMessage(status);

    try {
      const data = await response.json();
      if (data.error) {
        // Sanitize error message to prevent information disclosure
        errorMessage = this.sanitizeErrorMessage(data.error);
      } else if (data.message) {
        errorMessage = this.sanitizeErrorMessage(data.message);
      }
    } catch {
      // If response is not JSON, use default message
    }

    // Handle token expiration
    if (status === 401) {
      TokenManager.clearTokens();

      // Redirect to login if not already there
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    }

    return {
      success: false,
      error: errorMessage,
      status,
    };
  }

  /**
   * Get user-friendly status message
   */
  private static getStatusMessage(status: number): string {
    const messages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Authentication required. Please log in again.",
      403: "You don't have permission to perform this action.",
      404: "The requested resource was not found.",
      409: "This item already exists.",
      413: "File is too large. Please choose a smaller file.",
      429: "Too many requests. Please wait and try again.",
      500: "Server error. Please try again later.",
      502: "Service temporarily unavailable.",
      503: "Service temporarily unavailable.",
    };

    return messages[status] || "An error occurred. Please try again.";
  }

  /**
   * Sanitize error messages to prevent information disclosure
   */
  private static sanitizeErrorMessage(message: string): string {
    // Remove stack traces
    message = message.split("\n")[0];

    // Remove file paths
    message = message.replace(/[A-Za-z]:\\[\w\\]+/g, "[path]");
    message = message.replace(/\/[\w\/]+/g, "[path]");

    // Remove SQL/database errors
    if (
      message.toLowerCase().includes("sql") ||
      message.toLowerCase().includes("database") ||
      message.toLowerCase().includes("query")
    ) {
      return "A database error occurred. Please try again.";
    }

    // Remove internal error codes
    message = message.replace(/Error \d+:/g, "Error:");
    message = message.replace(/Code: \d+/g, "");

    // Truncate long messages
    if (message.length > 200) {
      message = message.substring(0, 200) + "...";
    }

    return message;
  }
}

// =====================
// Secure API Client
// =====================

export class SecureApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a secure API request
   */
  async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const method = options.method || "GET";

    // Request metadata for logging
    const metadata: RequestMetadata = {
      url: endpoint,
      method,
      timestamp: startTime,
    };

    try {
      // Validate URL
      if (!isSafeUrl(fullUrl)) {
        throw new Error("Invalid or unsafe URL");
      }

      // Check token expiration before request
      if (!options.skipAuth && TokenManager.isTokenExpired()) {
        TokenManager.clearTokens();
        return {
          success: false,
          error: "Your session has expired. Please log in again.",
          status: 401,
        };
      }

      // Prepare headers
      let headers: HeadersInit = options.headers || {};

      if (!options.skipAuth) {
        headers = RequestInterceptor.addAuthHeaders(headers);
      }

      headers = RequestInterceptor.addSecurityHeaders(headers);

      // Sanitize request body
      let body = options.body;
      if (body && !(body instanceof FormData) && !(body instanceof Blob)) {
        body = JSON.stringify(RequestInterceptor.sanitizeRequestBody(body));
      }

      // Setup timeout
      const timeout = options.timeout || API_TIMEOUT;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make request
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        body: body as BodyInit,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Calculate duration
      metadata.duration = Date.now() - startTime;
      metadata.status = response.status;

      // Handle response
      let result: ApiResponse<T>;
      if (response.ok) {
        result = await ResponseInterceptor.handleSuccess<T>(response);
      } else {
        result = (await ResponseInterceptor.handleError(
          response
        )) as ApiResponse<T>;
        metadata.error = result.error;
      }

      // Log request
      requestLogger.log(metadata);

      return result;
    } catch (error) {
      metadata.duration = Date.now() - startTime;

      if (error instanceof Error) {
        metadata.error = error.message;

        // Handle specific errors
        if (error.name === "AbortError") {
          requestLogger.log(metadata);
          return {
            success: false,
            error: "Request timeout. Please try again.",
          };
        }

        if (error.message.includes("Failed to fetch")) {
          requestLogger.log(metadata);
          return {
            success: false,
            error: "Network error. Please check your connection.",
          };
        }

        requestLogger.log(metadata);
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }

      requestLogger.log(metadata);
      return {
        success: false,
        error: "An unknown error occurred.",
      };
    }
  }

  /**
   * Make a rate-limited request
   */
  async requestWithRateLimit<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {},
    rateLimitKey?: string
  ): Promise<ApiResponse<T>> {
    const key = rateLimitKey || options.rateLimitKey || endpoint;

    try {
      return await withRateLimit(
        key,
        () => this.request<T>(endpoint, options),
        rateLimitConfigs[key as keyof typeof rateLimitConfigs]
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rate limit exceeded",
      };
    }
  }

  // =====================
  // Convenience Methods
  // =====================

  async get<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data as BodyInit,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data as BodyInit,
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data as BodyInit,
    });
  }

  // =====================
  // Utility Methods
  // =====================

  /**
   * Get recent request logs
   */
  getRecentLogs(count?: number): RequestMetadata[] {
    return requestLogger.getRecentLogs(count);
  }

  /**
   * Get failed requests
   */
  getFailedRequests(): RequestMetadata[] {
    return requestLogger.getFailedRequests();
  }

  /**
   * Clear request logs
   */
  clearLogs(): void {
    requestLogger.clearLogs();
  }
}

// =====================
// Export singleton instance
// =====================

export const apiClient = new SecureApiClient();

// Export utilities
export { requestLogger };
