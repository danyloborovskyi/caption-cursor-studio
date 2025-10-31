/**
 * API Type Definitions
 *
 * Centralized, strongly-typed API interfaces to replace scattered
 * type definitions and improve type safety across the application.
 */

// =====================
// Common Types
// =====================

export type ApiSuccessResponse<T> = {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
};

export type ApiErrorResponse = {
  readonly success: false;
  readonly error: string;
  readonly status?: number;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =====================
// User Types
// =====================

export interface User {
  readonly id: string;
  readonly email: string;
  readonly username?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface AuthSession {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
}

export interface AuthResponse {
  readonly user: User;
  readonly session: AuthSession;
}

// =====================
// File Types
// =====================

export type FileStatus = "processing" | "ready" | "error";

export type TagStyle = "neutral" | "playful" | "seo";

export interface FileItem {
  readonly id: string;
  readonly filename: string;
  readonly publicUrl: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly status?: FileStatus;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly userId?: string;
}

export interface FileUploadRequest {
  readonly file: File;
  readonly tagStyle?: TagStyle;
  readonly description?: string;
  readonly tags?: readonly string[];
}

export interface FileUpdateRequest {
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly filename?: string;
}

// =====================
// Pagination Types
// =====================

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

// =====================
// Search Types
// =====================

export interface SearchParams extends PaginationParams {
  readonly query: string;
  readonly sortBy?: "createdAt" | "updatedAt" | "filename";
  readonly sortOrder?: "asc" | "desc";
}

// =====================
// Form Types
// =====================

export interface LoginFormData {
  readonly email: string;
  readonly password: string;
}

export interface SignupFormData {
  readonly email: string;
  readonly password: string;
  readonly username?: string;
}

export interface PasswordResetFormData {
  readonly email: string;
}

export interface PasswordChangeFormData {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

// =====================
// Component Props Types
// =====================

export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  readonly isLoading: boolean;
  readonly loadingText?: string;
}

export interface ErrorProps extends BaseComponentProps {
  readonly error: string | null;
  readonly onRetry?: () => void;
  readonly onDismiss?: () => void;
}

// =====================
// State Types
// =====================

export interface AsyncState<T> {
  readonly data: T | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface PaginatedState<T> extends AsyncState<readonly T[]> {
  readonly currentPage: number;
  readonly hasMore: boolean;
}

// =====================
// Type Guards
// =====================

export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

export function isValidTagStyle(value: unknown): value is TagStyle {
  return (
    typeof value === "string" && ["neutral", "playful", "seo"].includes(value)
  );
}

export function isValidFileStatus(value: unknown): value is FileStatus {
  return (
    typeof value === "string" &&
    ["processing", "ready", "error"].includes(value)
  );
}

// =====================
// Utility Types
// =====================

/** Make all properties in T optional and readonly */
export type PartialReadonly<T> = {
  readonly [P in keyof T]?: T[P];
};

/** Extract readonly array element type */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/** Make specific keys required */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
