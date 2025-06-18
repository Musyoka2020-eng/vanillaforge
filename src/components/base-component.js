/**
 * Base Component Class
 * 
 * This is the foundation class for all UI components in VanillaForge applications.
 * It provides common functionality for component lifecycle, event handling, and state management.
 * 
 * Features:
 * - Lifecycle methods (init, render, destroy)
 * - Event handling and cleanup
 * - State management
 * - Property validation
 * - Error boundary protection
 * 
 * @author VanillaForge Team
 * @version 1.0.0
 * @since 2025-06-15
 */

import { EventBus } from '../core/event-bus.js';
import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

/**
 * Base Component Class
 * 
 * All UI components should extend this class to inherit common functionality
 * and maintain consistency across the application.
 */
export class BaseComponent {
    /**
     * Create a new component instance
     * 
     * @param {EventBus} eventBus - The event bus for communication
     * @param {Object} props - Component properties and configuration
     * @param {string} props.name - Component name for logging and debugging
     * @param {boolean} props.autoRender - Whether to automatically render on initialization
     */
    constructor(eventBus, props = {}) {
        // Validate required parameters
        if (!eventBus) {
            throw new Error('BaseComponent requires an EventBus instance');
        }

        // Core properties
        this.eventBus = eventBus;
        this.container = null; // Will be set during rendering
        this.element = null; // Will be set during rendering
        this.name = props.name || this.constructor.name;
        this.props = props || {};
        this.state = {};

        // Component lifecycle flags
        this.isInitialized = false;
        this.isRendered = false;
        this.isDestroyed = false;

        // Event management
        this.eventListeners = new Map();
        this.eventBusSubscriptions = [];        // Configuration
        this.autoRender = props.autoRender !== false; // Default to true
        this.autoLoadCSSEnabled = props.autoLoadCSS !== false; // Default to true
        // Initialize logger with component context
        this.logger = new Logger(`Component:${this.name}`, 'info');

        // Initialize error handler
        this.errorHandler = new ErrorHandler();

        // Bind methods to maintain context
        this.handleError = this.handleError.bind(this);
        this.cleanup = this.cleanup.bind(this);

        // Setup error boundary
        this.setupErrorBoundary();

        this.logger.info('Component initialized', { name: this.name, props: this.props });
    }

    /**
     * Initialize the component
     * 
     * This method should be called after component construction to set up
     * event listeners, validate props, and perform initial rendering.
     * 
     * @returns {Promise<void>}
     */    async init() {
        if (this.isInitialized) {
            this.logger.warn('Component already initialized');
            return;
        }

        try {
            this.logger.debug('Initializing component');

            // Validate component properties
            await this.validateProps();            // Auto-load CSS files if enabled
            if (this.autoLoadCSSEnabled !== false) {
                await this.autoLoadCSS();
            }

            // Setup component-specific initialization
            await this.onInit();

            // Setup event listeners
            this.setupEventListeners();

            // Auto-render if enabled
            if (this.autoRender) {
                await this.render();
            }
            this.isInitialized = true;
            this.logger.info('Component initialized successfully', { name: this.name, props: this.props });

            // Emit initialization complete event
            this.emit('component:initialized', { component: this.name });

        } catch (error) {
            this.handleError(error, 'Component initialization failed');
            throw error;
        }
    }/**
     * Render the component
     * 
     * This method generates and inserts the component's HTML into the container.
     * It handles the complete rendering lifecycle including cleanup of existing content.
     * 
     * @returns {Promise<void>}
     */
    async render() {
        if (this.isDestroyed) {
            throw new Error('Cannot render destroyed component');
        }

        const renderStartTime = performance.now();

        try {
            this.logger.debug('Rendering component');

            // Clear existing content
            if (this.isRendered) {
                this.cleanup();
            }
            // Generate component HTML
            let html;
            if (typeof this.getHTML === 'function') {
                html = await this.getHTML();
            } else if (typeof this.getTemplate === 'function') {
                html = this.getTemplate();
            } else {
                throw new Error('Component must implement getHTML() or getTemplate() method');
            }

            // Insert HTML into container
            this.container.innerHTML = html;

            // Post-render setup
            await this.onRender();

            // Setup event delegation for rendered elements
            this.setupEventDelegation();

            this.isRendered = true;

            const renderTime = performance.now() - renderStartTime;
            this.logger.debug('Component rendered successfully', { renderTime: `${renderTime.toFixed(2)}ms` });

            // Emit render complete event with performance data
            this.emit('component:rendered', {
                component: this.name,
                renderTime
            });

        } catch (error) {
            this.handleError(error, 'Component rendering failed');
            throw error;
        }
    }

    /**
     * Update component properties and re-render if necessary
     * 
     * @param {Object} newProps - New properties to merge with existing props
     * @param {boolean} forceRender - Force re-render even if props haven't changed
     * @returns {Promise<void>}
     */
    async updateProps(newProps = {}, forceRender = false) {
        try {
            const oldProps = { ...this.props };
            this.props = { ...this.props, ...newProps };

            // Check if props actually changed
            const propsChanged = JSON.stringify(oldProps) !== JSON.stringify(this.props);

            if (propsChanged || forceRender) {
                this.logger.debug('Props updated, re-rendering', { oldProps, newProps });

                // Validate new props
                await this.validateProps();

                // Re-render component
                await this.render();

                // Emit props updated event
                this.emit('component:propsUpdated', {
                    component: this.name,
                    oldProps,
                    newProps: this.props
                });
            }

        } catch (error) {
            this.handleError(error, 'Props update failed');
            throw error;
        }
    }    /**
     * Update component state and trigger re-render if needed
     * 
     * @param {Object} newState - New state to merge with existing state
     * @param {boolean} autoRender - Whether to automatically re-render after state update
     * @returns {Promise<void>}
     */
    async setState(newState = {}, autoRender = true) {
        try {
            // Prevent concurrent state updates
            if (this._updatingState) {
                this.logger.warn('State update already in progress, queuing update');
                // Queue the state update
                if (!this._stateUpdateQueue) {
                    this._stateUpdateQueue = [];
                }
                this._stateUpdateQueue.push({ newState, autoRender });
                return;
            }

            this._updatingState = true;

            try {
                const oldState = { ...this.state };
                this.state = { ...this.state, ...newState };

                this.logger.debug('State updated', { oldState, newState: this.state });

                if (autoRender && this.isRendered && !this.isDestroyed) {
                    await this.render();
                }

                // Emit state updated event
                this.emit('component:stateUpdated', {
                    component: this.name,
                    oldState,
                    newState: this.state
                });

            } finally {
                this._updatingState = false;

                // Process queued state updates
                if (this._stateUpdateQueue && this._stateUpdateQueue.length > 0) {
                    const queuedUpdate = this._stateUpdateQueue.shift();
                    // Process next update asynchronously to avoid blocking
                    setTimeout(() => {
                        this.setState(queuedUpdate.newState, queuedUpdate.autoRender);
                    }, 0);
                }
            }

        } catch (error) {
            this._updatingState = false;
            this.handleError(error, 'State update failed');
            throw error;
        }
    }

    /**
     * Destroy the component and clean up resources
     * 
     * This method should be called when the component is no longer needed
     * to prevent memory leaks and clean up event listeners.
     */
    destroy() {
        if (this.isDestroyed) {
            this.logger.warn('Component already destroyed');
            return;
        }

        try {
            this.logger.debug('Destroying component');

            // Component-specific cleanup
            this.onDestroy();

            // Clean up event listeners and subscriptions
            this.cleanup();

            // Clear container
            if (this.container) {
                this.container.innerHTML = '';
            }

            // Mark as destroyed
            this.isDestroyed = true;
            this.isRendered = false;
            this.isInitialized = false;

            this.logger.info('Component destroyed successfully');

            // Emit destruction event
            this.emit('component:destroyed', { component: this.name });

        } catch (error) {
            this.handleError(error, 'Component destruction failed');
        }
    }    /**
     * Add event listener to an element with automatic cleanup
     * 
     * @param {HTMLElement|string} target - Element or selector to attach event to
     * @param {string} event - Event type (e.g., 'click', 'change')
     * @param {Function} handler - Event handler function
     * @param {Object} options - Event listener options
     */
    addEventListener(target, event, handler, options = {}) {
        try {
            let element = target;

            // If target is a string, find element within component container
            if (typeof target === 'string') {
                element = this.container.querySelector(target);
                if (!element) {
                    this.logger.warn('Element not found for event listener', { selector: target });
                    return;
                }
            }

            // Validate element
            if (!element || !(element instanceof HTMLElement)) {
                throw new Error('Invalid element for event listener');
            }

            // Create wrapped handler for error handling
            const wrappedHandler = (e) => {
                try {
                    handler.call(this, e);
                } catch (error) {
                    this.handleError(error, `Event handler failed for ${event}`);
                }
            };

            // Add event listener
            element.addEventListener(event, wrappedHandler, options);

            // Store for cleanup with a more unique key
            const key = `${element.tagName}-${event}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            this.eventListeners.set(key, {
                element,
                event,
                handler: wrappedHandler,
                options
            });

            this.logger.debug('Event listener added', { target: typeof target === 'string' ? target : target.tagName, event });

            return key; // Return key for manual removal if needed

        } catch (error) {
            this.handleError(error, 'Failed to add event listener');
            return null;
        }
    }

    /**
     * Subscribe to EventBus events with automatic cleanup
     * 
     * @param {string} eventName - Event name to subscribe to
     * @param {Function} handler - Event handler function
     */    subscribe(eventName, handler) {
        try {
            // Create wrapped handler for error handling
            const wrappedHandler = (data) => {
                try {
                    handler.call(this, data);
                } catch (error) {
                    this.handleError(error, `EventBus handler failed for ${eventName}`);
                }
            };

            // Subscribe to event using the eventBus instance and get unsubscribe function
            const unsubscribe = this.eventBus.on(eventName, wrappedHandler);

            // Store for cleanup
            this.eventBusSubscriptions.push({
                eventName,
                unsubscribe
            });

            this.logger.debug('EventBus subscription added', { eventName });

        } catch (error) {
            this.handleError(error, 'Failed to subscribe to EventBus event');
        }
    }

    /**
     * Emit an event through the EventBus
     * 
     * @param {string} eventName - Event name to emit
     * @param {*} data - Event data
     */    emit(eventName, data) {
        try {
            this.eventBus.emit(eventName, data);
            this.logger.debug('Event emitted', { eventName, data });
        } catch (error) {
            this.handleError(error, 'Failed to emit event');
        }
    }

    /**
     * Find elements within the component container
     * 
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null} First matching element
     */
    querySelector(selector) {
        return this.container.querySelector(selector);
    }

    /**
     * Find all elements within the component container
     * 
     * @param {string} selector - CSS selector
     * @returns {NodeList} All matching elements
     */
    querySelectorAll(selector) {
        return this.container.querySelectorAll(selector);
    }

    /**
     * Load CSS file dynamically
     * 
     * @param {string} cssPath - Path to the CSS file
     * @returns {Promise<void>}
     */
    async loadCSS(cssPath) {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            const existingLink = document.querySelector(`link[href="${cssPath}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            // Create link element
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssPath;

            // Handle load/error events
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${cssPath}`));

            // Add to document head
            document.head.appendChild(link);
        });
    }    /**
     * Unload CSS file
     * 
     * @param {string} cssPath - Path to the CSS file
     */
    unloadCSS(cssPath) {
        const link = document.querySelector(`link[href="${cssPath}"]`);
        if (link) {
            link.remove();
        }
    }    /**
     * Auto-load CSS for component based on naming convention
     * Looks for CSS files in: styles/components/{component-name}.css
     * 
     * @private
     * @returns {Promise<void>}
     */
    async autoLoadCSS() {
        if (!this.name || typeof window === 'undefined') return;
        
        // Generate CSS filename from component name
        const cssFileName = this.name.toLowerCase()
            .replace(/component$/, '') // Remove 'component' suffix if present
            .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        // Add 'component' suffix back for CSS file naming convention
        const fullCssName = cssFileName ? `${cssFileName}-component` : this.name.toLowerCase();
        
        const cssPaths = [
            `styles/components/${fullCssName}.css`,     // For built version (primary)
            `src/styles/components/${fullCssName}.css`, // For development
            `styles/components/${this.name.toLowerCase()}.css`, // Fallback with exact name
            `src/styles/components/${this.name.toLowerCase()}.css` // Fallback development
        ];
        
        for (const cssPath of cssPaths) {
            try {
                await this.loadCSS(cssPath);
                this.logger.debug(`Auto-loaded CSS: ${cssPath}`);
                break; // Stop after first successful load
            } catch (error) {
                // Continue to next path - this is expected behavior
                continue;
            }
        }
    }

    // ===========================
    // Lifecycle Hooks (Override in subclasses)
    // ===========================

    /**
     * Component-specific initialization
     * Override in subclasses for custom initialization logic
     * 
     * @returns {Promise<void>}
     */
    async onInit() {
        // Override in subclasses
    }

    /**
     * Component-specific post-render setup
     * Override in subclasses for post-render logic
     * 
     * @returns {Promise<void>}
     */
    async onRender() {
        // Override in subclasses
    }

    /**
     * Component-specific cleanup
     * Override in subclasses for custom cleanup logic
     */
    onDestroy() {
        // Override in subclasses
    }    /**
     * Generate component HTML
     * MUST be implemented in subclasses
     * 
     * @returns {Promise<string>} Component HTML string
     */
    async getHTML() {
        // Check if component has getTemplate method (new architecture)
        if (typeof this.getTemplate === 'function') {
            return this.getTemplate();
        }
        throw new Error('getHTML() or getTemplate() must be implemented in component subclass');
    }

    /**
     * Validate component properties
     * Override in subclasses for custom validation
     * 
     * @returns {Promise<void>}
     */
    async validateProps() {
        // Override in subclasses for prop validation
    }

    // ===========================
    // Private Methods
    // ===========================

    /**
     * Setup error boundary for the component
     * @private
     */
    setupErrorBoundary() {
        // Catch unhandled errors in component container
        if (this.container) {
            window.addEventListener('error', (event) => {
                if (this.container.contains(event.target)) {
                    this.handleError(event.error, 'Unhandled error in component');
                }
            });
        }
    }

    /**
     * Setup component-specific event listeners
     * @private
     */
    setupEventListeners() {
        // Override in subclasses
    }    /**
     * Setup event delegation for rendered elements
     * Automatically binds data-action attributes to component methods
     * @private
     */
    setupEventDelegation() {
        if (!this.element) return;

        // Get component methods
        const methods = this.getMethods ? this.getMethods() : {};

        // Set up click event delegation for data-action attributes
        const clickHandler = (event) => {
            const target = event.target.closest('[data-action]');
            if (!target) return;

            const action = target.getAttribute('data-action');
            if (action && typeof methods[action] === 'function') {
                event.preventDefault();
                try {
                    methods[action](event, target);
                    this.logger.debug(`Action executed: ${action}`);
                } catch (error) {
                    this.handleError(error, `Failed to execute action: ${action}`);
                }
            }
        };

        this.element.addEventListener('click', clickHandler);

        // Store for cleanup
        this.addEventListener(this.element, 'click', clickHandler);

        // Set up form submission delegation
        const submitHandler = (event) => {
            const form = event.target.closest('form[data-submit], form[data-action]');
            if (!form) return;

            const action = form.getAttribute('data-submit') || form.getAttribute('data-action');
            if (action && typeof methods[action] === 'function') {
                event.preventDefault();
                try {
                    methods[action](event, form);
                    this.logger.debug(`Form action executed: ${action}`);
                } catch (error) {
                    this.handleError(error, `Failed to execute form action: ${action}`);
                }
            }
        };

        this.element.addEventListener('submit', submitHandler);

        // Store for cleanup
        this.addEventListener(this.element, 'submit', submitHandler);

        this.logger.debug('Event delegation set up successfully');
    }

    /**
     * Handle component errors
     * @private
     */
    handleError(error, context = 'Component error') {
        this.logger.error(context, error);
        this.errorHandler.handleError(error, {
            component: this.name,
            context,
            state: this.state,
            props: this.props
        });
    }

    /**
     * Clean up event listeners and subscriptions
     * @private
     */
    cleanup() {
        // Clean up DOM event listeners
        for (const [key, listener] of this.eventListeners) {
            try {
                listener.element.removeEventListener(
                    listener.event,
                    listener.handler,
                    listener.options
                );
            } catch (error) {
                this.logger.warn('Failed to remove event listener', { key, error });
            }
        }
        this.eventListeners.clear();        // Clean up EventBus subscriptions
        for (const subscription of this.eventBusSubscriptions) {
            try {
                subscription.unsubscribe();
            } catch (error) {
                this.logger.warn('Failed to unsubscribe from event', {
                    eventName: subscription.eventName,
                    error
                });
            }
        }
        this.eventBusSubscriptions = [];
    }}
