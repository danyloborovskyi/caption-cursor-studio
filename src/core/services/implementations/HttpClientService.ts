/**
 * HTTP Client Service Implementation
 * 
 * Wraps the SecureApiClient to provide a service layer abstraction
 */

import { apiClient, ApiResponse, ApiRequestOptions } from "@/lib/secureApiClient";
import { IHttpClient } from "../types";

export class HttpClientService implements IHttpClient {
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return apiClient.get<T>(endpoint, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return apiClient.post<T>(endpoint, data, options);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return apiClient.put<T>(endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return apiClient.delete<T>(endpoint, options);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return apiClient.patch<T>(endpoint, data, options);
  }
}

