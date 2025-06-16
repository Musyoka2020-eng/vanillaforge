# 🔧 VanillaForge API Reference

Complete API documentation for VanillaForge framework.

## Table of Contents

- [Framework Core](#framework-core)
- [Components](#components)
- [Routing](#routing)
- [Event System](#event-system)
- [Utilities](#utilities)
  - [Logger](#logger)
  - [ErrorHandler](#errorhandler)
  - [ValidationUtils](#validationutils)
  - [PerformanceUtils](#performanceutils)
  - [SweetAlert](#sweetalert)
  - [ComponentManager](#componentmanager)
  - [FrameworkDebug](#frameworkdebug)
- [Framework Constants](#framework-constants)
- [Event Types](#event-types)
- [Error Types](#error-types)

## Framework Core

### createApp(config)

Creates a new VanillaForge application instance.

**Parameters:**
- `config` (Object) - Application configuration

**Returns:** `FrameworkApp` instance

**Example:**
```javascript
const app = createApp({
    appName: 'My App',
    debug: true,
    router: {
        mode: 'history',
        fallback: '/404'
    }
});
```

### FrameworkApp

Main application class that orchestrates all framework components.

#### Properties

- `config` (Object) - Application configuration
- `eventBus` (EventBus) - Central event bus
- `router` (Router) - Application router
- `componentManager` (ComponentManager) - Component manager
- `logger` (Logger) - Application logger
- `isInitialized` (Boolean) - Initialization status

#### Methods

##### async initialize(options)

Initialize the application with routes and components.

**Parameters:**
- `options.routes` (Object) - Route path to component mapping
- `options.components` (Object) - Component name to class mapping

**Example:**
```javascript
await app.initialize({
    routes: {
        '/': HomeComponent,
        '/about': AboutComponent,
        '/users/:id': UserComponent
    },
    components: {
        'home': HomeComponent,
        'about': AboutComponent
    }
});
```

##### async start()

Start the application after initialization.

**Example:**
```javascript
await app.start();
```

##### navigate(path, options)

Navigate to a specific route.

**Parameters:**
- `path` (String) - Target route path
- `options` (Object) - Navigation options
  - `replace` (Boolean) - Replace current history entry

**Example:**
```javascript
app.navigate('/users/123', { replace: true });
```

##### get(serviceName)

Get a framework service by name.

**Parameters:**
- `serviceName` (String) - Service name ('eventBus', 'router', 'componentManager', etc.)

**Returns:** Service instance

**Example:**
```javascript
const router = app.get('router');
const eventBus = app.get('eventBus');
```

##### async shutdown()

Shutdown the application and cleanup resources.

**Example:**
```javascript
await app.shutdown();
```

## Components

### BaseComponent

Base class that all components should extend.

#### Constructor

```javascript
constructor(eventBus, props = {})
```

**Parameters:**
- `eventBus` (EventBus) - Framework event bus
- `props` (Object) - Component properties

#### Properties

- `name` (String) - Component name
- `state` (Object) - Component state
- `props` (Object) - Component properties
- `element` (HTMLElement) - Component DOM element
- `container` (HTMLElement) - Component container element
- `eventBus` (EventBus) - Event bus reference
- `logger` (Logger) - Component logger

#### Required Methods

##### getTemplate()

Returns the HTML template for the component.

**Returns:** String (HTML)

**Example:**
```javascript
getTemplate() {
    return `
        <div class="my-component">
            <h1>${this.state.title}</h1>
            <p>${this.state.description}</p>
        </div>
    `;
}
```

#### Optional Methods

##### setState(newState, autoRender = true)

Update component state and optionally re-render.

**Parameters:**
- `newState` (Object) - New state properties
- `autoRender` (Boolean) - Whether to automatically re-render

**Example:**
```javascript
this.setState({ 
    count: this.state.count + 1,
    lastUpdated: new Date()
});
```

##### getLifecycle()

Return lifecycle hook functions.

**Returns:** Object with lifecycle methods

**Example:**
```javascript
getLifecycle() {
    return {
        onMount: async () => {
            // Component mounted to DOM
            console.log('Component mounted');
        },
        onUnmount: () => {
            // Component removed from DOM
            console.log('Component unmounted');
        }
    };
}
```

##### async init()

Initialize the component. Called before rendering.

**Example:**
```javascript
async init() {
    await super.init();
    // Custom initialization logic
    this.logger.info('Component initialized');
}
```

##### async render()

Render the component. Usually called automatically.

**Example:**
```javascript
async render() {
    if (this.element) {
        this.element.innerHTML = this.getTemplate();
    }
}
```

##### async destroy()

Destroy the component and cleanup resources.

**Example:**
```javascript
async destroy() {
    // Custom cleanup
    this.removeEventListeners();
    await super.destroy();
}
```

## Routing

### Router

Handles client-side navigation and routing.

#### Methods

##### addRoute(path, component)

Add a route to the router.

**Parameters:**
- `path` (String) - Route path pattern
- `component` (Function|String) - Component class or name

**Example:**
```javascript
router.addRoute('/users/:id', UserComponent);
router.addRoute('/about', 'about-component');
```

##### async navigate(path, options)

Navigate to a specific path.

**Parameters:**
- `path` (String) - Target path
- `options` (Object) - Navigation options
  - `replace` (Boolean) - Replace history entry
  - `fromPopState` (Boolean) - Internal use

**Returns:** Boolean (success)

**Example:**
```javascript
const success = await router.navigate('/users/123');
```

##### findRoute(path)

Find a route that matches the given path.

**Parameters:**
- `path` (String) - Path to match

**Returns:** Route object or null

**Example:**
```javascript
const route = router.findRoute('/users/123');
// Returns: { path: '/users/:id', component: UserComponent, ... }
```

##### beforeNavigation(callback)

Add a callback to run before navigation.

**Parameters:**
- `callback` (Function) - Callback function (route, path) => boolean

**Example:**
```javascript
router.beforeNavigation(async (route, path) => {
    if (route.protected && !user.isAuthenticated()) {
        router.navigate('/login');
        return false; // Cancel navigation
    }
    return true; // Allow navigation
});
```

##### afterNavigation(callback)

Add a callback to run after navigation.

**Parameters:**
- `callback` (Function) - Callback function (route, path) => void

**Example:**
```javascript
router.afterNavigation((route, path) => {
    // Analytics tracking
    analytics.trackPageView(path);
});
```

## Event System

### EventBus

Centralized event system for component communication.

#### Methods

##### on(event, handler, options)

Listen for an event.

**Parameters:**
- `event` (String) - Event name
- `handler` (Function) - Event handler
- `options` (Object) - Options
  - `once` (Boolean) - Listen only once

**Example:**
```javascript
eventBus.on('user-updated', (userData) => {
    console.log('User updated:', userData);
});
```

##### off(event, handler)

Remove an event listener.

**Parameters:**
- `event` (String) - Event name
- `handler` (Function) - Handler to remove

**Example:**
```javascript
const handler = (data) => console.log(data);
eventBus.on('test', handler);
eventBus.off('test', handler);
```

##### emit(event, data)

Emit an event with data.

**Parameters:**
- `event` (String) - Event name
- `data` (Any) - Event data

**Example:**
```javascript
eventBus.emit('user-updated', {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com'
});
```

##### once(event, handler)

Listen for an event only once.

**Parameters:**
- `event` (String) - Event name
- `handler` (Function) - Event handler

**Example:**
```javascript
eventBus.once('app-ready', () => {
    console.log('App is ready!');
});
```

##### cleanup()

Remove all event listeners.

**Example:**
```javascript
eventBus.cleanup();
```

## Utilities

### Logger

Configurable logging system.

#### Constructor

```javascript
new Logger(context, options)
```

**Parameters:**
- `context` (String) - Logger context/name
- `options` (Object) - Logger options
  - `level` (String) - Log level ('debug', 'info', 'warn', 'error')
  - `console` (Boolean) - Log to console

#### Methods

##### debug(message, data)

Log debug message.

**Parameters:**
- `message` (String) - Log message
- `data` (Any) - Additional data

**Example:**
```javascript
logger.debug('Processing user data', { userId: 123 });
```

##### info(message, data)

Log info message.

**Example:**
```javascript
logger.info('User logged in', { userId: 123 });
```

##### warn(message, data)

Log warning message.

**Example:**
```javascript
logger.warn('Deprecated method used', { method: 'oldMethod' });
```

##### error(message, data)

Log error message.

**Example:**
```javascript
logger.error('Failed to save user', { error: err.message });
```

### ErrorHandler

Centralized error handling system.

#### Methods

##### handleError(error, type, context)

Handle an error.

**Parameters:**
- `error` (Error) - Error object
- `type` (String) - Error type
- `context` (Object) - Additional context

**Example:**
```javascript
try {
    // Some operation
} catch (error) {
    errorHandler.handleError(error, 'COMPONENT_ERROR', {
        component: 'UserList',
        action: 'fetchUsers'
    });
}
```

##### setErrorBoundary(handler)

Set a global error boundary.

**Parameters:**
- `handler` (Function) - Error boundary handler

**Example:**
```javascript
errorHandler.setErrorBoundary((error, context) => {
    // Global error handling
    console.error('Global error:', error);
    // Show user-friendly error message
    showErrorNotification('Something went wrong');
});
```

### ValidationUtils

Input validation utilities.

#### Static Methods

##### validateEmail(email)

Validate email address.

**Parameters:**
- `email` (String) - Email to validate

**Returns:** Object with validation result

**Example:**
```javascript
const result = ValidationUtils.validateEmail('user@example.com');
// Returns: { isValid: true, errors: [], sanitized: 'user@example.com' }
```

##### validateRequired(value, fieldName)

Validate required field.

**Parameters:**
- `value` (Any) - Value to validate
- `fieldName` (String) - Field name for error messages

**Returns:** Object with validation result

**Example:**
```javascript
const result = ValidationUtils.validateRequired(userInput, 'username');
```

### PerformanceUtils

Performance optimization utilities for better application performance.

#### Methods

##### debounce(func, wait, immediate)

Debounce function execution to limit how often it can be called.

**Parameters:**
- `func` (Function) - Function to debounce
- `wait` (Number) - Delay in milliseconds
- `immediate` (Boolean) - Execute immediately on first call

**Returns:** Function (debounced function)

**Example:**
```javascript
const performanceUtils = app.get('performanceUtils');
const debouncedSearch = performanceUtils.debounce((query) => {
    searchAPI(query);
}, 300);
```

##### throttle(func, limit)

Throttle function execution to ensure minimum time between calls.

**Parameters:**
- `func` (Function) - Function to throttle
- `limit` (Number) - Minimum time between executions in milliseconds

**Returns:** Function (throttled function)

**Example:**
```javascript
const throttledResize = performanceUtils.throttle(() => {
    handleWindowResize();
}, 100);
```

### PerformanceUtils

Performance optimization utilities for better application performance.

#### Methods

##### debounce(func, wait, immediate)

Debounce function execution to limit how often it can be called.

**Parameters:**
- `func` (Function) - Function to debounce
- `wait` (Number) - Delay in milliseconds
- `immediate` (Boolean) - Execute immediately on first call

**Returns:** Function (debounced function)

**Example:**
```javascript
const performanceUtils = app.get('performanceUtils');
const debouncedSearch = performanceUtils.debounce((query) => {
    searchAPI(query);
}, 300);
```

##### throttle(func, limit)

Throttle function execution to ensure minimum time between calls.

**Parameters:**
- `func` (Function) - Function to throttle
- `limit` (Number) - Minimum time between executions in milliseconds

**Returns:** Function (throttled function)

**Example:**
```javascript
const throttledResize = performanceUtils.throttle(() => {
    handleWindowResize();
}, 100);
```

##### setCache(key, data, ttl)

Cache data with optional time-to-live.

**Parameters:**
- `key` (String) - Cache key
- `data` (Any) - Data to cache
- `ttl` (Number) - Time to live in milliseconds (default: 5 minutes)

**Example:**
```javascript
performanceUtils.setCache('user-data', userData, 60000); // Cache for 1 minute
```

##### getCache(key)

Get cached data by key.

**Parameters:**
- `key` (String) - Cache key

**Returns:** Cached data or null if expired/not found

**Example:**
```javascript
const userData = performanceUtils.getCache('user-data');
if (userData) {
    displayUser(userData);
} else {
    fetchUserFromAPI();
}
```

##### clearExpiredCache()

Clear all expired cache entries.

**Example:**
```javascript
performanceUtils.clearExpiredCache();
```

##### measure(func, label)

Measure function execution time.

**Parameters:**
- `func` (Function) - Function to measure
- `label` (String) - Label for the measurement

**Returns:** Function result (supports async functions)

**Example:**
```javascript
const result = performanceUtils.measure(() => {
    return expensiveCalculation();
}, 'Expensive Calculation');
```

##### batchDOMOperations(operations)

Batch DOM operations to avoid layout thrashing.

**Parameters:**
- `operations` (Function[]) - Array of DOM operations

**Example:**
```javascript
performanceUtils.batchDOMOperations([
    () => element1.style.height = '100px',
    () => element2.style.width = '200px',
    () => element3.classList.add('visible')
]);
```

##### async preloadResources(urls, type)

Preload resources for better performance.

**Parameters:**
- `urls` (String[]) - Array of resource URLs
- `type` (String) - Resource type ('image', 'script', 'style')

**Returns:** Promise that resolves when all resources are loaded

**Example:**
```javascript
await performanceUtils.preloadResources([
    '/images/hero.jpg',
    '/images/background.png'
], 'image');
```

##### optimizeImage(img, sizes)

Optimize images for different screen sizes.

**Parameters:**
- `img` (HTMLImageElement) - Image element to optimize
- `sizes` (Object) - Size configuration for responsive images

**Returns:** HTMLPictureElement with responsive sources

##### monitorMemory(callback, interval)

Monitor memory usage (Chrome only).

**Parameters:**
- `callback` (Function) - Callback to receive memory stats
- `interval` (Number) - Monitoring interval in milliseconds

**Returns:** Interval ID or null if not supported

**Example:**
```javascript
const monitorId = performanceUtils.monitorMemory((memory) => {
    console.log(`Memory used: ${memory.used}MB/${memory.total}MB`);
}, 5000);
```

##### mark(name)

Create a performance mark.

**Parameters:**
- `name` (String) - Mark name

##### measureBetween(name, startMark, endMark)

Measure performance between two marks.

**Parameters:**
- `name` (String) - Measure name
- `startMark` (String) - Start mark name
- `endMark` (String) - End mark name

##### getPerformanceEntries(type)

Get performance entries by type.

**Parameters:**
- `type` (String) - Entry type (mark, measure, navigation, etc.)

**Returns:** Array of performance entries

##### cleanup()

Cleanup observers and cached resources.

#### Decorators

##### @perf(label)

Performance measurement decorator for methods.

**Parameters:**
- `label` (String) - Optional performance label

**Example:**
```javascript
class MyComponent {
    @perf('Heavy calculation')
    heavyMethod() {
        // Method execution time will be logged
    }
}
```

##### @cache(ttl)

Caching decorator for methods.

**Parameters:**
- `ttl` (Number) - Time to live in milliseconds

**Example:**
```javascript
class DataService {
    @cache(60000) // Cache for 1 minute
    async fetchData(id) {
        // Results will be cached
        return await api.get(`/data/${id}`);
    }
}
```

### SweetAlert

Beautiful, responsive alert dialogs with consistent styling.

#### Static Methods

##### static async fire(options)

Display a custom alert dialog.

**Parameters:**
- `options` (Object) - SweetAlert2 options

**Returns:** Promise that resolves to result object

**Example:**
```javascript
const result = await SweetAlert.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true
});
```

##### static async success(title, text, options)

Display a success alert.

**Parameters:**
- `title` (String) - Alert title
- `text` (String) - Alert text
- `options` (Object) - Additional options

**Example:**
```javascript
await SweetAlert.success('Success!', 'Your data has been saved');
```

##### static async error(title, text, options)

Display an error alert.

**Example:**
```javascript
await SweetAlert.error('Error!', 'Something went wrong');
```

##### static async warning(title, text, options)

Display a warning alert.

##### static async info(title, text, options)

Display an info alert.

##### static async confirm(title, text, options)

Display a confirmation dialog.

**Returns:** Promise that resolves to boolean

**Example:**
```javascript
const confirmed = await SweetAlert.confirm(
    'Delete Item',
    'Are you sure you want to delete this item?'
);
if (confirmed) {
    deleteItem();
}
```

### ComponentManager

Manages component registration, loading, and lifecycle.

#### Methods

##### registerComponent(name, ComponentClass)

Register a component class with a name.

**Parameters:**
- `name` (String) - Component name
- `ComponentClass` (Class) - Component class that extends BaseComponent

**Example:**
```javascript
const componentManager = app.get('componentManager');
componentManager.registerComponent('user-profile', UserProfileComponent);
```

##### async loadComponent(componentName, props, containerId)

Load and render a component in a container.

**Parameters:**
- `componentName` (String) - Name of registered component
- `props` (Object) - Props to pass to component
- `containerId` (String) - ID of container element (default: 'main-content')

**Returns:** Promise that resolves to component instance

**Example:**
```javascript
const component = await componentManager.loadComponent(
    'user-profile', 
    { userId: 123 }, 
    'sidebar'
);
```

### ComponentManager

Manages component registration, loading, and lifecycle.

#### Methods

##### registerComponent(name, ComponentClass)

Register a component class with a name.

**Parameters:**
- `name` (String) - Component name
- `ComponentClass` (Class) - Component class that extends BaseComponent

**Example:**
```javascript
const componentManager = app.get('componentManager');
componentManager.registerComponent('user-profile', UserProfileComponent);
```

##### async loadComponent(componentName, props, containerId)

Load and render a component by name in a container.

**Parameters:**
- `componentName` (String) - Name of registered component
- `props` (Object) - Props to pass to component
- `containerId` (String) - ID of container element (default: 'main-content')

**Returns:** Promise that resolves to component instance

**Example:**
```javascript
const component = await componentManager.loadComponent(
    'user-profile', 
    { userId: 123 }, 
    'sidebar'
);
```

##### async loadComponentClass(ComponentClass, props, containerId)

Load and render a component class directly in a container.

**Parameters:**
- `ComponentClass` (Class) - Component class to load
- `props` (Object) - Props to pass to component
- `containerId` (String) - ID of container element (default: 'main-content')

**Returns:** Promise that resolves to component instance

**Example:**
```javascript
const component = await componentManager.loadComponentClass(
    UserProfileComponent, 
    { userId: 123 }, 
    'main-content'
);
```

##### getComponent(name)

Get a registered component class by name.

**Parameters:**
- `name` (String) - Component name

**Returns:** Component class or undefined

**Example:**
```javascript
const UserComponent = componentManager.getComponent('user-profile');
```

##### getActiveComponent(containerId)

Get the currently active component in a container.

**Parameters:**
- `containerId` (String) - Container ID

**Returns:** Component instance or undefined

**Example:**
```javascript
const activeComponent = componentManager.getActiveComponent('main-content');
```

##### getActiveComponents()

Get all active components.

**Returns:** Map of active components (ID → instance)

**Example:**
```javascript
const activeComponents = componentManager.getActiveComponents();
activeComponents.forEach((component, id) => {
    console.log(`Component ${id}: ${component.name}`);
});
```

##### getRegisteredComponents()

Get list of all registered component names.

**Returns:** Array of component names

**Example:**
```javascript
const componentNames = componentManager.getRegisteredComponents();
console.log('Available components:', componentNames);
```

##### async unloadComponent(componentId)

Unload a specific component instance.

**Parameters:**
- `componentId` (String) - Component instance ID

**Returns:** Promise that resolves to boolean (success status)

**Example:**
```javascript
await componentManager.unloadComponent('user-profile-123');
```

##### async cleanup()

Clean up all components and reset the manager.

**Example:**
```javascript
await componentManager.cleanup();
```

### FrameworkDebug

Development debugging utilities (only available in debug mode).

#### Methods

##### enable()

Enable debug mode.

##### disable()

Disable debug mode.

##### getComponentInfo()

Get information about active components.

**Returns:** Array of component info objects

##### getRouterInfo()

Get router information.

**Returns:** Object with router state

##### getEventBusInfo()

Get event bus information.

**Returns:** Object with event listeners and stats

**Example (available in browser console when debug mode is enabled):**
```javascript
// Check active components
window.VanillaForgeDebug.getComponentInfo();

// Check router state
window.VanillaForgeDebug.getRouterInfo();

// Check event bus
window.VanillaForgeDebug.getEventBusInfo();
```

## Framework Constants

### FRAMEWORK_VERSION

Current version of the VanillaForge framework.

**Type:** String

**Example:**
```javascript
import { FRAMEWORK_VERSION } from './src/framework.js';
console.log(`Running VanillaForge v${FRAMEWORK_VERSION}`);
```

### FRAMEWORK_NAME

Name of the framework.

**Type:** String

**Example:**
```javascript
import { FRAMEWORK_NAME } from './src/framework.js';
console.log(`Framework: ${FRAMEWORK_NAME}`);
```

## Event Types

### Framework Events

- `framework:initialized` - Framework initialization complete
- `framework:started` - Framework started
- `framework:shutdown` - Framework shutdown

### Router Events

- `router:navigated` - Navigation completed
- `router:before-navigation` - Before navigation starts
- `router:after-navigation` - After navigation completes

### Component Events

- `component:loaded` - Component loaded
- `component:unloaded` - Component unloaded
- `component:error` - Component error occurred

## Error Types

- `SYSTEM` - System-level errors
- `COMPONENT` - Component-related errors  
- `NAVIGATION` - Navigation errors
- `VALIDATION` - Validation errors
- `NETWORK` - Network-related errors

---

This API reference covers all public methods and properties available in VanillaForge. For examples and best practices, see the main documentation.
