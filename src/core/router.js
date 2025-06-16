/**
 * Router System
 * 
 * Handles client-side routing for VanillaForge applications.
 * Manages navigation, route protection, and URL state management.
 * 
 * @author VanillaForge Team
 * @version 1.0.0
 * @since 2025-06-15
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler, ErrorType } from '../utils/error-handler.js';

/**
 * Router class for client-side navigation
 * 
 * Manages application routes, navigation, and URL state without full page reloads.
 */
export class Router {
  /**
   * Initialize the router
   * 
   * @param {EventBus} eventBus - Application event bus
   */  
  constructor(eventBus) {
    this.logger = new Logger('Router');
    this.errorHandler = new ErrorHandler();
    this.eventBus = eventBus;
    this.routes = new Map();
    this.currentRoute = null;
    this.isInitialized = false;
    this.beforeNavigationCallbacks = [];
    this.afterNavigationCallbacks = [];
    
    // Navigation state tracking
    this.isNavigating = false;
    this.targetPath = null;
    
    // Bind methods
    this.handlePopState = this.handlePopState.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    
    this.logger.debug('Router instance created');
  }

  /**
   * Initialize the router
   * 
   * @returns {Promise<void>}
   */
  async init() {
    try {
      this.logger.info('Initializing router...');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Handle initial route
      await this.handleInitialRoute();
      
      this.isInitialized = true;
      this.logger.info('✅ Router initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize router', error);
      this.errorHandler.handleError(error, ErrorType.SYSTEM);
      throw error;
    }
  }

  /**
   * Alias for init() to maintain compatibility with FrameworkApp
   */
  async initialize() {
    return this.init();
  }

  /**
   * Alias for init() to maintain compatibility with FrameworkApp
   */
  async start() {
    if (!this.isInitialized) {
      await this.init();
    }
    this.logger.info('Router started');
  }

  /**
   * Add a route to the router
   * 
   * @param {string} path - Route path
   * @param {Object|Function} config - Route configuration object or component class
   */
  addRoute(path, config) {
    // Support both object config and direct component class
    const routeConfig = typeof config === 'function' ? {
      component: config,
      protected: false,
      title: null
    } : config;

    this.routes.set(path, {
      path,
      name: routeConfig.name || path.replace('/', '') || 'home',
      component: routeConfig.component,
      protected: routeConfig.protected || false,
      requiredRole: routeConfig.requiredRole || null,
      title: routeConfig.title || 'VanillaForge App',
      beforeEnter: routeConfig.beforeEnter || null,
      afterEnter: routeConfig.afterEnter || null
    });
    
    this.logger.debug(`Route added: ${path}`, routeConfig);
  }

  /**
   * Set up event listeners
   * 
   * @private
   */
  setupEventListeners() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', this.handlePopState);
    
    // Handle link clicks for SPA navigation
    document.addEventListener('click', this.handleLinkClick);
    
    this.logger.debug('Event listeners set up');
  }

  /**
   * Handle initial route when the app starts
   * 
   * @private
   */  async handleInitialRoute() {
    const currentPath = window.location.pathname;
    await this.navigateTo(currentPath, { replace: true });
  }

  /**
   * Handle browser back/forward navigation
   * 
   * @param {PopStateEvent} event - Pop state event
   * @private
   */
  async handlePopState(event) {
    const path = window.location.pathname;
    await this.navigateTo(path, { fromPopState: true });
  }

  /**
   * Handle link clicks for SPA navigation
   * 
   * @param {Event} event - Click event
   * @private
   */
  handleLinkClick(event) {
    const link = event.target.closest('a');
    
    if (!link || !link.href) return;
    
    // Only handle internal links
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;
    
    // Skip if link has download attribute or opens in new tab
    if (link.download || link.target === '_blank') return;
    
    // Skip if modifier keys are pressed
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    
    event.preventDefault();
    this.navigateTo(url.pathname + url.search + url.hash);
  }

  /**
   * Navigate to a specific path
   * 
   * @param {string} path - Path to navigate to
   * @param {Object} options - Navigation options
   * @returns {Promise<boolean>} - Success status
   */  async navigateTo(path, options = {}) {
    try {
      if (this.isNavigating) {
        this.logger.warn('Navigation already in progress');
        return false;
      }

      this.isNavigating = true;
      this.targetPath = path;
      
      this.logger.debug(`Navigating to: ${path}`);      // Find matching route
      const route = this.findRoute(path);
      
      if (!route) {
        // Try to navigate to 404 route
        const notFoundRoute = this.routes.get('/404') || this.routes.get('*');
        if (notFoundRoute && path !== '/404') {
          this.isNavigating = false;
          return this.navigateTo('/404', options);
        }
        
        this.logger.error(`No route found for path: ${path}`);
        this.isNavigating = false;
        return false;
      }

      // Run before navigation callbacks
      const canNavigate = await this.runBeforeNavigationCallbacks(route, path);
      if (!canNavigate) {
        this.isNavigating = false;
        return false;
      }

      // Update browser history
      if (!options.fromPopState) {
        if (options.replace) {
          window.history.replaceState({ path }, '', path);
        } else {
          window.history.pushState({ path }, '', path);
        }
      }      // Load the route component
      await this.loadRouteComponent(route);
      
      // Update current route
      this.currentRoute = route;
      
      // Update page title
      if (route.title) {
        document.title = route.title;
      }

      // Run after navigation callbacks
      await this.runAfterNavigationCallbacks(route, path);
      
      // Emit navigation event
      this.eventBus.emit('router:navigated', { route, path });
      
      this.logger.info(`Successfully navigated to: ${path}`);
      return true;
      
    } catch (error) {
      this.logger.error('Navigation failed', error);
      this.errorHandler.handleError(error, ErrorType.NAVIGATION);
      return false;
    } finally {
      this.isNavigating = false;
      this.targetPath = null;
    }
  }

  /**
   * Navigate (alias for navigateTo)
   */
  navigate(path, options = {}) {
    return this.navigateTo(path, options);
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Find a route that matches the given path
   * 
   * @param {string} path - Path to match
   * @returns {Object|null} - Matching route or null
   * @private
   */  findRoute(path) {
    // Exact match first
    if (this.routes.has(path)) {
      const route = this.routes.get(path);
      return route;
    }
    
    // Try to match with route parameters
    for (const [routePath, route] of this.routes) {
      if (this.matchesRoute(path, routePath)) {
        return route;
      }
    }
    
    return null;
  }

  /**
   * Check if a path matches a route pattern
   * 
   * @param {string} path - Actual path
   * @param {string} routePattern - Route pattern
   * @returns {boolean} - Whether they match
   * @private
   */
  matchesRoute(path, routePattern) {
    if (routePattern === '*') return true;
    if (routePattern === path) return true;
    
    // Simple parameter matching (e.g., /users/:id)
    const routeParts = routePattern.split('/');
    const pathParts = path.split('/');
    
    if (routeParts.length !== pathParts.length) return false;
    
    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === pathParts[index];
    });
  }

  /**
   * Load the component for a route
   * 
   * @param {Object} route - Route object
   * @private
   */  async loadRouteComponent(route) {
    if (typeof route.component === 'string') {
      // Component name - emit event to component manager
      this.eventBus.emit('router:load-component', {
        component: route.component,
        route
      });
    } else if (typeof route.component === 'function') {
      // Component class - emit event to component manager
      this.eventBus.emit('router:load-component', {
        component: route.component,
        route
      });
    } else {
      throw new Error(`Invalid component type for route: ${route.path}`);
    }
  }

  /**
   * Run before navigation callbacks
   * 
   * @param {Object} route - Route object
   * @param {string} path - Target path
   * @returns {Promise<boolean>} - Whether navigation should continue
   * @private
   */
  async runBeforeNavigationCallbacks(route, path) {
    for (const callback of this.beforeNavigationCallbacks) {
      try {
        const result = await callback(route, path);
        if (result === false) {
          this.logger.debug('Navigation cancelled by before callback');
          return false;
        }
      } catch (error) {
        this.logger.error('Before navigation callback failed', error);
        return false;
      }
    }
    
    if (route.beforeEnter) {
      try {
        const result = await route.beforeEnter(route, path);
        if (result === false) {
          this.logger.debug('Navigation cancelled by route beforeEnter');
          return false;
        }
      } catch (error) {
        this.logger.error('Route beforeEnter failed', error);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Run after navigation callbacks
   * 
   * @param {Object} route - Route object
   * @param {string} path - Current path
   * @private
   */
  async runAfterNavigationCallbacks(route, path) {
    for (const callback of this.afterNavigationCallbacks) {
      try {
        await callback(route, path);
      } catch (error) {
        this.logger.error('After navigation callback failed', error);
      }
    }
    
    if (route.afterEnter) {
      try {
        await route.afterEnter(route, path);
      } catch (error) {
        this.logger.error('Route afterEnter failed', error);
      }
    }
  }

  /**
   * Add before navigation callback
   * 
   * @param {Function} callback - Callback function
   */
  beforeNavigation(callback) {
    this.beforeNavigationCallbacks.push(callback);
  }

  /**
   * Add after navigation callback
   * 
   * @param {Function} callback - Callback function
   */
  afterNavigation(callback) {
    this.afterNavigationCallbacks.push(callback);
  }

  /**
   * Clean up router
   */
  async cleanup() {
    window.removeEventListener('popstate', this.handlePopState);
    document.removeEventListener('click', this.handleLinkClick);
    
    this.routes.clear();
    this.beforeNavigationCallbacks = [];
    this.afterNavigationCallbacks = [];
    this.currentRoute = null;
    this.isInitialized = false;
    
    this.logger.info('Router cleaned up');
  }
}
