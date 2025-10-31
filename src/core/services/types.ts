/**
 * Service Layer Types
 * 
 * Defines interfaces for all services in the application
 */

import { ApiResponse, ApiRequestOptions } from "@/lib/secureApiClient";

// =====================
// HTTP Client Interface
// =====================

export interface IHttpClient {
  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>>;
}

// =====================
// Auth Service Interface
// =====================

export interface IAuthService {
  login(email: string, password: string): Promise<ApiResponse<AuthResult>>;
  signup(email: string, password: string): Promise<ApiResponse<AuthResult>>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<ApiResponse<{ user: User }>>;
  requestPasswordReset(email: string): Promise<ApiResponse>;
  resetPassword(token: string, newPassword: string): Promise<ApiResponse>;
  confirmEmail(token: string): Promise<ApiResponse>;
}

// =====================
// Gallery Service Interface
// =====================

export interface IGalleryService {
  getFiles(page?: number, limit?: number): Promise<ApiResponse<FileListResult>>;
  searchFiles(query: string, page?: number, limit?: number): Promise<ApiResponse<FileListResult>>;
  uploadFile(file: File, tagStyle: string): Promise<ApiResponse<FileUploadResult>>;
  updateFile(id: string, updates: FileUpdateData): Promise<ApiResponse<FileItem>>;
  deleteFile(id: string): Promise<ApiResponse>;
  regenerateDescription(id: string, tagStyle: string): Promise<ApiResponse<FileItem>>;
}

// =====================
// Token Service Interface
// =====================

export interface ITokenService {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  getTokenExpiry(): number | null;
  isTokenExpired(): boolean;
  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void;
  clearTokens(): void;
  isAuthenticated(): boolean;
  getAuthHeader(): string | null;
}

// =====================
// Storage Service Interface
// =====================

export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// =====================
// Logger Service Interface
// =====================

export interface ILoggerService {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: Error, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
}

// =====================
// Types
// =====================

export interface User {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
  email_confirmed_at?: string;
}

export interface AuthResult {
  user: User;
  session?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
}

export interface FileItem {
  id: string;
  filename: string;
  description: string;
  tags: string[];
  publicUrl: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FileListResult {
  files: FileItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FileUploadResult {
  file: FileItem;
}

export interface FileUpdateData {
  description?: string;
  tags?: string[];
  filename?: string;
}

