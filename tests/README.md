# Testing Guide

## Overview

This project uses **Vitest** as the testing framework with React Testing Library for component tests.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.ts              # Test configuration
├── unit/                 # Unit tests
│   ├── security.test.ts  # Security utilities
│   └── validators.test.ts # Input validators
├── integration/          # Integration tests
│   └── (future tests)
└── e2e/                  # End-to-end tests
    └── (future tests)
```

## Writing Tests

### Unit Tests

Test individual functions and utilities:

```typescript
import { describe, it, expect } from "vitest";
import { sanitizeInput } from "@/lib/security";

describe("sanitizeInput", () => {
  it("should remove HTML tags", () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).not.toContain("<script>");
  });
});
```

### Component Tests

Test React components:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("should render correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### Service Tests

Test service layer with dependency injection:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "@/lib/services/AuthService";
import { MemoryStorageService } from "@/lib/services/StorageService";
import { LoggerService } from "@/lib/services/LoggerService";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    const storage = new MemoryStorageService();
    const logger = new LoggerService();
    authService = new AuthService(storage, logger);
  });

  it("should login successfully", async () => {
    // Test implementation
  });
});
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Critical Paths**: 100% coverage (security, auth, validation)
- **Integration Tests**: Cover main user flows
- **E2E Tests**: Cover critical business paths

## Current Coverage

Run `npm run test:coverage` to see current coverage metrics.

## Best Practices

1. **Test Behavior, Not Implementation**

   - Focus on what the code does, not how it does it

2. **Keep Tests Simple**

   - One assertion per test when possible
   - Clear test names

3. **Use Arrange-Act-Assert Pattern**

   ```typescript
   it("should do something", () => {
     // Arrange - set up test data
     const input = "test";

     // Act - perform the action
     const result = myFunction(input);

     // Assert - verify the result
     expect(result).toBe("expected");
   });
   ```

4. **Mock External Dependencies**

   - API calls
   - Browser APIs
   - Third-party libraries

5. **Test Edge Cases**
   - Empty inputs
   - Null/undefined
   - Very large inputs
   - Invalid inputs

## Debugging Tests

1. **Use test.only to run a single test:**

   ```typescript
   it.only("should do something", () => {
     // This test will run alone
   });
   ```

2. **Use console.log for debugging:**

   ```typescript
   it("should do something", () => {
     console.log("Debug:", myVariable);
     expect(myVariable).toBe("value");
   });
   ```

3. **Use Vitest UI for visual debugging:**
   ```bash
   npm run test:ui
   ```

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:run

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Future Improvements

- [ ] Add integration tests
- [ ] Add E2E tests with Playwright
- [ ] Increase coverage to 80%+
- [ ] Add visual regression tests
- [ ] Add performance tests
