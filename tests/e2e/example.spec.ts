import { test, expect } from "@playwright/test";

/**
 * Example E2E Test Suite
 *
 * These tests verify the application works correctly from a user's perspective.
 * Run with: npm run test:e2e
 */

test.describe("Homepage", () => {
  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Caption Studio/i);

    // Check that main heading is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/");

    // Check for navigation links
    const uploadButton = page.getByRole("link", { name: /upload|my gallery/i });
    await expect(uploadButton).toBeVisible();
  });
});

test.describe("Authentication Flow", () => {
  test("should show login modal when clicking login button", async ({
    page,
  }) => {
    await page.goto("/");

    // Click login button
    const loginButton = page.getByRole("button", { name: /login|sign in/i });
    await loginButton.click();

    // Check that modal appears
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("should validate email input", async ({ page }) => {
    await page.goto("/");

    // Open login modal
    await page.getByRole("button", { name: /login|sign in/i }).click();

    // Try to submit with invalid email
    await page.fill('input[type="email"]', "invalid-email");
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.getByText(/invalid email|valid email/i)).toBeVisible();
  });
});

test.describe("Upload Page", () => {
  test("should navigate to upload page", async ({ page }) => {
    await page.goto("/");

    // Click upload link
    await page.getByRole("link", { name: /upload|my gallery/i }).click();

    // Should be on upload page
    await expect(page).toHaveURL(/\/upload/);
  });

  test("should show file upload area", async ({ page }) => {
    await page.goto("/upload");

    // Check for upload area
    await expect(
      page.getByText(/drag.*drop|choose.*file|upload/i)
    ).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check that h1 exists
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("should have keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Tab through focusable elements
    await page.keyboard.press("Tab");

    // Check that focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that page loads correctly
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Check that page loads correctly
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
