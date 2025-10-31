/**
 * Authentication Service Implementation
 *
 * Handles all authentication-related operations with proper
 * separation of concerns and dependency injection.
 */

import type {
  IAuthService,
  ApiResponse,
  IStorageService,
  ILoggerService,
} from "./interfaces";
import type { User } from "../api";
import { apiClient, TokenManager } from "../secureApiClient";
import { CompositeValidators } from "../validators";

export class AuthService implements IAuthService {
  constructor(
    private storage: IStorageService,
    private logger: ILoggerService
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User }>> {
    // Validate credentials
    const validation = CompositeValidators.loginCredentials({
      email,
      password,
    });

    if (!validation.valid) {
      this.logger.warn("Login validation failed", {
        errors: validation.errors,
      });
      return {
        success: false,
        error: validation.errors.join(", "),
      };
    }

    this.logger.info("Attempting login", { email });

    // Make API request
    const response = await apiClient.requestWithRateLimit<{
      user: User;
      session: {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };
    }>(
      "/auth/login",
      {
        method: "POST",
        body: validation.sanitized,
        skipAuth: true,
      },
      "login"
    );

    if (response.success && response.data) {
      // Store tokens
      if (response.data.session) {
        TokenManager.setTokens(
          response.data.session.access_token,
          response.data.session.refresh_token,
          response.data.session.expires_in
        );
      }

      // Store user data
      this.storage.setItem("user_data", JSON.stringify(response.data.user));

      this.logger.info("Login successful", { userId: response.data.user.id });

      return {
        success: true,
        data: { user: response.data.user },
      };
    }

    this.logger.error("Login failed", response.error);
    return response as ApiResponse<{ user: User }>;
  }

  async signup(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User }>> {
    // Validate credentials
    const validation = CompositeValidators.signupCredentials({
      email,
      password,
    });

    if (!validation.valid) {
      this.logger.warn("Signup validation failed", {
        errors: validation.errors,
      });
      return {
        success: false,
        error: validation.errors.join(", "),
      };
    }

    this.logger.info("Attempting signup", { email });

    // Make API request
    const response = await apiClient.requestWithRateLimit<{
      user: User;
      session: {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };
    }>(
      "/auth/signup",
      {
        method: "POST",
        body: validation.sanitized,
        skipAuth: true,
      },
      "signup"
    );

    if (response.success && response.data) {
      this.logger.info("Signup successful", { userId: response.data.user.id });

      return {
        success: true,
        data: { user: response.data.user },
      };
    }

    this.logger.error("Signup failed", response.error);
    return response as ApiResponse<{ user: User }>;
  }

  async logout(): Promise<ApiResponse<void>> {
    this.logger.info("Logging out");

    // Call API logout endpoint
    await apiClient.post("/auth/logout");

    // Clear tokens and user data
    TokenManager.clearTokens();
    this.storage.removeItem("user_data");

    this.logger.info("Logout successful");

    return { success: true };
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get<{ user: User }>("/auth/user");

    if (response.success && response.data) {
      // Update stored user data
      this.storage.setItem("user_data", JSON.stringify(response.data.user));
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string }>> {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      this.logger.error("No refresh token available");
      return {
        success: false,
        error: "No refresh token available",
      };
    }

    this.logger.info("Refreshing token");

    const response = await apiClient.post<{
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    }>("/auth/refresh", { refresh_token: refreshToken }, { skipAuth: true });

    if (response.success && response.data) {
      // Update tokens
      TokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      );

      this.logger.info("Token refreshed successfully");
    }

    return response as ApiResponse<{ access_token: string }>;
  }

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }
}
