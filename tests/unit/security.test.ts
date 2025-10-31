import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitizeInput,
  sanitizeSearchQuery,
  sanitizeFilename,
  sanitizeTags,
  isValidEmail,
  isTokenExpired,
  generateSecureId,
  isValidImageFile,
  isSafeUrl,
  isValidId,
} from "@/lib/security";

describe("Security Utilities", () => {
  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      const malicious = '<script>alert("xss")</script>Hello';
      expect(sanitizeInput(malicious)).not.toContain("<script>");
      expect(sanitizeInput(malicious)).toContain("Hello");
    });

    it("should remove dangerous patterns", () => {
      expect(sanitizeInput("javascript:alert()")).toBe("");
      expect(sanitizeInput("data:text/html")).toBe("");
      expect(sanitizeInput("vbscript:")).toBe("");
    });

    it("should preserve safe text", () => {
      const safe = "Hello World 123";
      expect(sanitizeInput(safe)).toBe(safe);
    });

    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should handle empty strings", () => {
      expect(sanitizeInput("")).toBe("");
      expect(sanitizeInput("   ")).toBe("");
    });
  });

  describe("sanitizeSearchQuery", () => {
    it("should escape SQL injection attempts", () => {
      const query = "'; DROP TABLE users; --";
      const sanitized = sanitizeSearchQuery(query);
      expect(sanitized).not.toContain("DROP TABLE");
    });

    it("should remove special regex characters", () => {
      const query = ".*+?^${}()|[]\\";
      const sanitized = sanitizeSearchQuery(query);
      expect(sanitized).not.toMatch(/[.*+?^${}()|[\]\\]/);
    });

    it("should preserve alphanumeric characters", () => {
      const query = "cat photo 2024";
      expect(sanitizeSearchQuery(query)).toBe(query);
    });
  });

  describe("sanitizeFilename", () => {
    it("should prevent path traversal", () => {
      expect(sanitizeFilename("../../../etc/passwd")).not.toContain("..");
      expect(sanitizeFilename("../../file.txt")).not.toContain("..");
    });

    it("should remove special characters", () => {
      const filename = 'file<>:|"\\/?*.txt';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).not.toMatch(/[<>:|"\\/?*]/);
    });

    it("should preserve safe filenames", () => {
      expect(sanitizeFilename("image_2024-01.jpg")).toBe("image_2024-01.jpg");
    });

    it("should handle empty filenames", () => {
      expect(sanitizeFilename("")).toBe("");
    });
  });

  describe("sanitizeTags", () => {
    it("should remove empty tags", () => {
      const tags = ["cat", "", "  ", "dog"];
      const sanitized = sanitizeTags(tags);
      expect(sanitized).toEqual(["cat", "dog"]);
    });

    it("should trim whitespace", () => {
      const tags = ["  cat  ", "dog  "];
      const sanitized = sanitizeTags(tags);
      expect(sanitized).toEqual(["cat", "dog"]);
    });

    it("should remove duplicate tags", () => {
      const tags = ["cat", "dog", "cat", "bird", "dog"];
      const sanitized = sanitizeTags(tags);
      expect(sanitized).toEqual(["cat", "dog", "bird"]);
    });

    it("should sanitize each tag", () => {
      const tags = ["<script>alert()</script>cat", "dog"];
      const sanitized = sanitizeTags(tags);
      expect(sanitized[0]).not.toContain("<script>");
    });
  });

  describe("isValidEmail", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user @example.com")).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("   ")).toBe(false);
    });
  });

  describe("isTokenExpired", () => {
    it("should detect expired tokens", () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      expect(isTokenExpired(pastTimestamp)).toBe(true);
    });

    it("should accept valid tokens", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      expect(isTokenExpired(futureTimestamp)).toBe(false);
    });

    it("should use 5-minute buffer", () => {
      const almostExpired = Math.floor(Date.now() / 1000) + 240; // 4 minutes from now
      expect(isTokenExpired(almostExpired)).toBe(true); // Should be expired due to buffer
    });
  });

  describe("generateSecureId", () => {
    it("should generate valid UUIDs", () => {
      const id = generateSecureId();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it("should generate unique IDs", () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs of correct length", () => {
      const id = generateSecureId();
      expect(id).toHaveLength(36); // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    });
  });

  describe("isValidImageFile", () => {
    it("should accept valid image files", () => {
      const validFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const result = isValidImageFile(validFile);
      expect(result.valid).toBe(true);
    });

    it("should reject files over size limit", () => {
      const largeContent = new Array(11 * 1024 * 1024).fill("a").join(""); // 11 MB
      const largeFile = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });
      const result = isValidImageFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too large");
    });

    it("should reject invalid MIME types", () => {
      const invalidFile = new File(["content"], "test.exe", {
        type: "application/exe",
      });
      const result = isValidImageFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("file type");
    });

    it("should reject invalid extensions", () => {
      const invalidFile = new File(["content"], "test.exe", {
        type: "image/jpeg",
      });
      const result = isValidImageFile(invalidFile);
      expect(result.valid).toBe(false);
    });

    it("should reject double extensions", () => {
      const doubleExt = new File(["content"], "test.jpg.php", {
        type: "image/jpeg",
      });
      const result = isValidImageFile(doubleExt);
      expect(result.valid).toBe(false);
    });
  });

  describe("isSafeUrl", () => {
    it("should accept safe URLs", () => {
      expect(isSafeUrl("https://example.com/api")).toBe(true);
      expect(isSafeUrl("http://localhost:3000/api")).toBe(true);
    });

    it("should reject javascript: URLs", () => {
      expect(isSafeUrl("javascript:alert('xss')")).toBe(false);
    });

    it("should reject data: URLs", () => {
      expect(isSafeUrl("data:text/html,<script>alert('xss')</script>")).toBe(
        false
      );
    });

    it("should reject file: URLs", () => {
      expect(isSafeUrl("file:///etc/passwd")).toBe(false);
    });
  });

  describe("isValidId", () => {
    it("should accept valid UUIDs", () => {
      expect(isValidId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("should accept valid nanoids", () => {
      expect(isValidId("V1StGXR8_Z5jdHi6B-myT")).toBe(true);
    });

    it("should reject invalid IDs", () => {
      expect(isValidId("invalid")).toBe(false);
      expect(isValidId("../../../etc/passwd")).toBe(false);
      expect(isValidId("<script>")).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(isValidId("")).toBe(false);
    });
  });
});
