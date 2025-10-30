// =====================
// Security Utilities
// =====================

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Encode special HTML characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  return sanitized.trim();
}

/**
 * Sanitize search queries
 * More permissive than general sanitization but prevents injection
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";

  // Remove potential SQL injection patterns
  let sanitized = query
    .replace(/['";]/g, "") // Remove quotes and semicolons
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comment start
    .replace(/\*\//g, "") // Remove block comment end
    .replace(/xp_/gi, "") // Remove SQL Server extended procedures
    .replace(/sp_/gi, ""); // Remove SQL Server stored procedures

  return sanitized.trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate filename
 * Prevents directory traversal and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "";

  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, "");

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, "");

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, "");

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split(".").pop() || "";
    const nameWithoutExt = sanitized.substring(
      0,
      sanitized.length - ext.length - 1
    );
    sanitized = nameWithoutExt.substring(0, 255 - ext.length - 1) + "." + ext;
  }

  return sanitized || "unnamed";
}

/**
 * Generate a cryptographically secure random ID
 * Replaces Math.random() for security-sensitive operations
 */
export function generateSecureId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  // Last resort fallback (not cryptographically secure)
  console.warn(
    "Using non-secure random ID generation. Crypto API not available."
  );
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Validate file type
 * Checks both MIME type and extension
 */
export function isValidImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check MIME type
  const validMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, GIF, WebP, SVG`,
    };
  }

  // Check file extension
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${validExtensions.join(", ")}`,
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: 10MB, got: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`,
    };
  }

  // Check if file is actually an image by checking magic bytes (first few bytes)
  // This requires reading the file, so we'll do a basic check here
  if (file.size < 12) {
    return {
      valid: false,
      error: "File appears to be corrupted or too small",
    };
  }

  return { valid: true };
}

/**
 * Validate and sanitize tags array
 */
export function sanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => sanitizeInput(tag))
    .filter((tag) => tag.length > 0 && tag.length <= 50) // Reasonable tag length limit
    .slice(0, 100); // Limit total number of tags
}

/**
 * Check if token is expired
 * @param expiresAt - Expiration timestamp in seconds (Unix time)
 */
export function isTokenExpired(expiresAt: number | undefined): boolean {
  if (!expiresAt) return false;

  // Add a 5-minute buffer to refresh before actual expiration
  const bufferSeconds = 5 * 60;
  const now = Math.floor(Date.now() / 1000);

  return now >= expiresAt - bufferSeconds;
}

/**
 * Validate URL to prevent open redirects
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);

    // Only allow same-origin URLs or specific trusted domains
    const trustedDomains = [
      window.location.origin,
      "https://caption-studio-back.onrender.com",
      "https://npguberkdninaucofupy.supabase.co",
    ];

    return trustedDomains.some(
      (domain) => parsed.origin === domain || parsed.origin.startsWith(domain)
    );
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper for client-side
 * Prevents rapid successive API calls
 */
export class RateLimiter {
  private lastCallTime: Map<string, number> = new Map();
  private callCounts: Map<string, number> = new Map();

  /**
   * Check if an operation should be rate limited
   * @param key - Unique identifier for the operation
   * @param maxCalls - Maximum number of calls allowed in the window
   * @param windowMs - Time window in milliseconds
   */
  isRateLimited(
    key: string,
    maxCalls: number = 5,
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const lastCall = this.lastCallTime.get(key) || 0;
    const count = this.callCounts.get(key) || 0;

    // Reset if window has passed
    if (now - lastCall > windowMs) {
      this.lastCallTime.set(key, now);
      this.callCounts.set(key, 1);
      return false;
    }

    // Check if limit exceeded
    if (count >= maxCalls) {
      return true;
    }

    // Increment count
    this.callCounts.set(key, count + 1);
    this.lastCallTime.set(key, now);
    return false;
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.lastCallTime.delete(key);
    this.callCounts.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.lastCallTime.clear();
    this.callCounts.clear();
  }
}

// Export a singleton instance for global use
export const globalRateLimiter = new RateLimiter();

/**
 * Escape regex special characters in user input
 * Use this before creating RegExp from user input
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sanitize HTML content for safe rendering
 * More aggressive than sanitizeInput, removes all HTML
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  // Create a temporary div to parse HTML
  if (typeof window !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  // Server-side fallback
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Validate that a string contains only safe characters for IDs
 */
export function isValidId(id: string): boolean {
  // Allow alphanumeric, hyphens, and underscores only
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Content Security Policy generator
 */
export function generateCSPHeader(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Allow inline styles
    "img-src 'self' data: https: blob:", // Allow images from various sources
    "font-src 'self' data:", // Allow fonts
    "connect-src 'self' https://caption-studio-back.onrender.com https://caption-studio-back-test.onrender.com https://npguberkdninaucofupy.supabase.co", // API endpoints
    "frame-ancestors 'none'", // Prevent clickjacking
    "base-uri 'self'", // Restrict base tag
    "form-action 'self'", // Restrict form submissions
  ];

  return directives.join("; ");
}
