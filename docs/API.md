# 🔧 VanillaForge API Reference

Complete API documentation for VanillaForge framework.

## Table of Contents

- [Framework Core](#framework-core)
- [Components](#components)
- [Routing](#routing)
- [Event System](#event-system)
- [Utilities](#utilities)

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
