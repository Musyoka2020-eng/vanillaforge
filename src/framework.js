/**
 * VanillaForge Framework
 * 
 * A modern, lightweight framework for forging Single Page Applications
 * with vanilla JavaScript. No external dependencies required.
 * 
 * Features:
 * - Component-based architecture
 * - Client-side routing
 * - Event-driven communication
 * - State management
 * - Error handling and logging
 * - Build system
 * 
 * @author Stephen Musyoka - VanillaForge Creator
 * @version 1.0.0
 * @since 2025-06-15
 */

// Core Framework Components
export { ComponentManager } from './core/component-manager.js';
export { Router } from './core/router.js';
export { EventBus } from './core/event-bus.js';

// Base Classes
export { BaseComponent } from './components/base-component.js';

// Utilities
export { Logger } from './utils/logger.js';
export { ErrorHandler, ErrorType } from './utils/error-handler.js';
export { FrameworkDebug } from './utils/framework-debug.js';
export { SweetAlert } from './utils/sweet-alert.js';
export { Validator } from './utils/validation.js';

/**
 * Framework Application Class
 * 
 * Main application class that initializes and manages VanillaForge
 */
export class FrameworkApp {
    constructor(config = {}) {
        this.config = {
            appName: 'VanillaForge App',
            debug: false,
            router: {
                mode: 'history',
                fallback: '/404'
            },
            logging: {
                level: 'info',
                console: true
            },
            ...config
        };
        
        this.eventBus = new EventBus();
        this.logger = new Logger('FrameworkApp');
        this.errorHandler = new ErrorHandler();
        this.componentManager = new ComponentManager(this.eventBus);
        this.router = null;
        this.isInitialized = false;
        
        // Enable debug mode if configured
        if (this.config.debug) {
            this.frameworkDebug = new FrameworkDebug(this.eventBus);
            this.frameworkDebug.enable();
        }
        
        this.logger.info('VanillaForge application created', this.config);
    }
    
    /**
     * Initialize the framework application
     * @param {Object} options - Initialization options
     */
    async initialize(options = {}) {
        if (this.isInitialized) {
            this.logger.warn('Application already initialized');
            return;
        }
        
        try {
            this.logger.info('Initializing framework application...');
            
            // Initialize router if routing is enabled
            if (options.routes) {
                this.router = new Router(this.eventBus);
                
                // Register routes
                Object.entries(options.routes).forEach(([path, component]) => {
                    this.router.addRoute(path, component);
                });
                
                await this.router.initialize();
                this.logger.info('Router initialized with routes', Object.keys(options.routes));
            }
            
            // Register components
            if (options.components) {
                Object.entries(options.components).forEach(([name, component]) => {
                    this.componentManager.registerComponent(name, component);
                });
                this.logger.info('Components registered', Object.keys(options.components));
            }
            
            // Initialize component manager
            await this.componentManager.initialize();
            
            this.isInitialized = true;
            this.eventBus.emit('framework:initialized', { app: this });
            this.logger.info('Framework application initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize framework application', error);
            this.errorHandler.handleError(error, 'APP_INIT_ERROR');
            throw error;
        }
    }
    
    /**
     * Start the application
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('Application must be initialized before starting');
        }
        
        try {
            this.logger.info('Starting framework application...');
            
            // Start router if available
            if (this.router) {
                await this.router.start();
            }
            
            this.eventBus.emit('framework:started', { app: this });
            this.logger.info('Framework application started successfully');
            
        } catch (error) {
            this.logger.error('Failed to start framework application', error);
            this.errorHandler.handleError(error, 'APP_START_ERROR');
            throw error;
        }
    }
    
    /**
     * Navigate to a route
     * @param {string} path - Route path
     * @param {Object} options - Navigation options
     */
    navigate(path, options = {}) {
        if (this.router) {
            return this.router.navigate(path, options);
        } else {
            this.logger.warn('Router not initialized, cannot navigate');
        }
    }
    
    /**
     * Get a service or component
     * @param {string} name - Service/component name
     */
    get(name) {
        switch (name) {
            case 'eventBus':
                return this.eventBus;
            case 'router':
                return this.router;
            case 'componentManager':
                return this.componentManager;
            case 'logger':
                return this.logger;
            case 'errorHandler':
                return this.errorHandler;
            default:
                return this.componentManager.getComponent(name);
        }
    }
    
    /**
     * Shutdown the application
     */
    async shutdown() {
        try {
            this.logger.info('Shutting down framework application...');
            
            this.eventBus.emit('framework:shutdown', { app: this });
            
            if (this.router) {
                await this.router.cleanup();
            }
            
            await this.componentManager.cleanup();
            this.eventBus.cleanup();
            
            if (this.frameworkDebug) {
                this.frameworkDebug.disable();
            }
            
            this.isInitialized = false;
            this.logger.info('Framework application shutdown complete');
            
        } catch (error) {
            this.logger.error('Error during application shutdown', error);
            throw error;
        }
    }
}

/**
 * Create a new framework application instance
 * @param {Object} config - Application configuration
 * @returns {FrameworkApp} Framework application instance
 */
export function createApp(config = {}) {
    return new FrameworkApp(config);
}

// Framework metadata
export const FRAMEWORK_VERSION = '1.0.0';
export const FRAMEWORK_NAME = 'VanillaForge';

// Default export
export default {
    FrameworkApp,
    createApp,
    ComponentManager,
    Router,
    EventBus,
    BaseComponent,
    Logger,
    ErrorHandler,
    ErrorType,
    FrameworkDebug,
    SweetAlert,
    Validator,
    FRAMEWORK_VERSION,
    FRAMEWORK_NAME
};
