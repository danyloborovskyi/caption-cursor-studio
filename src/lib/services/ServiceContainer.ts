/**
 * Service Container
 *
 * Implements Dependency Injection pattern to manage service instances
 * and their dependencies.
 */

import type { IServiceContainer } from "./interfaces";
import { AuthService } from "./AuthService";
import { LocalStorageService } from "./StorageService";
import { LoggerService } from "./LoggerService";

// Singleton instance
let serviceContainer: IServiceContainer | null = null;

/**
 * Initialize or get the service container
 */
export function getServiceContainer(): IServiceContainer {
  if (!serviceContainer) {
    // Create service instances
    const storageService = new LocalStorageService();
    const loggerService = new LoggerService();

    // Inject dependencies
    const authService = new AuthService(storageService, loggerService);

    // Note: FileService will be added when implemented
    serviceContainer = {
      authService,
      fileService: null as any, // TODO: Implement FileService
      storageService,
      loggerService,
    };
  }

  return serviceContainer;
}

/**
 * Reset service container (useful for testing)
 */
export function resetServiceContainer(): void {
  serviceContainer = null;
}

/**
 * Get individual services (convenience methods)
 */
export const useAuthService = () => getServiceContainer().authService;
export const useStorageService = () => getServiceContainer().storageService;
export const useLoggerService = () => getServiceContainer().loggerService;
