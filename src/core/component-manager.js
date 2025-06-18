/**
 * Component Manager
 * 
 * Manages component registration, loading, rendering, and lifecycle.
 * Handles component registration, instantiation, and lifecycle management.
 * 
 * @author VanillaForge Team
 * @version 1.0.0
 * @since 2025-06-15
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { DOMRenderer } from './dom-renderer.js';

export class ComponentManager {
  constructor(eventBus, logger, errorHandler) {
    this.eventBus = eventBus;
    this.logger = logger || new Logger('ComponentManager');
    this.errorHandler = errorHandler || new ErrorHandler();
    this.renderer = new DOMRenderer(this.logger);
    
    this.components = new Map();
    this.activeComponents = new Map();
    this.isInitialized = false;
    
    this.logger.debug('ComponentManager instance created');
  }
  /**
   * Initialize the component manager
   * 
   * @returns {Promise<void>}
   */
  async init() {
    try {
      this.logger.info('Initializing component manager...');
      
      // Register built-in components
      this.registerBuiltInComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('✅ Component manager initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize component manager', error);
      throw error;
    }
  }

  /**
   * Alias for init() to maintain compatibility with FrameworkApp
   */
  async initialize() {
    return this.init();
  }  /**
   * Register built-in components
   * 
   * @private
   */    
  registerBuiltInComponents() {
    this.logger.debug('Registering built-in components...');
    
    // Built-in components will be registered externally via app.initialize()
    // to avoid circular import dependencies
    
    this.logger.debug(`Built-in components ready for external registration`);
  }

  /**
   * Register a component
   * 
   * @param {string} name - Component name
   * @param {Class} ComponentClass - Component class
   */
  registerComponent(name, ComponentClass) {
    if (this.components.has(name)) {
      this.logger.warn(`Component ${name} already registered, overwriting`);
    }
    
    this.components.set(name, ComponentClass);
    this.logger.debug(`Component registered: ${name}`);
  }  /**
   * Load and render a component
   * 
   * @param {string} componentName - Name of component to load
   * @param {Object} props - Props to pass to component
   * @param {string} containerId - ID of container element
   * @returns {Promise<Object>} Component instance
   */
  async loadComponent(componentName, props = {}, containerId = 'main-content') {
    const ComponentClass = this.components.get(componentName);
    if (!ComponentClass) {
      const error = new Error(`Component not registered: ${componentName}`);
      this.errorHandler.handleError(error);
      throw error;
    }
    return this.loadComponentClass(ComponentClass, props, containerId);
  }

  /**
   * Load a component by class directly (for router use)
   * 
   * @param {Function} ComponentClass - Component class constructor
   * @param {Object} props - Component props
   * @param {string} containerId - Target container ID
   * @returns {Promise<Object>} Component instance
   */
  async loadComponentClass(ComponentClass, props = {}, containerId = 'main-content') {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container not found: ${containerId}`);
      }

      const instance = new ComponentClass(this.eventBus, props);
      instance.container = container;

      await instance.init();
      this.renderer.render(instance, container);      if (instance.getLifecycle && typeof instance.getLifecycle === 'function') {
        const lifecycle = instance.getLifecycle();
        if (lifecycle.onMount && typeof lifecycle.onMount === 'function') {
          await lifecycle.onMount.call(instance);
        }
      }

      const instanceId = `${instance.name}-${Date.now()}`;
      this.activeComponents.set(instanceId, instance);

      this.logger.info(`Component loaded successfully: ${instance.name}`);
      return instance;
    } catch (error) {
      this.errorHandler.handleError(error, {
        componentName: ComponentClass.name,
        containerId
      });
      throw error;
    }
  }

  /**
   * Unload a component
   * 
   * @param {string} componentId - Component instance ID
   * @returns {Promise<boolean>} Success status
   */
  async unloadComponent(componentId) {
    try {
      const instance = this.activeComponents.get(componentId);
      
      if (!instance) {
        this.logger.warn(`Component instance not found: ${componentId}`);
        return false;
      }      // Call lifecycle onUnmount
      if (instance.getLifecycle && typeof instance.getLifecycle === 'function') {
        const lifecycle = instance.getLifecycle();
        if (lifecycle.onUnmount && typeof lifecycle.onUnmount === 'function') {
          await lifecycle.onUnmount.call(instance);
        }
      }
      
      this.renderer.cleanupComponentListeners(instance);
      
      // Call component's own destroy method for internal cleanup
      if (typeof instance.destroy === 'function') {
        instance.destroy();
      }
      
      // Remove from DOM
      if (instance.element) {
        instance.element.remove();
      }
      
      // Remove from active components
      this.activeComponents.delete(componentId);
      
      this.logger.debug(`Component unloaded: ${instance.name}`);
      return true;
      
    } catch (error) {
      this.logger.error(`Failed to unload component: ${componentId}`, error);
      return false;
    }
  }


  /**
   * Set up event listeners
   * 
   * @private
   */  setupEventListeners() {
    // Listen for component load requests
    this.eventBus.on('component:load', async ({ name, props, containerId }) => {
      try {
        await this.loadComponent(name, props, containerId);
      } catch (error) {
        this.logger.error('Failed to load requested component', error);
        this.eventBus.emit('component:error', { error, componentName: name });
      }
    });    // Listen for router component load requests
    this.eventBus.on('router:load-component', async ({ component, route }) => {
      try {
        if (typeof component === 'string') {
          // Component name - load by name
          await this.loadComponent(component, { route }, 'main-content');
        } else if (typeof component === 'function') {
          // Component class - load directly
          await this.loadComponentClass(component, { route }, 'main-content');
        } else {
          throw new Error(`Invalid component type: ${typeof component}`);
        }
        
        this.logger.info(`Component loaded successfully: ${component.name || component}`);
      } catch (error) {
        this.logger.error('Failed to load router component', error);
        this.eventBus.emit('component:error', { error, componentName: component });
      }
    });
    
    // Listen for component unload requests
    this.eventBus.on('component:unload', async ({ componentId }) => {
      await this.unloadComponent(componentId);
    });
  }

  /**
   * Get active components
   * 
   * @returns {Map} Active components
   */
  getActiveComponents() {
    return new Map(this.activeComponents);
  }

  /**
   * Get registered components
   * 
   * @returns {Array} Component names
   */
  getRegisteredComponents() {
    return Array.from(this.components.keys());
  }

  /**
   * Clean up component manager
   * 
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      this.logger.info('Cleaning up component manager');
      
      // Unload all active components
      const componentIds = Array.from(this.activeComponents.keys());
      for (const componentId of componentIds) {
        await this.unloadComponent(componentId);
      }
      
      // Clear registrations
      this.components.clear();
      this.activeComponents.clear();
      
      // Reset state
      this.isInitialized = false;
      
      this.logger.info('Component manager cleanup complete');
      
    } catch (error) {
      this.logger.error('Error during component manager cleanup', error);
    }
  }
}
