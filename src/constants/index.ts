/**
 * Application Constants
 *
 * Centralized constants to replace magic numbers and strings
 * scattered throughout the codebase.
 */

// =====================
// API Configuration
// =====================

export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://caption-studio-back.onrender.com",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// =====================
// File Upload Configuration
// =====================

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const,
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".webp"] as const,
} as const;

// =====================
// Pagination
// =====================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
} as const;

// =====================
// Validation Rules
// =====================

export const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  SEARCH_QUERY: {
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 5000,
  },
  FILENAME: {
    MAX_LENGTH: 255,
  },
  TAGS: {
    MAX_COUNT: 100,
    MAX_LENGTH: 50,
  },
} as const;

// =====================
// Token Management
// =====================

export const TOKEN = {
  REFRESH_BUFFER: 300, // 5 minutes in seconds
  CHECK_INTERVAL: 60000, // 1 minute in milliseconds
  MAX_REFRESH_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// =====================
// Rate Limiting
// =====================

export const RATE_LIMITS = {
  LOGIN: {
    MAX_CALLS: 5,
    WINDOW_MS: 300000, // 5 minutes
  },
  SIGNUP: {
    MAX_CALLS: 3,
    WINDOW_MS: 600000, // 10 minutes
  },
  PASSWORD_RESET: {
    MAX_CALLS: 3,
    WINDOW_MS: 300000, // 5 minutes
  },
  FILE_UPLOAD: {
    MAX_CALLS: 10,
    WINDOW_MS: 60000, // 1 minute
  },
  FILE_DELETE: {
    MAX_CALLS: 20,
    WINDOW_MS: 60000, // 1 minute
  },
  FILE_UPDATE: {
    MAX_CALLS: 30,
    WINDOW_MS: 60000, // 1 minute
  },
  SEARCH: {
    MAX_CALLS: 30,
    WINDOW_MS: 60000, // 1 minute
  },
  LIST_FILES: {
    MAX_CALLS: 60,
    WINDOW_MS: 60000, // 1 minute
  },
  REGENERATE: {
    MAX_CALLS: 5,
    WINDOW_MS: 60000, // 1 minute
  },
  BULK_REGENERATE: {
    MAX_CALLS: 2,
    WINDOW_MS: 300000, // 5 minutes
  },
} as const;

// =====================
// Local Storage Keys
// =====================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRY: "token_expiry",
  USER_DATA: "user_data",
  THEME: "theme",
  PREFERENCES: "preferences",
} as const;

// =====================
// Routes
// =====================

export const ROUTES = {
  HOME: "/",
  GALLERY: "/gallery",
  MY_GALLERY: "/gallery",
  UPLOAD: "/upload",
  LOGIN: "/",
  SIGNUP: "/",
} as const;

// =====================
// UI Constants
// =====================

export const UI = {
  TOAST_DURATION: 3000, // 3 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  SCROLL_THRESHOLD: 100, // pixels from bottom to trigger load more
  ANIMATION_DURATION: 200, // milliseconds
} as const;

// =====================
// Error Messages
// =====================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  UNAUTHORIZED: "Authentication required. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Invalid input. Please check your data.",
  FILE_TOO_LARGE: "File is too large. Maximum size is 10MB.",
  FILE_TYPE_INVALID: "Invalid file type. Only images are allowed.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please wait and try again.",
} as const;

// =====================
// Success Messages
// =====================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in!",
  SIGNUP_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "Successfully logged out!",
  UPLOAD_SUCCESS: "Files uploaded successfully!",
  UPDATE_SUCCESS: "Updated successfully!",
  DELETE_SUCCESS: "Deleted successfully!",
} as const;

// =====================
// Tag Styles
// =====================

export const TAG_STYLES = {
  NEUTRAL: "neutral",
  PLAYFUL: "playful",
  SEO: "seo",
} as const;

// =====================
// File Status
// =====================

export const FILE_STATUS = {
  PROCESSING: "processing",
  READY: "ready",
  ERROR: "error",
} as const;

// =====================
// Environment
// =====================

export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",
} as const;

// =====================
// Type Exports
// =====================

export type TagStyle = (typeof TAG_STYLES)[keyof typeof TAG_STYLES];
export type FileStatus = (typeof FILE_STATUS)[keyof typeof FILE_STATUS];
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type Route = (typeof ROUTES)[keyof typeof ROUTES];
