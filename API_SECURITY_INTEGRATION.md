# API Security Integration Guide

This guide shows how to integrate the new secure API client into your existing codebase.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Migration Guide](#migration-guide)
4. [Usage Examples](#usage-examples)
5. [Token Refresh Setup](#token-refresh-setup)
6. [Validation](#validation)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Overview

The secure API client provides:

- ✅ **Automatic rate limiting** - Per-operation limits
- ✅ **Token management** - Expiration checking & refresh
- ✅ **Request/response validation** - Input sanitization
- ✅ **CSRF protection** - Automatic token inclusion
- ✅ **Error handling** - Sanitized, user-friendly errors
- ✅ **Request logging** - Monitoring and debugging
- ✅ **Security headers** - Automatic header injection

---

## Quick Start

### 1. Setup Token Refresh (One-time)

Add to your root layout or `_app.tsx`:

```typescript
// src/app/layout.tsx or pages/_app.tsx
import { initializeTokenRefresh } from "@/lib/tokenRefresh";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize automatic token refresh
    initializeTokenRefresh();
  }, []);

  return children;
}
```

### 2. Use Secure API Client

```typescript
import { apiClient } from "@/lib/secureApiClient";
import { Validators } from "@/lib/validators";

// Simple GET request
const response = await apiClient.get("/api/users");

// POST with validation
const loginData = { email: "user@example.com", password: "password123" };
const validation = Validators.loginCredentials(loginData);

if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
  return;
}

const response = await apiClient.post("/auth/login", validation.sanitized);
```

---

## Migration Guide

### Before (Old API)

```typescript
// src/lib/api.ts - OLD WAY
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    return { success: false, error: "Login failed" };
  }

  const data = await response.json();
  return { success: true, data };
}
```

### After (Secure API Client)

```typescript
// src/lib/api.ts - NEW WAY
import { apiClient } from "@/lib/secureApiClient";
import { CompositeValidators } from "@/lib/validators";
import { rateLimitConfigs } from "@/lib/apiWrapper";

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  // Validate input
  const validation = CompositeValidators.loginCredentials(credentials);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(", "),
    };
  }

  // Make secure request with rate limiting
  const response = await apiClient.requestWithRateLimit(
    "/auth/login",
    {
      method: "POST",
      body: validation.sanitized,
      skipAuth: true, // No token needed for login
    },
    "login" // Rate limit key from rateLimitConfigs
  );

  return response as AuthResponse;
}
```

---

## Usage Examples

### Authentication

```typescript
import { apiClient, TokenManager } from "@/lib/secureApiClient";
import { CompositeValidators } from "@/lib/validators";
import TokenRefreshManager from "@/lib/tokenRefresh";

// Login
export async function login(email: string, password: string) {
  const validation = CompositeValidators.loginCredentials({ email, password });

  if (!validation.valid) {
    return { success: false, error: validation.errors[0] };
  }

  const response = await apiClient.requestWithRateLimit(
    "/auth/login",
    {
      method: "POST",
      body: validation.sanitized,
      skipAuth: true,
    },
    "login"
  );

  if (response.success && response.data?.session) {
    // Store tokens
    TokenManager.setTokens(
      response.data.session.access_token,
      response.data.session.refresh_token,
      response.data.session.expires_in
    );

    // Start auto-refresh
    TokenRefreshManager.startAutoRefresh();
  }

  return response;
}

// Logout
export async function logout() {
  await apiClient.post("/auth/logout");
  TokenManager.clearTokens();
  TokenRefreshManager.stopAutoRefresh();
}

// Check if authenticated
export function isAuthenticated(): boolean {
  return TokenManager.isAuthenticated();
}
```

### File Operations

```typescript
import { apiClient } from "@/lib/secureApiClient";
import { Validators, CompositeValidators } from "@/lib/validators";
import { isValidImageFile, sanitizeFilename } from "@/lib/security";

// Upload file
export async function uploadFile(file: File, tagStyle: string) {
  // Validate file
  const fileValidation = isValidImageFile(file);
  if (!fileValidation.valid) {
    return { success: false, error: fileValidation.error };
  }

  // Validate tag style
  const styleValidation = Validators.tagStyle(tagStyle);
  if (!styleValidation.valid) {
    return { success: false, error: styleValidation.errors[0] };
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tagStyle", styleValidation.sanitized as string);

  // Upload with rate limiting
  const response = await apiClient.requestWithRateLimit(
    "/files/upload",
    {
      method: "POST",
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    },
    "fileUpload"
  );

  return response;
}

// Update file
export async function updateFile(id: string, updates: Record<string, unknown>) {
  // Validate ID
  const idValidation = Validators.id(id);
  if (!idValidation.valid) {
    return { success: false, error: "Invalid file ID" };
  }

  // Validate updates
  const updateValidation = CompositeValidators.fileUpdate(updates);
  if (!updateValidation.valid) {
    return { success: false, error: updateValidation.errors[0] };
  }

  // Make request
  const response = await apiClient.requestWithRateLimit(
    `/files/${idValidation.sanitized}`,
    {
      method: "PUT",
      body: updateValidation.sanitized,
    },
    "fileUpdate"
  );

  return response;
}

// Delete file
export async function deleteFile(id: string) {
  const idValidation = Validators.id(id);
  if (!idValidation.valid) {
    return { success: false, error: "Invalid file ID" };
  }

  const response = await apiClient.requestWithRateLimit(
    `/files/${idValidation.sanitized}`,
    { method: "DELETE" },
    "fileDelete"
  );

  return response;
}
```

### Search

```typescript
import { apiClient } from "@/lib/secureApiClient";
import { CompositeValidators } from "@/lib/validators";

export async function searchFiles(
  query: string,
  page: number = 1,
  limit: number = 50
) {
  // Validate search params
  const validation = CompositeValidators.searchParams({
    query,
    page,
    limit,
  });

  if (!validation.valid) {
    return { success: false, error: validation.errors[0] };
  }

  const params = validation.sanitized as Record<string, string | number>;

  // Build query string
  const queryString = new URLSearchParams({
    q: String(params.query),
    page: String(params.page),
    limit: String(params.limit),
  }).toString();

  // Make request
  const response = await apiClient.requestWithRateLimit(
    `/files/search?${queryString}`,
    { method: "GET" },
    "search"
  );

  return response;
}
```

---

## Token Refresh Setup

### Automatic Refresh

The token refresh manager automatically refreshes tokens 5 minutes before expiration:

```typescript
// src/app/layout.tsx
import { initializeTokenRefresh } from "@/lib/tokenRefresh";

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeTokenRefresh();
  }, []);

  return children;
}
```

### Manual Refresh

```typescript
import TokenRefreshManager from "@/lib/tokenRefresh";

// Check if refresh is needed
if (TokenRefreshManager.shouldRefreshToken()) {
  await TokenRefreshManager.refreshToken();
}

// Refresh if needed before important operation
await TokenRefreshManager.refreshIfNeeded();
```

### On Login

```typescript
import TokenRefreshManager from "@/lib/tokenRefresh";

// After successful login
TokenRefreshManager.startAutoRefresh();

// On logout
TokenRefreshManager.stopAutoRefresh();
```

---

## Validation

### Input Validation

```typescript
import { Validators } from "@/lib/validators";

// Validate single field
const emailResult = Validators.email("user@example.com");
if (!emailResult.valid) {
  console.error(emailResult.errors);
} else {
  console.log("Sanitized:", emailResult.sanitized);
}

// Validate multiple fields
const passwordResult = Validators.password("myPassword123");
const usernameResult = Validators.username("john_doe");
```

### Composite Validation

```typescript
import { CompositeValidators } from "@/lib/validators";

// Validate login
const loginResult = CompositeValidators.loginCredentials({
  email: "user@example.com",
  password: "password123",
});

// Validate file update
const updateResult = CompositeValidators.fileUpdate({
  description: "New description",
  tags: ["tag1", "tag2"],
});

// Validate search
const searchResult = CompositeValidators.searchParams({
  query: "cat photos",
  page: 1,
  limit: 20,
});
```

---

## Error Handling

### Handling API Errors

```typescript
const response = await apiClient.post("/api/endpoint", data);

if (!response.success) {
  // Error is already sanitized and user-friendly
  console.error(response.error);

  // Check status for specific handling
  if (response.status === 401) {
    // Redirect to login
  } else if (response.status === 429) {
    // Show rate limit message
  }
}
```

### Rate Limit Errors

```typescript
import { getRateLimitStatus } from "@/lib/apiWrapper";

try {
  const response = await apiClient.requestWithRateLimit(
    "/api/endpoint",
    options,
    "operationKey"
  );
} catch (error) {
  if (error.message.includes("rate limit")) {
    const status = getRateLimitStatus("operationKey");
    console.log(`Try again in ${status.resetIn}ms`);
  }
}
```

---

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const validation = Validators.email(userInput);
if (validation.valid) {
  await apiClient.post("/api/user", { email: validation.sanitized });
}

// ❌ Bad
await apiClient.post("/api/user", { email: userInput });
```

### 2. Use Rate Limiting

```typescript
// ✅ Good - With rate limiting
await apiClient.requestWithRateLimit("/api/endpoint", options, "operationKey");

// ⚠️ OK - Without rate limiting (for non-critical operations)
await apiClient.request("/api/endpoint", options);
```

### 3. Handle Token Expiration

```typescript
// ✅ Good
import TokenRefreshManager from "@/lib/tokenRefresh";

async function criticalOperation() {
  await TokenRefreshManager.refreshIfNeeded();
  const response = await apiClient.post("/api/critical", data);
  return response;
}

// ❌ Bad - No token check
async function criticalOperation() {
  const response = await apiClient.post("/api/critical", data);
  return response;
}
```

### 4. Use Appropriate skipAuth Flag

```typescript
// ✅ Good - Public endpoints skip auth
await apiClient.post("/auth/login", data, { skipAuth: true });

// ✅ Good - Protected endpoints use auth
await apiClient.get("/api/user/profile"); // Auth header added automatically

// ❌ Bad - Auth endpoint with auth required
await apiClient.post("/auth/login", data); // Will fail if no token
```

### 5. Monitor Request Logs

```typescript
import { apiClient } from "@/lib/secureApiClient";

// Get recent logs for debugging
const recentLogs = apiClient.getRecentLogs(10);
console.log("Recent API calls:", recentLogs);

// Get failed requests
const failed = apiClient.getFailedRequests();
console.log("Failed requests:", failed);

// Clear logs (e.g., on logout)
apiClient.clearLogs();
```

---

## Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Customizing Rate Limits

```typescript
// src/lib/apiWrapper.ts
export const rateLimitConfigs = {
  login: { maxCalls: 5, windowMs: 300000 },
  // Add your custom limits
  myOperation: { maxCalls: 10, windowMs: 60000 },
};
```

### Customizing Token Refresh

```typescript
// src/lib/tokenRefresh.ts
const REFRESH_BUFFER_SECONDS = 300; // Change to your needs
const CHECK_INTERVAL_MS = 60000; // Change check frequency
```

---

## Testing

### Unit Tests

```typescript
import { apiClient } from "@/lib/secureApiClient";
import { Validators } from "@/lib/validators";

describe("API Security", () => {
  it("validates email correctly", () => {
    const result = Validators.email("invalid-email");
    expect(result.valid).toBe(false);
  });

  it("sanitizes input", () => {
    const result = Validators.description("<script>alert('xss')</script>");
    expect(result.sanitized).not.toContain("<script>");
  });

  it("handles rate limiting", async () => {
    // Make multiple rapid requests
    const promises = Array(20)
      .fill(null)
      .map(() => apiClient.requestWithRateLimit("/api/test", {}, "test"));

    const results = await Promise.all(promises);
    const rateLimited = results.filter(
      (r) => !r.success && r.error?.includes("rate limit")
    );
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## Troubleshooting

### Token Refresh Not Working

1. Check backend endpoint: `/auth/refresh`
2. Verify refresh token is stored: `localStorage.getItem("refresh_token")`
3. Check console for refresh errors
4. Ensure `initializeTokenRefresh()` is called

### Rate Limiting Too Strict

1. Adjust limits in `src/lib/apiWrapper.ts`
2. Use `skipRateLimit: true` for specific requests
3. Reset rate limiter: `globalRateLimiter.reset("operationKey")`

### Validation Failing

1. Check validation errors: `validation.errors`
2. Use sanitized value: `validation.sanitized`
3. Verify input format matches expected type

---

## Migration Checklist

- [ ] Add `initializeTokenRefresh()` to root layout
- [ ] Replace `fetch()` calls with `apiClient`
- [ ] Add validation to all user inputs
- [ ] Add rate limiting to expensive operations
- [ ] Update error handling to use sanitized messages
- [ ] Test token refresh flow
- [ ] Test rate limiting
- [ ] Review logs for security issues
- [ ] Update backend to support token refresh
- [ ] Test with invalid/malicious inputs

---

## Resources

- **Security Utilities**: `src/lib/security.ts`
- **API Client**: `src/lib/secureApiClient.ts`
- **Validators**: `src/lib/validators.ts`
- **Token Refresh**: `src/lib/tokenRefresh.ts`
- **Rate Limiting**: `src/lib/apiWrapper.ts`
- **Documentation**: `SECURITY.md`

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
