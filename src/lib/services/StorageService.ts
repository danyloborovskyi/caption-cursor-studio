/**
 * Storage Service Implementation
 *
 * Abstracts localStorage to allow for easy testing and future
 * migration to different storage solutions.
 */

import type { IStorageService } from "./interfaces";

export class LocalStorageService implements IStorageService {
  getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.clear();
  }
}

/**
 * In-Memory Storage (for testing)
 */
export class MemoryStorageService implements IStorageService {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
