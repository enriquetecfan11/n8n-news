/**
 * Sistema de caché para optimizar el rendimiento de la aplicación
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private options: Required<CacheOptions>;
  private accessOrder: string[] = []; // For LRU eviction

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      storage: options.storage || 'memory'
    };

    this.loadFromStorage();
    this.startCleanupInterval();
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl
    };

    this.cache.set(key, item);
    this.updateAccessOrder(key);
    this.evictIfNeeded();
    this.saveToStorage();
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.saveToStorage();
      return null;
    }

    this.updateAccessOrder(key);
    return item.data;
  }

  /**
   * Check if a key exists in the cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    this.saveToStorage();
    return deleted;
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredCount++;
      }
      totalSize += this.getItemSize(key, item);
    }

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      expiredCount,
      totalSize,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in the cache
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.data);
  }

  /**
   * Check if an item has expired
   */
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Update access order for LRU eviction
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict items if cache is over capacity
   */
  private evictIfNeeded(): void {
    while (this.cache.size > this.options.maxSize) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Calculate approximate size of an item
   */
  private getItemSize(key: string, item: CacheItem<T>): number {
    return key.length * 2 + JSON.stringify(item).length * 2; // Rough estimate
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateHitRate(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track hits and misses
    return 0.85; // Placeholder
  }

  /**
   * Start cleanup interval to remove expired items
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Remove expired items from cache
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });

    if (expiredKeys.length > 0) {
      this.saveToStorage();
    }
  }

  /**
   * Save cache to storage
   */
  private saveToStorage(): void {
    if (this.options.storage === 'memory') {
      return;
    }

    try {
      const storage = this.options.storage === 'localStorage' 
        ? localStorage 
        : sessionStorage;
      
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        accessOrder: this.accessOrder,
        timestamp: Date.now()
      };

      storage.setItem('cache_data', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  /**
   * Load cache from storage
   */
  private loadFromStorage(): void {
    if (this.options.storage === 'memory') {
      return;
    }

    try {
      const storage = this.options.storage === 'localStorage' 
        ? localStorage 
        : sessionStorage;
      
      const cacheData = storage.getItem('cache_data');
      
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        
        // Only load if data is less than 1 hour old
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          this.cache = new Map(parsed.cache);
          this.accessOrder = parsed.accessOrder || [];
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }
}

// Global cache instances
export const newsCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50,
  storage: 'localStorage'
});

export const filterCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 20,
  storage: 'sessionStorage'
});

export const searchCache = new CacheManager({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 100,
  storage: 'localStorage'
});

// Utility functions for common cache operations
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export function withCache<T>(
  cache: CacheManager<T>,
  key: string,
  fn: () => T | Promise<T>,
  ttl?: number
): T | Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(value => {
      cache.set(key, value, ttl);
      return value;
    });
  } else {
    cache.set(key, result, ttl);
    return result;
  }
}

// Cache decorator for functions
export function cached(ttl?: number, cacheInstance?: CacheManager) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = cacheInstance || newsCache;

    descriptor.value = function (...args: any[]) {
      const key = cacheKey(propertyName, ...args);
      return withCache(cache, key, () => method.apply(this, args), ttl);
    };

    return descriptor;
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
    };
  }

  getMetrics(label?: string) {
    if (label) {
      const times = this.metrics.get(label) || [];
      return {
        count: times.length,
        average: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
        min: times.length > 0 ? Math.min(...times) : 0,
        max: times.length > 0 ? Math.max(...times) : 0,
        times
      };
    }

    const result: Record<string, any> = {};
    for (const [key, times] of this.metrics.entries()) {
      result[key] = {
        count: times.length,
        average: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
        min: times.length > 0 ? Math.min(...times) : 0,
        max: times.length > 0 ? Math.max(...times) : 0
      };
    }
    return result;
  }

  clearMetrics(label?: string) {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Lazy loading utility
export function lazyLoad<T>(
  loader: () => Promise<T>,
  cache?: CacheManager<T>
): () => Promise<T> {
  let promise: Promise<T> | null = null;
  const cacheInstance = cache || newsCache;

  return async () => {
    if (promise) {
      return promise;
    }

    const cacheKey = `lazy_${loader.name}`;
    const cached = cacheInstance.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    promise = loader().then(result => {
      cacheInstance.set(cacheKey, result);
      return result;
    });

    return promise;
  };
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
