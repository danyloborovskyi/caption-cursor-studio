/**
 * API Wrapper with Rate Limiting and Security Features
 *
 * This wrapper adds client-side rate limiting and security checks
 * to prevent abuse and improve user experience
 */

import { globalRateLimiter } from "./security";

export interface RateLimitConfig {
  maxCalls: number;
  windowMs: number;
  errorMessage?: string;
}

/**
 * Wrapper function that adds rate limiting to API calls
 */
export async function withRateLimit<T>(
  key: string,
  apiCall: () => Promise<T>,
  config: RateLimitConfig = { maxCalls: 10, windowMs: 60000 }
): Promise<T> {
  // Check if rate limited
  if (globalRateLimiter.isRateLimited(key, config.maxCalls, config.windowMs)) {
    const errorMsg =
      config.errorMessage ||
      `Too many requests. Please wait ${Math.ceil(
        config.windowMs / 1000
      )} seconds before trying again.`;

    throw new Error(errorMsg);
  }

  // Execute the API call
  return apiCall();
}

/**
 * Rate limit configurations for different operations
 */
export const rateLimitConfigs = {
  // Authentication operations
  login: {
    maxCalls: 5,
    windowMs: 300000,
    errorMessage: "Too many login attempts. Please wait 5 minutes.",
  }, // 5 attempts per 5 minutes
  signup: {
    maxCalls: 3,
    windowMs: 600000,
    errorMessage: "Too many signup attempts. Please wait 10 minutes.",
  }, // 3 attempts per 10 minutes
  passwordReset: {
    maxCalls: 3,
    windowMs: 300000,
    errorMessage: "Too many password reset requests. Please wait 5 minutes.",
  },

  // File operations
  fileUpload: {
    maxCalls: 10,
    windowMs: 60000,
    errorMessage: "Upload limit reached. Please wait 1 minute.",
  }, // 10 uploads per minute
  fileDelete: {
    maxCalls: 20,
    windowMs: 60000,
    errorMessage: "Delete limit reached. Please wait 1 minute.",
  }, // 20 deletes per minute
  fileUpdate: {
    maxCalls: 30,
    windowMs: 60000,
    errorMessage: "Update limit reached. Please wait 1 minute.",
  }, // 30 updates per minute

  // Search and query operations
  search: {
    maxCalls: 30,
    windowMs: 60000,
    errorMessage: "Search limit reached. Please wait 1 minute.",
  }, // 30 searches per minute
  listFiles: {
    maxCalls: 60,
    windowMs: 60000,
    errorMessage: "Too many requests. Please wait 1 minute.",
  }, // 60 list requests per minute

  // Regenerate operations (more expensive)
  regenerate: {
    maxCalls: 5,
    windowMs: 60000,
    errorMessage: "Regenerate limit reached. Please wait 1 minute.",
  }, // 5 regenerations per minute
  bulkRegenerate: {
    maxCalls: 2,
    windowMs: 300000,
    errorMessage: "Bulk regenerate limit reached. Please wait 5 minutes.",
  }, // 2 bulk operations per 5 minutes
};

/**
 * Check if user is being rate limited for a specific operation
 * Returns remaining attempts and time until reset
 */
export function getRateLimitStatus(operation: keyof typeof rateLimitConfigs): {
  isLimited: boolean;
  remaining: number;
  resetIn: number;
} {
  const config = rateLimitConfigs[operation];
  const isLimited = globalRateLimiter.isRateLimited(
    operation,
    config.maxCalls,
    config.windowMs
  );

  // Note: This is a simplified implementation
  // In production, you'd want to track this more accurately
  return {
    isLimited,
    remaining: isLimited ? 0 : config.maxCalls,
    resetIn: isLimited ? config.windowMs : 0,
  };
}

/**
 * Reset rate limit for a specific operation
 * Useful for testing or after successful operations
 */
export function resetRateLimit(operation: string): void {
  globalRateLimiter.reset(operation);
}

/**
 * Clear all rate limits
 * Useful for logout or session reset
 */
export function clearAllRateLimits(): void {
  globalRateLimiter.clearAll();
}

/**
 * CSRF Token Handling Documentation
 *
 * IMPORTANT: CSRF (Cross-Site Request Forgery) protection should be implemented
 * primarily on the backend. The backend should:
 *
 * 1. Generate a unique CSRF token for each session
 * 2. Send it to the frontend (via cookie or response header)
 * 3. Validate the token on state-changing requests (POST, PUT, DELETE)
 * 4. Reject requests with missing or invalid tokens
 *
 * Frontend responsibilities:
 *
 * 1. Store the CSRF token received from backend
 * 2. Include it in request headers for all state-changing operations
 * 3. Use SameSite cookies to prevent CSRF attacks
 *
 * Example implementation:
 *
 * ```typescript
 * // Get CSRF token from backend
 * const csrfToken = await fetch('/api/csrf-token').then(r => r.json());
 *
 * // Include in subsequent requests
 * fetch('/api/protected-endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'X-CSRF-Token': csrfToken,
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify(data),
 * });
 * ```
 *
 * For this application, CSRF protection is handled by:
 * 1. Using SameSite cookies for session management
 * 2. Backend validates origin and referer headers
 * 3. Authentication tokens are stored in httpOnly cookies (if applicable)
 */

/**
 * Get CSRF token from the page meta tag or cookie
 * This should be set by the backend
 */
export function getCSRFToken(): string | null {
  // Try to get from meta tag
  if (typeof document !== "undefined") {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute("content");
    }

    // Try to get from cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "XSRF-TOKEN" || name === "csrf_token") {
        return decodeURIComponent(value);
      }
    }
  }

  return null;
}

/**
 * Add CSRF token to request headers if available
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCSRFToken();

  if (csrfToken) {
    return {
      ...headers,
      "X-CSRF-Token": csrfToken,
      "X-XSRF-Token": csrfToken, // Alternative header name
    };
  }

  return headers;
}

/**
 * Wrapper for fetch that automatically includes CSRF token
 * for state-changing requests (POST, PUT, DELETE, PATCH)
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";

  // Add CSRF token for state-changing requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    options.headers = addCSRFHeader(options.headers);
  }

  return fetch(url, options);
}
