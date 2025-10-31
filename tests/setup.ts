import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock crypto API for Node.js environment
if (typeof global.crypto === "undefined") {
  global.crypto = {
    randomUUID: () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as unknown as Crypto;
}

// Mock localStorage with in-memory storage
const storageMock = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => {
    return storageMock.get(key) || null;
  },
  setItem: (key: string, value: string) => {
    storageMock.set(key, value);
  },
  removeItem: (key: string) => {
    storageMock.delete(key);
  },
  clear: () => {
    storageMock.clear();
  },
  get length() {
    return storageMock.size;
  },
  key: (index: number) => {
    return Array.from(storageMock.keys())[index] || null;
  },
};

global.localStorage = localStorageMock as Storage;
global.sessionStorage = localStorageMock as Storage;
