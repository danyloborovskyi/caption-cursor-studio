/**
 * Dependency Injection Container
 * 
 * Provides a simple service container for dependency injection
 * following the Inversion of Control (IoC) principle
 */

type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

export class ServiceContainer {
  private services: Map<string, ServiceFactory<unknown>> = new Map();
  private singletons: Map<string, ServiceInstance<unknown>> = new Map();

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, factory as ServiceFactory<unknown>);
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, factory as ServiceFactory<unknown>);
    
    // Create singleton instance immediately
    const instance = factory();
    this.singletons.set(name, instance as ServiceInstance<unknown>);
  }

  /**
   * Resolve a service
   */
  resolve<T>(name: string): T {
    // Check if singleton exists
    if (this.singletons.has(name)) {
      return this.singletons.get(name) as T;
    }

    // Get factory
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service "${name}" not found in container`);
    }

    // Create instance
    return factory() as T;
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

// Export singleton container
export const container = new ServiceContainer();

