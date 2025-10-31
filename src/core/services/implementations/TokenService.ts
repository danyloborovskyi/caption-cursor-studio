/**
 * Token Service Implementation
 * 
 * Wraps TokenManager to provide service abstraction
 */

import { TokenManager } from "@/lib/secureApiClient";
import { ITokenService } from "../types";

export class TokenService implements ITokenService {
  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  getRefreshToken(): string | null {
    return TokenManager.getRefreshToken();
  }

  getTokenExpiry(): number | null {
    return TokenManager.getTokenExpiry();
  }

  isTokenExpired(): boolean {
    return TokenManager.isTokenExpired();
  }

  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    TokenManager.setTokens(accessToken, refreshToken, expiresIn);
  }

  clearTokens(): void {
    TokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  getAuthHeader(): string | null {
    return TokenManager.getAuthHeader();
  }
}

