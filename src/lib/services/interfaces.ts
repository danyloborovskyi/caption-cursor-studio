/**
 * Service Interfaces
 *
 * Defines contracts for all services to enable dependency injection
 * and proper separation of concerns.
 */

import type { User } from "../api";

// =====================
// API Response Types
// =====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// =====================
// Authentication Service Interface
// =====================

export interface IAuthService {
  login(email: string, password: string): Promise<ApiResponse<{ user: User }>>;
  signup(email: string, password: string): Promise<ApiResponse<{ user: User }>>;
  logout(): Promise<ApiResponse<void>>;
  getCurrentUser(): Promise<ApiResponse<{ user: User }>>;
  refreshToken(): Promise<ApiResponse<{ access_token: string }>>;
  isAuthenticated(): boolean;
  getAccessToken(): string | null;
}

// =====================
// File Service Interface
// =====================

export interface FileItem {
  id: string;
  filename: string;
  publicUrl: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadOptions {
  file: File;
  tagStyle?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateFileOptions {
  description?: string;
  tags?: string[];
  filename?: string;
}

export interface IFileService {
  uploadFile(options: UploadOptions): Promise<ApiResponse<FileItem>>;
  getFiles(page?: number, limit?: number): Promise<ApiResponse<FileItem[]>>;
  getFile(id: string): Promise<ApiResponse<FileItem>>;
  updateFile(
    id: string,
    updates: UpdateFileOptions
  ): Promise<ApiResponse<FileItem>>;
  deleteFile(id: string): Promise<ApiResponse<void>>;
  searchFiles(
    query: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<FileItem[]>>;
  regenerateCaption(
    id: string,
    tagStyle?: string
  ): Promise<ApiResponse<FileItem>>;
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

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: unknown;
}

export interface ILoggerService {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
  getLogs(count?: number): LogEntry[];
  clearLogs(): void;
}

// =====================
// Service Container Interface
// =====================

export interface IServiceContainer {
  authService: IAuthService;
  fileService: IFileService;
  storageService: IStorageService;
  loggerService: ILoggerService;
}
