/**
 * Decorators for performance and caching
 */

import { performanceUtils } from './performance.js';

/**
 * Performance decorator for methods
 * @param {string} label - Performance label
 * @returns {Function} Decorator function
 */
export function perf(label) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args) {
      return performanceUtils.measure(
        () => originalMethod.apply(this, args),
        `${target.constructor.name}.${propertyKey}${label ? ` (${label})` : ''}`
      );
    };

    return descriptor;
  };
}

/**
 * Cache decorator for methods
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} Decorator function
 */
export function cache(ttl = 300000) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args) {
      const cacheKey = `${target.constructor.name}.${propertyKey}.${JSON.stringify(args)}`;
      const cached = performanceUtils.getCache(cacheKey);

      if (cached !== null) {
        return cached;
      }

      const result = originalMethod.apply(this, args);
      performanceUtils.setCache(cacheKey, result, ttl);
      return result;
    };

    return descriptor;
  };
}