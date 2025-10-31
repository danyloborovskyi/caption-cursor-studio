/**
 * Storage Service Implementation
 * 
 * Abstraction over localStorage with SSR safety
 */

import { IStorageService } from "../types";

export class StorageService implements IStorageService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  getItem(key: string): string | null {
    if (!this.isClient()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Storage error getting ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Storage error setting ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    if (!this.isClient()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage error removing ${key}:`, error);
    }
  }

  clear(): void {
    if (!this.isClient()) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage error clearing:", error);
    }
  }
}

