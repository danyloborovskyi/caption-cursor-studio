/**
 * API Request/Response Validators
 *
 * Validates data structures to ensure type safety and prevent injection attacks
 */

import {
  isValidEmail,
  sanitizeInput,
  sanitizeSearchQuery,
  sanitizeFilename,
  sanitizeTags,
  isValidId,
} from "./security";

// =====================
// Validation Result
// =====================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: unknown;
}

// =====================
// Common Validators
// =====================

export class Validators {
  /**
   * Validate email
   */
  static email(email: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof email !== "string") {
      errors.push("Email must be a string");
      return { valid: false, errors };
    }

    if (!email.trim()) {
      errors.push("Email is required");
      return { valid: false, errors };
    }

    if (!isValidEmail(email)) {
      errors.push("Invalid email format");
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      sanitized: email.trim().toLowerCase(),
    };
  }

  /**
   * Validate password
   */
  static password(password: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof password !== "string") {
      errors.push("Password must be a string");
      return { valid: false, errors };
    }

    if (!password) {
      errors.push("Password is required");
      return { valid: false, errors };
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    // Don't sanitize passwords - they should be used as-is
    return {
      valid: errors.length === 0,
      errors,
      sanitized: password,
    };
  }

  /**
   * Validate username
   */
  static username(username: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof username !== "string") {
      errors.push("Username must be a string");
      return { valid: false, errors };
    }

    const trimmed = username.trim();

    if (!trimmed) {
      errors.push("Username is required");
      return { valid: false, errors };
    }

    if (trimmed.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (trimmed.length > 50) {
      errors.push("Username must be less than 50 characters");
    }

    // Username should only contain alphanumeric, underscore, hyphen
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      errors.push(
        "Username can only contain letters, numbers, underscores, and hyphens"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: trimmed,
    };
  }

  /**
   * Validate ID (numeric or UUID)
   */
  static id(id: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof id !== "string" && typeof id !== "number") {
      errors.push("ID must be a string or number");
      return { valid: false, errors };
    }

    const idStr = String(id);

    // Check if it's a valid ID format
    if (!isValidId(idStr) && !/^\d+$/.test(idStr)) {
      errors.push("Invalid ID format");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: idStr,
    };
  }

  /**
   * Validate search query
   */
  static searchQuery(query: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof query !== "string") {
      errors.push("Search query must be a string");
      return { valid: false, errors };
    }

    const trimmed = query.trim();

    if (trimmed.length > 200) {
      errors.push("Search query too long (max 200 characters)");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: sanitizeSearchQuery(trimmed),
    };
  }

  /**
   * Validate description
   */
  static description(description: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof description !== "string") {
      errors.push("Description must be a string");
      return { valid: false, errors };
    }

    const trimmed = description.trim();

    if (trimmed.length > 5000) {
      errors.push("Description too long (max 5000 characters)");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: sanitizeInput(trimmed),
    };
  }

  /**
   * Validate tags array
   */
  static tags(tags: unknown): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(tags)) {
      errors.push("Tags must be an array");
      return { valid: false, errors };
    }

    if (tags.length > 100) {
      errors.push("Too many tags (max 100)");
    }

    // Validate each tag
    for (const tag of tags) {
      if (typeof tag !== "string") {
        errors.push("All tags must be strings");
        break;
      }

      if (tag.trim().length > 50) {
        errors.push("Tag too long (max 50 characters per tag)");
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: sanitizeTags(tags as string[]),
    };
  }

  /**
   * Validate filename
   */
  static filename(filename: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof filename !== "string") {
      errors.push("Filename must be a string");
      return { valid: false, errors };
    }

    const trimmed = filename.trim();

    if (!trimmed) {
      errors.push("Filename is required");
      return { valid: false, errors };
    }

    if (trimmed.length > 255) {
      errors.push("Filename too long (max 255 characters)");
    }

    // Check for path traversal attempts
    if (
      trimmed.includes("..") ||
      trimmed.includes("/") ||
      trimmed.includes("\\")
    ) {
      errors.push("Filename contains invalid characters");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: sanitizeFilename(trimmed),
    };
  }

  /**
   * Validate tag style
   */
  static tagStyle(style: unknown): ValidationResult {
    const errors: string[] = [];
    const validStyles = ["neutral", "playful", "seo"];

    if (typeof style !== "string") {
      errors.push("Tag style must be a string");
      return { valid: false, errors };
    }

    if (!validStyles.includes(style)) {
      errors.push(`Tag style must be one of: ${validStyles.join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: style,
    };
  }

  /**
   * Validate pagination parameters
   */
  static pagination(params: {
    page?: unknown;
    limit?: unknown;
  }): ValidationResult {
    const errors: string[] = [];
    const sanitized: { page: number; limit: number } = { page: 1, limit: 50 };

    // Validate page
    if (params.page !== undefined) {
      const page = Number(params.page);
      if (isNaN(page) || page < 1) {
        errors.push("Page must be a positive number");
      } else if (page > 1000) {
        errors.push("Page number too large (max 1000)");
      } else {
        sanitized.page = Math.floor(page);
      }
    }

    // Validate limit
    if (params.limit !== undefined) {
      const limit = Number(params.limit);
      if (isNaN(limit) || limit < 1) {
        errors.push("Limit must be a positive number");
      } else if (limit > 100) {
        errors.push("Limit too large (max 100)");
      } else {
        sanitized.limit = Math.floor(limit);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  /**
   * Validate sort order
   */
  static sortOrder(order: unknown): ValidationResult {
    const errors: string[] = [];
    const validOrders = ["asc", "desc"];

    if (typeof order !== "string") {
      errors.push("Sort order must be a string");
      return { valid: false, errors };
    }

    if (!validOrders.includes(order.toLowerCase())) {
      errors.push("Sort order must be 'asc' or 'desc'");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: order.toLowerCase(),
    };
  }
}

// =====================
// Composite Validators
// =====================

export class CompositeValidators {
  /**
   * Validate login credentials
   */
  static loginCredentials(data: unknown): ValidationResult {
    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Invalid credentials data"] };
    }

    const credentials = data as Record<string, unknown>;
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    // Validate email
    const emailResult = Validators.email(credentials.email);
    if (!emailResult.valid) {
      errors.push(...emailResult.errors);
    } else {
      sanitized.email = emailResult.sanitized;
    }

    // Validate password
    const passwordResult = Validators.password(credentials.password);
    if (!passwordResult.valid) {
      errors.push(...passwordResult.errors);
    } else {
      sanitized.password = passwordResult.sanitized;
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  /**
   * Validate signup credentials
   */
  static signupCredentials(data: unknown): ValidationResult {
    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Invalid credentials data"] };
    }

    const credentials = data as Record<string, unknown>;
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    // Validate email
    const emailResult = Validators.email(credentials.email);
    if (!emailResult.valid) {
      errors.push(...emailResult.errors);
    } else {
      sanitized.email = emailResult.sanitized;
    }

    // Validate password
    const passwordResult = Validators.password(credentials.password);
    if (!passwordResult.valid) {
      errors.push(...passwordResult.errors);
    } else {
      sanitized.password = passwordResult.sanitized;
    }

    // Validate username (optional)
    if (credentials.username !== undefined && credentials.username !== null) {
      const usernameResult = Validators.username(credentials.username);
      if (!usernameResult.valid) {
        errors.push(...usernameResult.errors);
      } else {
        sanitized.username = usernameResult.sanitized;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  /**
   * Validate file update data
   */
  static fileUpdate(data: unknown): ValidationResult {
    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Invalid file update data"] };
    }

    const update = data as Record<string, unknown>;
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    // Validate description (optional)
    if (update.description !== undefined) {
      const descResult = Validators.description(update.description);
      if (!descResult.valid) {
        errors.push(...descResult.errors);
      } else {
        sanitized.description = descResult.sanitized;
      }
    }

    // Validate tags (optional)
    if (update.tags !== undefined) {
      const tagsResult = Validators.tags(update.tags);
      if (!tagsResult.valid) {
        errors.push(...tagsResult.errors);
      } else {
        sanitized.tags = tagsResult.sanitized;
      }
    }

    // Validate filename (optional)
    if (update.filename !== undefined) {
      const filenameResult = Validators.filename(update.filename);
      if (!filenameResult.valid) {
        errors.push(...filenameResult.errors);
      } else {
        sanitized.filename = filenameResult.sanitized;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  /**
   * Validate search params
   */
  static searchParams(params: unknown): ValidationResult {
    if (typeof params !== "object" || params === null) {
      return { valid: false, errors: ["Invalid search parameters"] };
    }

    const search = params as Record<string, unknown>;
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    // Validate query
    if (search.query !== undefined) {
      const queryResult = Validators.searchQuery(search.query);
      if (!queryResult.valid) {
        errors.push(...queryResult.errors);
      } else {
        sanitized.query = queryResult.sanitized;
      }
    }

    // Validate pagination
    const paginationResult = Validators.pagination({
      page: search.page,
      limit: search.limit,
    });
    if (!paginationResult.valid) {
      errors.push(...paginationResult.errors);
    } else {
      Object.assign(sanitized, paginationResult.sanitized);
    }

    // Validate sort order
    if (search.sortOrder !== undefined) {
      const sortResult = Validators.sortOrder(search.sortOrder);
      if (!sortResult.valid) {
        errors.push(...sortResult.errors);
      } else {
        sanitized.sortOrder = sortResult.sanitized;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized,
    };
  }
}

// =====================
// Response Validators
// =====================

export class ResponseValidators {
  /**
   * Validate user response
   */
  static user(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Invalid user data"] };
    }

    const user = data as Record<string, unknown>;

    // Required fields
    if (!user.id) errors.push("User ID is missing");
    if (!user.email) errors.push("User email is missing");

    // Type checks
    if (user.email && typeof user.email !== "string") {
      errors.push("User email must be a string");
    }
    if (user.username && typeof user.username !== "string") {
      errors.push("User username must be a string");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: data,
    };
  }

  /**
   * Validate file item response
   */
  static fileItem(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Invalid file data"] };
    }

    const file = data as Record<string, unknown>;

    // Required fields
    if (!file.id) errors.push("File ID is missing");
    if (!file.filename) errors.push("Filename is missing");
    if (!file.publicUrl) errors.push("Public URL is missing");

    // Type checks
    if (file.description && typeof file.description !== "string") {
      errors.push("Description must be a string");
    }
    if (file.tags && !Array.isArray(file.tags)) {
      errors.push("Tags must be an array");
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: data,
    };
  }

  /**
   * Validate authentication response
   */
  static authResponse(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Invalid auth response"] };
    }

    const response = data as Record<string, unknown>;

    // Check for user
    if (!response.user) {
      errors.push("User data is missing");
    } else {
      const userResult = this.user(response.user);
      if (!userResult.valid) {
        errors.push(...userResult.errors);
      }
    }

    // Check for session (optional)
    if (response.session) {
      const session = response.session as Record<string, unknown>;
      if (!session.access_token) {
        errors.push("Access token is missing");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: data,
    };
  }
}
