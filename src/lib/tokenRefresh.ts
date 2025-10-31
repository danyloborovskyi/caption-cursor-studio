/**
 * Token Refresh Mechanism
 *
 * Handles automatic token refresh before expiration
 * Implements retry logic and refresh token rotation
 */

import { TokenManager, ApiResponse } from "./secureApiClient";
import { isTokenExpired } from "./security";

// =====================
// Configuration
// =====================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://caption-studio-back.onrender.com";
const REFRESH_ENDPOINT = "/auth/refresh";
const REFRESH_BUFFER_SECONDS = 300; // Refresh 5 minutes before expiration

// =====================
// Refresh State Management
// =====================

class RefreshState {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private refreshAttempts = 0;
  private readonly MAX_REFRESH_ATTEMPTS = 3;

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get or create refresh promise
   */
  getRefreshPromise(): Promise<boolean> | null {
    return this.refreshPromise;
  }

  /**
   * Set refresh promise
   */
  setRefreshPromise(promise: Promise<boolean>): void {
    this.refreshPromise = promise;
  }

  /**
   * Clear refresh state
   */
  clear(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.refreshAttempts = 0;
  }

  /**
   * Start refreshing
   */
  startRefreshing(): boolean {
    if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
      console.warn("Max refresh attempts reached");
      return false;
    }

    this.isRefreshing = true;
    this.refreshAttempts++;
    return true;
  }

  /**
   * End refreshing
   */
  endRefreshing(success: boolean): void {
    this.isRefreshing = false;
    this.refreshPromise = null;

    if (success) {
      this.refreshAttempts = 0;
    }
  }

  /**
   * Reset attempts
   */
  resetAttempts(): void {
    this.refreshAttempts = 0;
  }
}

const refreshState = new RefreshState();

// =====================
// Token Refresh
// =====================

export class TokenRefreshManager {
  private static refreshCheckInterval: NodeJS.Timeout | null = null;
  private static readonly CHECK_INTERVAL_MS = 60000; // Check every minute

  /**
   * Refresh the access token using refresh token
   */
  static async refreshToken(): Promise<boolean> {
    // Check if already refreshing
    if (refreshState.isCurrentlyRefreshing()) {
      const promise = refreshState.getRefreshPromise();
      if (promise) {
        return promise;
      }
    }

    // Start refreshing
    if (!refreshState.startRefreshing()) {
      console.error("Cannot refresh: max attempts reached");
      this.handleRefreshFailure();
      return false;
    }

    const refreshPromise = this._performRefresh();
    refreshState.setRefreshPromise(refreshPromise);

    try {
      const result = await refreshPromise;
      refreshState.endRefreshing(result);
      return result;
    } catch (error) {
      refreshState.endRefreshing(false);
      console.error("Token refresh error:", error);
      this.handleRefreshFailure();
      return false;
    }
  }

  /**
   * Perform the actual refresh operation
   */
  private static async _performRefresh(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      console.warn("No refresh token available");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.status);
        return false;
      }

      const data = await response.json();

      // Extract tokens from response
      const newAccessToken =
        data.access_token || data.data?.session?.access_token;
      const newRefreshToken =
        data.refresh_token || data.data?.session?.refresh_token;
      const expiresIn = data.expires_in || data.data?.session?.expires_in;

      if (!newAccessToken) {
        console.error("No access token in refresh response");
        return false;
      }

      // Store new tokens
      TokenManager.setTokens(newAccessToken, newRefreshToken, expiresIn);

      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Token refresh request failed:", error);
      return false;
    }
  }

  /**
   * Handle refresh failure
   */
  private static handleRefreshFailure(): void {
    // Clear tokens
    TokenManager.clearTokens();

    // Redirect to login
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      console.log("Token refresh failed, redirecting to login");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  }

  /**
   * Check if token needs refresh
   */
  static shouldRefreshToken(): boolean {
    const expiry = TokenManager.getTokenExpiry();
    if (!expiry) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiry - now;

    // Refresh if less than REFRESH_BUFFER_SECONDS remaining
    return timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_BUFFER_SECONDS;
  }

  /**
   * Start automatic token refresh checking
   */
  static startAutoRefresh(): void {
    if (this.refreshCheckInterval) {
      return; // Already started
    }

    console.log("Starting automatic token refresh");

    this.refreshCheckInterval = setInterval(() => {
      if (!TokenManager.isAuthenticated()) {
        this.stopAutoRefresh();
        return;
      }

      if (this.shouldRefreshToken()) {
        console.log("Token nearing expiration, refreshing...");
        this.refreshToken();
      }
    }, this.CHECK_INTERVAL_MS);

    // Also check immediately
    if (TokenManager.isAuthenticated() && this.shouldRefreshToken()) {
      this.refreshToken();
    }
  }

  /**
   * Stop automatic token refresh checking
   */
  static stopAutoRefresh(): void {
    if (this.refreshCheckInterval) {
      clearInterval(this.refreshCheckInterval);
      this.refreshCheckInterval = null;
      console.log("Stopped automatic token refresh");
    }
  }

  /**
   * Manually trigger token refresh if needed
   */
  static async refreshIfNeeded(): Promise<boolean> {
    if (!TokenManager.isAuthenticated()) {
      return false;
    }

    if (TokenManager.isTokenExpired()) {
      console.log("Token expired, attempting refresh");
      return this.refreshToken();
    }

    if (this.shouldRefreshToken()) {
      console.log("Token nearing expiration, refreshing");
      return this.refreshToken();
    }

    return true; // Token is still valid
  }

  /**
   * Reset refresh state (useful after logout)
   */
  static reset(): void {
    this.stopAutoRefresh();
    refreshState.clear();
  }
}

// =====================
// Automatic Setup
// =====================

/**
 * Initialize token refresh on app start
 * Call this in your app initialization (e.g., _app.tsx or layout.tsx)
 */
export function initializeTokenRefresh(): void {
  if (typeof window === "undefined") return;

  // Start auto-refresh if authenticated
  if (TokenManager.isAuthenticated()) {
    TokenRefreshManager.startAutoRefresh();
  }

  // Listen for storage events (login/logout in other tabs)
  window.addEventListener("storage", (event) => {
    if (event.key === "access_token") {
      if (event.newValue) {
        // Token was added (login in another tab)
        TokenRefreshManager.startAutoRefresh();
      } else {
        // Token was removed (logout in another tab)
        TokenRefreshManager.stopAutoRefresh();
      }
    }
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    TokenRefreshManager.stopAutoRefresh();
  });
}

// =====================
// Export
// =====================

export { refreshState };
export default TokenRefreshManager;
