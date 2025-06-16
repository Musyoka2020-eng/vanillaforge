/**
 * Performance optimization utilities for VanillaForge
 * 
 * Provides tools for optimizing application performance including
 * lazy loading, caching, and resource management.
 */

/**
 * Performance utilities class
 */
export class PerformanceUtils {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.loadingStates = new Map();
    }

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} Debounced function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum time between executions
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Lazy load a component with intersection observer
     * @param {HTMLElement} element - Element to observe
     * @param {Function} loadCallback - Function to call when element is visible
     * @param {Object} options - Intersection observer options
     */
    lazyLoad(element, loadCallback, options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observerOptions = { ...defaultOptions, ...options };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadCallback(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            observer.observe(element);
            this.observers.set(element, observer);
        } else {
            // Fallback for browsers without IntersectionObserver
            loadCallback(element);
        }
    }

    /**
     * Cache data with expiration
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    setCache(key, data, ttl = 300000) { // 5 minutes default
        const expiry = Date.now() + ttl;
        this.cache.set(key, { data, expiry });
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {*} Cached data or null if expired/not found
     */
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now > value.expiry) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Measure function execution time
     * @param {Function} func - Function to measure
     * @param {string} label - Label for the measurement
     * @returns {Promise|*} Function result
     */
    measure(func, label = 'Function') {
        const start = performance.now();
        
        const result = func();
        
        if (result instanceof Promise) {
            return result.finally(() => {
                const end = performance.now();
                console.log(`${label} execution time: ${end - start}ms`);
            });
        } else {
            const end = performance.now();
            console.log(`${label} execution time: ${end - start}ms`);
            return result;
        }
    }

    /**
     * Batch DOM operations to avoid layout thrashing
     * @param {Function[]} operations - Array of DOM operations
     */
    batchDOMOperations(operations) {
        requestAnimationFrame(() => {
            operations.forEach(operation => operation());
        });
    }

    /**
     * Preload resources
     * @param {string[]} urls - Array of resource URLs
     * @param {string} type - Resource type ('image', 'script', 'style')
     * @returns {Promise} Promise that resolves when all resources are loaded
     */
    preloadResources(urls, type = 'image') {
        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                let element;
                
                switch (type) {
                    case 'image':
                        element = new Image();
                        break;
                    case 'script':
                        element = document.createElement('script');
                        element.async = true;
                        break;
                    case 'style':
                        element = document.createElement('link');
                        element.rel = 'stylesheet';
                        break;
                    default:
                        reject(new Error(`Unsupported resource type: ${type}`));
                        return;
                }

                element.onload = () => resolve(url);
                element.onerror = () => reject(new Error(`Failed to load ${url}`));
                
                if (type === 'script' || type === 'style') {
                    document.head.appendChild(element);
                }
                
                element.src = url;
            });
        });

        return Promise.all(promises);
    }

    /**
     * Optimize images for different screen sizes
     * @param {HTMLImageElement} img - Image element
     * @param {Object} sizes - Size configuration
     */
    optimizeImage(img, sizes = {}) {
        const defaultSizes = {
            small: '(max-width: 480px)',
            medium: '(max-width: 768px)',
            large: '(min-width: 769px)'
        };

        const imageSizes = { ...defaultSizes, ...sizes };
        
        // Create picture element for responsive images
        const picture = document.createElement('picture');
        
        Object.entries(imageSizes).forEach(([size, media]) => {
            const source = document.createElement('source');
            source.media = media;
            source.srcset = img.dataset[`src${size.charAt(0).toUpperCase() + size.slice(1)}`] || img.src;
            picture.appendChild(source);
        });
        
        picture.appendChild(img);
        return picture;
    }

    /**
     * Monitor memory usage
     * @param {Function} callback - Callback function to receive memory stats
     * @param {number} interval - Monitoring interval in milliseconds
     * @returns {number} Interval ID
     */
    monitorMemory(callback, interval = 5000) {
        if (!performance.memory) {
            console.warn('Memory monitoring not available in this browser');
            return null;
        }

        return setInterval(() => {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            callback(memory);
        }, interval);
    }

    /**
     * Cleanup observers and resources
     */
    cleanup() {
        // Clear all intersection observers
        this.observers.forEach((observer, element) => {
            observer.unobserve(element);
            observer.disconnect();
        });
        this.observers.clear();

        // Clear cache
        this.cache.clear();

        // Clear loading states
        this.loadingStates.clear();
    }

    /**
     * Create a performance mark
     * @param {string} name - Mark name
     */
    mark(name) {
        if (performance.mark) {
            performance.mark(name);
        }
    }

    /**
     * Measure performance between two marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name
     */
    measureBetween(name, startMark, endMark) {
        if (performance.measure) {
            performance.measure(name, startMark, endMark);
        }
    }

    /**
     * Get performance entries
     * @param {string} type - Entry type (mark, measure, navigation, etc.)
     * @returns {Array} Performance entries
     */
    getPerformanceEntries(type) {
        if (performance.getEntriesByType) {
            return performance.getEntriesByType(type);
        }
        return [];
    }
}

// Create global instance
export const performanceUtils = new PerformanceUtils();

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
