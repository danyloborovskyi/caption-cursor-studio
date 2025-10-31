/**
 * Logger Service Implementation
 *
 * Provides structured logging with different log levels
 * and the ability to integrate with external monitoring services.
 */

import type { ILoggerService, LogLevel, LogEntry } from "./interfaces";

export class LoggerService implements ILoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      const method = console[level] || console.log;
      method(`[${level.toUpperCase()}] ${message}`, data || "");
    }

    // TODO: Send to external monitoring service in production
    // Example: Sentry, DataDog, LogRocket, etc.
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, error?: unknown): void {
    this.log("error", message, error);
  }

  getLogs(count?: number): LogEntry[] {
    if (count) {
      return this.logs.slice(-count);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Console-only Logger (for production)
 */
export class ConsoleLoggerService implements ILoggerService {
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, data || "");
    }
  }

  info(message: string, data?: unknown): void {
    console.info(`[INFO] ${message}`, data || "");
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data || "");
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error || "");
  }

  getLogs(): LogEntry[] {
    return [];
  }

  clearLogs(): void {
    // No-op for console logger
  }
}
