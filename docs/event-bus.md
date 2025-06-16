# 📡 Event Bus System

Complete guide to VanillaForge's centralized event communication system.

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Event Patterns](#event-patterns)
- [Component Communication](#component-communication)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)

## Overview

The Event Bus is VanillaForge's centralized communication system that enables loose coupling between components. It implements the publish-subscribe (pub/sub) pattern, allowing components to communicate without direct references to each other.

### Key Features

- **Decoupled Communication** - Components don't need direct references
- **Type-Safe Events** - Structured event data with validation
- **Priority Handling** - Control event handler execution order
- **Once Listeners** - Automatic cleanup for one-time events
- **Error Handling** - Graceful error handling for event handlers
- **Performance Optimized** - Efficient event processing

## Basic Usage

### Emitting Events

```javascript
// Simple event
this.eventBus.emit('user-logged-in');

// Event with data
this.eventBus.emit('user-updated', {
    userId: 123,
    name: 'John Doe',
    email: 'john@example.com'
});

// Event with options
this.eventBus.emit('data-loaded', dataSet, {
    async: true,
    priority: 'high'
});
```

### Listening for Events

```javascript
// Basic listener
this.eventBus.on('user-logged-in', () => {
    console.log('User logged in!');
});

// Listener with data
this.eventBus.on('user-updated', (userData) => {
    console.log('User updated:', userData);
    this.updateUserDisplay(userData);
});

// Listener with options
this.eventBus.on('critical-error', (error) => {
    this.handleCriticalError(error);
}, { priority: 10 });
```

### Removing Listeners

```javascript
// Store listener reference
const handleUserUpdate = (userData) => {
    console.log('User updated:', userData);
};

// Add listener
this.eventBus.on('user-updated', handleUserUpdate);

// Remove specific listener
this.eventBus.off('user-updated', handleUserUpdate);

// Remove all listeners for an event
this.eventBus.off('user-updated');
```

### One-Time Listeners

```javascript
// Listen only once
this.eventBus.once('app-initialized', () => {
    console.log('App is ready!');
    this.startPerformanceMonitoring();
});

// Or use options
this.eventBus.on('data-sync-complete', (data) => {
    this.processInitialData(data);
}, { once: true });
```

## Event Patterns

### Component Lifecycle Events

```javascript
// Framework emits these automatically
class MyComponent extends BaseComponent {
    async init() {
        await super.init();
        
        // Listen for lifecycle events
        this.eventBus.on('component:mounted', (componentData) => {
            if (componentData.name === 'related-component') {
                this.setupRelationship(componentData);
            }
        });
    }
    
    getLifecycle() {
        return {
            onMount: () => {
                // Notify other components
                this.eventBus.emit('component:mounted', {
                    name: this.name,
                    id: this.id,
                    element: this.element
                });
            },
            onUnmount: () => {
                this.eventBus.emit('component:unmounted', {
                    name: this.name,
                    id: this.id
                });
            }
        };
    }
}
```

### User Action Events

```javascript
// User interactions
class UserActionsComponent extends BaseComponent {
    handleLogin(credentials) {
        this.eventBus.emit('user:login-attempt', credentials);
        
        // After successful login
        this.eventBus.emit('user:logged-in', {
            userId: response.userId,
            username: response.username,
            role: response.role,
            timestamp: new Date().toISOString()
        });
    }
    
    handleLogout() {
        this.eventBus.emit('user:logout', {
            userId: this.currentUser.id,
            timestamp: new Date().toISOString()
        });
    }
    
    handleProfileUpdate(profileData) {
        this.eventBus.emit('user:profile-updated', {
            userId: this.currentUser.id,
            changes: profileData,
            timestamp: new Date().toISOString()
        });
    }
}
```

### Data Flow Events

```javascript
// Data management events
class DataManagerComponent extends BaseComponent {
    async loadUsers() {
        this.eventBus.emit('data:loading', { type: 'users' });
        
        try {
            const users = await fetchUsers();
            this.eventBus.emit('data:loaded', {
                type: 'users',
                data: users,
                count: users.length
            });
        } catch (error) {
            this.eventBus.emit('data:error', {
                type: 'users',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    async saveUser(userData) {
        this.eventBus.emit('data:saving', { type: 'user', id: userData.id });
        
        try {
            const savedUser = await saveUser(userData);
            this.eventBus.emit('data:saved', {
                type: 'user',
                data: savedUser,
                changes: userData
            });
        } catch (error) {
            this.eventBus.emit('data:save-error', {
                type: 'user',
                id: userData.id,
                error: error.message
            });
        }
    }
}
```

### Application State Events

```javascript
// Global state changes
class AppStateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = {
            theme: 'light',
            language: 'en',
            isOnline: navigator.onLine
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for state change requests
        this.eventBus.on('app:change-theme', (theme) => {
            this.updateTheme(theme);
        });
        
        this.eventBus.on('app:change-language', (language) => {
            this.updateLanguage(language);
        });
        
        // Browser events
        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });
    }
    
    updateTheme(theme) {
        this.state.theme = theme;
        this.eventBus.emit('app:theme-changed', {
            oldTheme: this.state.theme,
            newTheme: theme,
            timestamp: new Date().toISOString()
        });
    }
    
    updateConnectionStatus(isOnline) {
        this.state.isOnline = isOnline;
        this.eventBus.emit('app:connection-changed', {
            isOnline,
            timestamp: new Date().toISOString()
        });
    }
}
```

## Component Communication

### Parent-Child Communication

```javascript
// Parent component
class ParentComponent extends BaseComponent {
    async init() {
        await super.init();
        
        // Listen for child events
        this.eventBus.on('child:data-updated', (data) => {
            this.handleChildDataUpdate(data);
        });
        
        this.eventBus.on('child:action-requested', (action) => {
            this.handleChildAction(action);
        });
    }
    
    sendDataToChild(data) {
        this.eventBus.emit('parent:data-for-child', {
            targetChild: 'child-component-id',
            data: data
        });
    }
    
    handleChildDataUpdate(data) {
        this.setState({ childData: data });
    }
}

// Child component
class ChildComponent extends BaseComponent {
    async init() {
        await super.init();
        
        // Listen for parent events
        this.eventBus.on('parent:data-for-child', (eventData) => {
            if (eventData.targetChild === this.id) {
                this.handleParentData(eventData.data);
            }
        });
    }
    
    handleUserAction(actionData) {
        // Notify parent of action
        this.eventBus.emit('child:action-requested', {
            childId: this.id,
            action: actionData
        });
    }
    
    updateData(newData) {
        this.setState({ data: newData });
        
        // Notify parent of data change
        this.eventBus.emit('child:data-updated', {
            childId: this.id,
            data: newData
        });
    }
}
```

### Sibling Communication

```javascript
// Component A
class ComponentA extends BaseComponent {
    selectItem(item) {
        this.setState({ selectedItem: item });
        
        // Notify siblings
        this.eventBus.emit('item:selected', {
            item: item,
            selectedBy: this.name
        });
    }
}

// Component B
class ComponentB extends BaseComponent {
    async init() {
        await super.init();
        
        // Listen for sibling events
        this.eventBus.on('item:selected', (data) => {
            if (data.selectedBy !== this.name) {
                this.handleItemSelection(data.item);
            }
        });
    }
    
    handleItemSelection(item) {
        this.setState({ 
            relatedItems: this.getRelatedItems(item),
            activeItem: item
        });
    }
}
```

### Service Communication

```javascript
// Service class
class UserService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.eventBus.on('user:login-request', this.handleLogin.bind(this));
        this.eventBus.on('user:logout-request', this.handleLogout.bind(this));
        this.eventBus.on('user:update-request', this.handleUpdate.bind(this));
    }
    
    async handleLogin(credentials) {
        try {
            const user = await this.authenticate(credentials);
            this.eventBus.emit('user:login-success', user);
        } catch (error) {
            this.eventBus.emit('user:login-error', {
                error: error.message,
                credentials: credentials.username
            });
        }
    }
    
    async handleUpdate(userData) {
        try {
            const updatedUser = await this.updateUser(userData);
            this.eventBus.emit('user:update-success', updatedUser);
        } catch (error) {
            this.eventBus.emit('user:update-error', {
                error: error.message,
                userId: userData.id
            });
        }
    }
}
```

## Advanced Features

### Event Namespaces

```javascript
// Organize events with namespaces
class NamespacedEvents {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    
    // User namespace
    emitUserEvent(action, data) {
        this.eventBus.emit(`user:${action}`, data);
    }
    
    onUserEvent(action, handler) {
        this.eventBus.on(`user:${action}`, handler);
    }
    
    // Data namespace
    emitDataEvent(action, data) {
        this.eventBus.emit(`data:${action}`, data);
    }
    
    onDataEvent(action, handler) {
        this.eventBus.on(`data:${action}`, handler);
    }
    
    // UI namespace
    emitUIEvent(action, data) {
        this.eventBus.emit(`ui:${action}`, data);
    }
    
    onUIEvent(action, handler) {
        this.eventBus.on(`ui:${action}`, handler);
    }
}
```

### Event Middleware

```javascript
class EventMiddleware {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.middleware = [];
        this.interceptEmit();
    }
    
    use(middleware) {
        this.middleware.push(middleware);
    }
    
    interceptEmit() {
        const originalEmit = this.eventBus.emit.bind(this.eventBus);
        
        this.eventBus.emit = (event, data, options = {}) => {
            let processedData = data;
            
            // Run middleware
            for (const middleware of this.middleware) {
                const result = middleware(event, processedData, options);
                if (result === false) {
                    return; // Cancel event
                }
                if (result !== undefined) {
                    processedData = result;
                }
            }
            
            return originalEmit(event, processedData, options);
        };
    }
}

// Usage
const middleware = new EventMiddleware(eventBus);

// Logging middleware
middleware.use((event, data, options) => {
    console.log(`Event: ${event}`, data);
    return data;
});

// Validation middleware
middleware.use((event, data, options) => {
    if (event.startsWith('user:') && !data.userId) {
        console.warn(`User event ${event} missing userId`);
        return false; // Cancel event
    }
    return data;
});
```

### Event Batching

```javascript
class EventBatcher {
    constructor(eventBus, options = {}) {
        this.eventBus = eventBus;
        this.batchSize = options.batchSize || 10;
        this.batchDelay = options.batchDelay || 100;
        this.batches = new Map();
    }
    
    batchEmit(event, data) {
        if (!this.batches.has(event)) {
            this.batches.set(event, []);
            
            // Schedule batch processing
            setTimeout(() => {
                this.processBatch(event);
            }, this.batchDelay);
        }
        
        const batch = this.batches.get(event);
        batch.push(data);
        
        // Process immediately if batch is full
        if (batch.length >= this.batchSize) {
            this.processBatch(event);
        }
    }
    
    processBatch(event) {
        const batch = this.batches.get(event);
        if (batch && batch.length > 0) {
            this.eventBus.emit(`${event}:batch`, batch);
            this.batches.delete(event);
        }
    }
}

// Usage
const batcher = new EventBatcher(eventBus);

// Batch multiple rapid events
for (let i = 0; i < 50; i++) {
    batcher.batchEmit('data:item-updated', { id: i, value: Math.random() });
}

// Listen for batched events
eventBus.on('data:item-updated:batch', (items) => {
    console.log(`Processing ${items.length} item updates`);
    this.processBulkUpdate(items);
});
```

### Event Replay

```javascript
class EventReplay {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.history = [];
        this.maxHistory = 1000;
        this.interceptEvents();
    }
    
    interceptEvents() {
        const originalEmit = this.eventBus.emit.bind(this.eventBus);
        
        this.eventBus.emit = (event, data, options = {}) => {
            // Record event
            this.history.push({
                event,
                data,
                options,
                timestamp: Date.now()
            });
            
            // Maintain history size
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
            
            return originalEmit(event, data, options);
        };
    }
    
    replay(filter = {}) {
        const { since, event, limit } = filter;
        
        let events = this.history;
        
        // Filter by timestamp
        if (since) {
            events = events.filter(e => e.timestamp >= since);
        }
        
        // Filter by event name
        if (event) {
            events = events.filter(e => e.event === event);
        }
        
        // Limit results
        if (limit) {
            events = events.slice(-limit);
        }
        
        // Replay events
        events.forEach(eventData => {
            this.eventBus.emit(
                `replay:${eventData.event}`,
                eventData.data,
                eventData.options
            );
        });
        
        return events;
    }
    
    getHistory(filter = {}) {
        return this.history.filter(event => {
            if (filter.since && event.timestamp < filter.since) return false;
            if (filter.event && event.event !== filter.event) return false;
            return true;
        });
    }
}
```

## Best Practices

### Event Naming

1. **Use Namespaces** - Organize events with prefixes
2. **Be Descriptive** - Event names should be clear and specific
3. **Use Consistent Patterns** - Follow consistent naming conventions

```javascript
// Good event naming
'user:logged-in'
'user:profile-updated'
'data:users-loaded'
'data:user-save-error'
'ui:modal-opened'
'ui:theme-changed'

// Avoid generic names
'update'
'change'
'success'
'error'
```

### Event Data Structure

```javascript
// Consistent event data structure
const eventData = {
    // Core data
    id: 'unique-identifier',
    type: 'user-action',
    
    // Payload
    payload: {
        userId: 123,
        action: 'profile-update',
        changes: { name: 'New Name' }
    },
    
    // Metadata
    metadata: {
        timestamp: new Date().toISOString(),
        source: 'user-profile-component',
        version: '1.0.0'
    },
    
    // Context
    context: {
        sessionId: 'session-123',
        userAgent: navigator.userAgent,
        path: window.location.pathname
    }
};
```

### Memory Management

```javascript
class ComponentWithEvents extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.eventHandlers = new Map();
    }
    
    addEventListener(event, handler) {
        // Store reference for cleanup
        this.eventHandlers.set(event, handler);
        this.eventBus.on(event, handler);
    }
    
    async destroy() {
        // Clean up all event listeners
        for (const [event, handler] of this.eventHandlers) {
            this.eventBus.off(event, handler);
        }
        this.eventHandlers.clear();
        
        await super.destroy();
    }
}
```

### Error Handling

```javascript
// Safe event handling
this.eventBus.on('data:loaded', (data) => {
    try {
        this.processData(data);
    } catch (error) {
        this.logger.error('Error processing data', error);
        this.eventBus.emit('error:data-processing', {
            error: error.message,
            data: data,
            component: this.name
        });
    }
});
```

## Performance Optimization

### Debounced Events

```javascript
class DebouncedEvents {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.debounceTimers = new Map();
    }
    
    debouncedEmit(event, data, delay = 300) {
        // Clear existing timer
        if (this.debounceTimers.has(event)) {
            clearTimeout(this.debounceTimers.get(event));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            this.eventBus.emit(event, data);
            this.debounceTimers.delete(event);
        }, delay);
        
        this.debounceTimers.set(event, timer);
    }
}
```

### Event Priorities

```javascript
// High priority events processed first
this.eventBus.on('critical:error', handler, { priority: 10 });
this.eventBus.on('user:action', handler, { priority: 5 });
this.eventBus.on('background:sync', handler, { priority: 1 });
```

### Lazy Event Registration

```javascript
class LazyEventManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.lazyHandlers = new Map();
    }
    
    registerLazy(event, handlerFactory) {
        this.lazyHandlers.set(event, handlerFactory);
        
        // Register actual handler on first emit
        this.eventBus.once(event, () => {
            const handler = handlerFactory();
            this.eventBus.on(event, handler);
        });
    }
}
```

---

The Event Bus system provides powerful, flexible communication capabilities while maintaining performance and simplicity.
