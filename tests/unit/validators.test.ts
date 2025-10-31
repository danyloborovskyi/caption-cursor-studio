import { describe, it, expect } from "vitest";
import {
  Validators,
  CompositeValidators,
  ResponseValidators,
} from "@/lib/validators";

describe("Validators", () => {
  describe("email", () => {
    it("should validate correct emails", () => {
      const result = Validators.email("test@example.com");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("test@example.com");
    });

    it("should normalize email case", () => {
      const result = Validators.email("Test@Example.COM");
      expect(result.sanitized).toBe("test@example.com");
    });

    it("should reject invalid emails", () => {
      const result = Validators.email("invalid-email");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should require email", () => {
      const result = Validators.email("");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Email is required");
    });
  });

  describe("password", () => {
    it("should accept valid passwords", () => {
      const result = Validators.password("SecurePass123");
      expect(result.valid).toBe(true);
    });

    it("should enforce minimum length", () => {
      const result = Validators.password("short");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });

    it("should enforce maximum length", () => {
      const longPassword = "a".repeat(129);
      const result = Validators.password(longPassword);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must be less than 128 characters"
      );
    });

    it("should not modify password", () => {
      const password = "MyPassword123!";
      const result = Validators.password(password);
      expect(result.sanitized).toBe(password);
    });
  });

  describe("username", () => {
    it("should accept valid usernames", () => {
      const result = Validators.username("john_doe-123");
      expect(result.valid).toBe(true);
    });

    it("should enforce minimum length", () => {
      const result = Validators.username("ab");
      expect(result.valid).toBe(false);
    });

    it("should enforce maximum length", () => {
      const result = Validators.username("a".repeat(51));
      expect(result.valid).toBe(false);
    });

    it("should reject special characters", () => {
      const result = Validators.username("john@doe");
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "can only contain letters, numbers, underscores, and hyphens"
      );
    });
  });

  describe("id", () => {
    it("should accept numeric IDs", () => {
      const result = Validators.id(12345);
      expect(result.valid).toBe(true);
    });

    it("should accept string IDs", () => {
      const result = Validators.id("550e8400-e29b-41d4-a716-446655440000");
      expect(result.valid).toBe(true);
    });

    it("should reject invalid IDs", () => {
      const result = Validators.id("invalid-id");
      expect(result.valid).toBe(false);
    });
  });

  describe("searchQuery", () => {
    it("should accept valid queries", () => {
      const result = Validators.searchQuery("cat photos");
      expect(result.valid).toBe(true);
    });

    it("should enforce length limit", () => {
      const longQuery = "a".repeat(201);
      const result = Validators.searchQuery(longQuery);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Search query too long (max 200 characters)"
      );
    });

    it("should sanitize query", () => {
      const result = Validators.searchQuery("<script>alert()</script>");
      expect(result.sanitized).not.toContain("<script>");
    });
  });

  describe("description", () => {
    it("should accept valid descriptions", () => {
      const result = Validators.description("A beautiful sunset photo");
      expect(result.valid).toBe(true);
    });

    it("should enforce length limit", () => {
      const longDesc = "a".repeat(5001);
      const result = Validators.description(longDesc);
      expect(result.valid).toBe(false);
    });

    it("should sanitize HTML", () => {
      const result = Validators.description("<b>Bold</b> text");
      expect(result.sanitized).not.toContain("<b>");
    });
  });

  describe("tags", () => {
    it("should accept valid tag arrays", () => {
      const result = Validators.tags(["cat", "dog", "bird"]);
      expect(result.valid).toBe(true);
    });

    it("should reject non-arrays", () => {
      const result = Validators.tags("not-an-array");
      expect(result.valid).toBe(false);
    });

    it("should enforce maximum tags", () => {
      const manyTags = Array(101).fill("tag");
      const result = Validators.tags(manyTags);
      expect(result.valid).toBe(false);
    });

    it("should enforce tag length", () => {
      const result = Validators.tags(["a".repeat(51)]);
      expect(result.valid).toBe(false);
    });
  });

  describe("filename", () => {
    it("should accept valid filenames", () => {
      const result = Validators.filename("image.jpg");
      expect(result.valid).toBe(true);
    });

    it("should reject path traversal", () => {
      const result = Validators.filename("../../../etc/passwd");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Filename contains invalid characters");
    });

    it("should enforce length limit", () => {
      const result = Validators.filename("a".repeat(256) + ".jpg");
      expect(result.valid).toBe(false);
    });
  });

  describe("pagination", () => {
    it("should accept valid pagination", () => {
      const result = Validators.pagination({ page: 1, limit: 20 });
      expect(result.valid).toBe(true);
      expect(result.sanitized).toEqual({ page: 1, limit: 20 });
    });

    it("should use defaults for undefined values", () => {
      const result = Validators.pagination({});
      expect(result.valid).toBe(true);
      expect(result.sanitized).toEqual({ page: 1, limit: 50 });
    });

    it("should enforce page limits", () => {
      const result = Validators.pagination({ page: 1001 });
      expect(result.valid).toBe(false);
    });

    it("should enforce limit maximum", () => {
      const result = Validators.pagination({ limit: 101 });
      expect(result.valid).toBe(false);
    });
  });
});

describe("CompositeValidators", () => {
  describe("loginCredentials", () => {
    it("should validate correct credentials", () => {
      const result = CompositeValidators.loginCredentials({
        email: "test@example.com",
        password: "SecurePass123",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = CompositeValidators.loginCredentials({
        email: "invalid",
        password: "SecurePass123",
      });
      expect(result.valid).toBe(false);
    });

    it("should reject short password", () => {
      const result = CompositeValidators.loginCredentials({
        email: "test@example.com",
        password: "short",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("signupCredentials", () => {
    it("should validate with optional username", () => {
      const result = CompositeValidators.signupCredentials({
        email: "test@example.com",
        password: "SecurePass123",
        username: "john_doe",
      });
      expect(result.valid).toBe(true);
    });

    it("should validate without username", () => {
      const result = CompositeValidators.signupCredentials({
        email: "test@example.com",
        password: "SecurePass123",
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("fileUpdate", () => {
    it("should validate file updates", () => {
      const result = CompositeValidators.fileUpdate({
        description: "Updated description",
        tags: ["new", "tags"],
        filename: "updated.jpg",
      });
      expect(result.valid).toBe(true);
    });

    it("should accept partial updates", () => {
      const result = CompositeValidators.fileUpdate({
        description: "Only description",
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("searchParams", () => {
    it("should validate search parameters", () => {
      const result = CompositeValidators.searchParams({
        query: "cat photos",
        page: 1,
        limit: 20,
        sortOrder: "desc",
      });
      expect(result.valid).toBe(true);
    });
  });
});

describe("ResponseValidators", () => {
  describe("user", () => {
    it("should validate user response", () => {
      const result = ResponseValidators.user({
        id: "123",
        email: "test@example.com",
        username: "john_doe",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject missing required fields", () => {
      const result = ResponseValidators.user({
        username: "john_doe",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("User ID is missing");
    });
  });

  describe("fileItem", () => {
    it("should validate file item", () => {
      const result = ResponseValidators.fileItem({
        id: "123",
        filename: "test.jpg",
        publicUrl: "https://example.com/test.jpg",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject missing required fields", () => {
      const result = ResponseValidators.fileItem({
        id: "123",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("authResponse", () => {
    it("should validate auth response", () => {
      const result = ResponseValidators.authResponse({
        user: {
          id: "123",
          email: "test@example.com",
        },
        session: {
          access_token: "token",
        },
      });
      expect(result.valid).toBe(true);
    });

    it("should reject missing user", () => {
      const result = ResponseValidators.authResponse({
        session: { access_token: "token" },
      });
      expect(result.valid).toBe(false);
    });
  });
});
