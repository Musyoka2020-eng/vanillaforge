# 📚 VanillaForge Documentation

**A modern, lightweight framework for forging Single Page Applications with vanilla JavaScript**

## 📖 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

VanillaForge is a lightweight, zero-dependency JavaScript framework that provides all the tools needed to build sophisticated Single Page Applications (SPAs) without the complexity of larger frameworks.

### ✨ Key Features

- 🏗️ **Component-Based Architecture** - Modular, reusable UI components
- 🛣️ **Client-Side Routing** - Full SPA routing with history API
- 📡 **Event-Driven Communication** - Centralized event bus system
- 🎯 **State Management** - Built-in state management capabilities
- 🐛 **Error Handling** - Comprehensive error handling and logging
- 📱 **Modern Web APIs** - Uses latest browser features
- 🔧 **Zero Dependencies** - No external libraries required
- ⚡ **Lightweight** - < 50KB minified
- 🌐 **ES Modules** - Modern module system

### 🌍 Browser Support

- **Chrome** 80+
- **Firefox** 72+
- **Safari** 14+
- **Edge** 80+

Requires ES2020+ support.

## 🚀 Quick Start

### Installation

```bash
# Clone VanillaForge
git clone https://github.com/your-username/vanillaforge.git
cd vanillaforge

# Install dev dependencies
npm install

# Start development server
npm run dev
```

### Basic Usage

```javascript
import { createApp, BaseComponent } from './src/framework.js';

// Create a simple component
class HomeComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'home-component';
        this.state = { message: 'Hello VanillaForge!' };
    }
    
    getTemplate() {
        return `
            <div class="home">
                <h1>${this.state.message}</h1>
                <button onclick="this.updateMessage()">Update</button>
            </div>
        `;
    }
    
    updateMessage() {
        this.setState({ message: 'Updated!' });
    }
    
    getLifecycle() {
        return {
            onMount: () => {
                window.homeComponent = this; // Expose for onclick handlers
            },
            onUnmount: () => {
                delete window.homeComponent;
            }
        };
    }
}

// Create and configure the app
const app = createApp({
    appName: 'My Awesome App',
    debug: true
});

// Initialize with routes and components
await app.initialize({
    routes: {
        '/': HomeComponent,
        '/about': AboutComponent
    },
    components: {
        'home-component': HomeComponent
    }
});

// Start the application
await app.start();
```

## 🧩 Core Concepts

### Components

Components are the building blocks of your application. They extend `BaseComponent` and provide:

- **Template rendering** via `getTemplate()`
- **State management** via `setState()`
- **Lifecycle hooks** via `getLifecycle()`
- **Event handling** and cleanup

#### Component Structure

```javascript
class MyComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'my-component';
        this.state = { count: 0 };
    }
    
    // Required: Return HTML template
    getTemplate() {
        return `<div>Count: ${this.state.count}</div>`;
    }
    
    // Optional: Component methods
    increment() {
        this.setState({ count: this.state.count + 1 });
    }
    
    // Optional: Lifecycle hooks
    getLifecycle() {
        return {
            onMount: () => { /* Component mounted */ },
            onUnmount: () => { /* Component unmounted */ }
        };
    }
}
```

### Routing

Client-side routing allows navigation without page reloads:

```javascript
const app = createApp({
    router: {
        mode: 'history',     // Use HTML5 history API
        fallback: '/404'     // 404 route
    }
});

await app.initialize({
    routes: {
        '/': HomeComponent,
        '/users': UsersComponent,
        '/users/:id': UserDetailComponent,
        '/404': NotFoundComponent
    }
});
```

### Event Bus

Components communicate via the centralized event bus:

```javascript
// Emit an event
this.eventBus.emit('user-updated', { userId: 123, name: 'John' });

// Listen for events
this.eventBus.on('user-updated', (data) => {
    console.log('User updated:', data);
});

// Remove listener
this.eventBus.off('user-updated', handlerFunction);
```

### State Management

Components have built-in state management:

```javascript
// Initial state
this.state = { users: [], loading: false };

// Update state (triggers re-render)
this.setState({ loading: true });

// Update multiple properties
this.setState({ 
    users: newUsers, 
    loading: false 
});
```

## 📋 API Reference

### FrameworkApp

Main application class that orchestrates the framework.

#### Methods

- **`createApp(config)`** - Create a new application instance
- **`initialize(options)`** - Initialize routes and components
- **`start()`** - Start the application
- **`navigate(path, options)`** - Navigate to a route
- **`get(serviceName)`** - Get framework services
- **`shutdown()`** - Shutdown the application

#### Configuration

```javascript
const config = {
    appName: 'My App',           // Application name
    debug: false,                // Enable debug mode
    router: {
        mode: 'history',         // 'history' or 'hash'
        fallback: '/404'         // Fallback route
    },
    logging: {
        level: 'info',           // 'debug', 'info', 'warn', 'error'
        console: true            // Log to console
    }
};
```

### BaseComponent

Base class for all components.

#### Properties

- **`name`** - Component name
- **`state`** - Component state object
- **`props`** - Component properties
- **`element`** - DOM element reference
- **`eventBus`** - Event bus instance
- **`logger`** - Logger instance

#### Methods

- **`getTemplate()`** - Return HTML template (required)
- **`setState(newState, autoRender)`** - Update component state
- **`getLifecycle()`** - Return lifecycle hooks
- **`init()`** - Initialize component
- **`render()`** - Render component
- **`destroy()`** - Destroy component

#### Lifecycle Hooks

```javascript
getLifecycle() {
    return {
        onMount: async () => {
            // Component mounted to DOM
        },
        onUnmount: () => {
            // Component removed from DOM
        }
    };
}
```

### Router

Handles client-side navigation.

#### Methods

- **`addRoute(path, component)`** - Add a route
- **`navigate(path, options)`** - Navigate to path
- **`findRoute(path)`** - Find matching route
- **`start()`** - Start router

### ComponentManager

Manages component lifecycle and registration.

#### Methods

- **`registerComponent(name, componentClass)`** - Register a component
- **`loadComponent(name, props, container)`** - Load a component
- **`unloadComponent(id)`** - Unload a component
- **`getActiveComponents()`** - Get active components

### EventBus

Centralized event system.

#### Methods

- **`on(event, handler)`** - Listen for event
- **`off(event, handler)`** - Remove event listener
- **`emit(event, data)`** - Emit event
- **`once(event, handler)`** - Listen once

### Logger

Configurable logging system.

#### Methods

- **`debug(message, data)`** - Debug log
- **`info(message, data)`** - Info log
- **`warn(message, data)`** - Warning log
- **`error(message, data)`** - Error log

### ErrorHandler

Centralized error handling.

#### Methods

- **`handleError(error, type, context)`** - Handle error
- **`setErrorBoundary(handler)`** - Set error boundary

## 💡 Examples

### Counter Component

```javascript
class CounterComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'counter-component';
        this.state = { count: props.initialCount || 0 };
    }
    
    getTemplate() {
        return `
            <div class="counter">
                <h2>Counter: ${this.state.count}</h2>
                <button onclick="window.counter.increment()">+</button>
                <button onclick="window.counter.decrement()">-</button>
                <button onclick="window.counter.reset()">Reset</button>
            </div>
        `;
    }
    
    increment() {
        this.setState({ count: this.state.count + 1 });
    }
    
    decrement() {
        this.setState({ count: this.state.count - 1 });
    }
    
    reset() {
        this.setState({ count: 0 });
    }
    
    getLifecycle() {
        return {
            onMount: () => {
                window.counter = this;
            },
            onUnmount: () => {
                delete window.counter;
            }
        };
    }
}
```

### Todo App Component

```javascript
class TodoComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'todo-component';
        this.state = { 
            todos: [],
            newTodo: ''
        };
    }
    
    getTemplate() {
        const todoItems = this.state.todos.map((todo, index) => `
            <li class="${todo.completed ? 'completed' : ''}">
                <span>${todo.text}</span>
                <button onclick="window.todoApp.toggleTodo(${index})">
                    ${todo.completed ? 'Undo' : 'Done'}
                </button>
                <button onclick="window.todoApp.deleteTodo(${index})">Delete</button>
            </li>
        `).join('');
        
        return `
            <div class="todo-app">
                <h2>Todo List</h2>
                <div class="add-todo">
                    <input 
                        type="text" 
                        placeholder="Add new todo..."
                        value="${this.state.newTodo}"
                        onkeypress="if(event.key==='Enter') window.todoApp.addTodo()"
                        oninput="window.todoApp.updateNewTodo(event.target.value)"
                    >
                    <button onclick="window.todoApp.addTodo()">Add</button>
                </div>
                <ul class="todo-list">${todoItems}</ul>
            </div>
        `;
    }
    
    updateNewTodo(value) {
        this.setState({ newTodo: value });
    }
    
    addTodo() {
        if (this.state.newTodo.trim()) {
            this.setState({
                todos: [...this.state.todos, {
                    text: this.state.newTodo.trim(),
                    completed: false
                }],
                newTodo: ''
            });
        }
    }
    
    toggleTodo(index) {
        const todos = [...this.state.todos];
        todos[index].completed = !todos[index].completed;
        this.setState({ todos });
    }
    
    deleteTodo(index) {
        const todos = this.state.todos.filter((_, i) => i !== index);
        this.setState({ todos });
    }
    
    getLifecycle() {
        return {
            onMount: () => {
                window.todoApp = this;
            },
            onUnmount: () => {
                delete window.todoApp;
            }
        };
    }
}
```

## ✅ Best Practices

### Component Design

1. **Keep components focused** - Each component should have a single responsibility
2. **Use descriptive names** - Component names should clearly indicate their purpose
3. **Minimize state** - Only store what the component needs to render
4. **Expose methods globally** - For onclick handlers, expose component methods via `window`

### State Management

1. **Immutable updates** - Always create new objects/arrays when updating state
2. **Batch updates** - Use `setState` once per user action when possible
3. **Derive computed values** - Calculate derived data in `getTemplate()` rather than storing in state

### Event Handling

1. **Use onclick attributes** - More reliable than addEventListener for dynamic content
2. **Clean up global references** - Remove global component references in `onUnmount`
3. **Validate event data** - Always validate data received from events

### Performance

1. **Minimize DOM updates** - Only call `setState` when necessary
2. **Use specific selectors** - Be specific when querying DOM elements
3. **Clean up resources** - Remove event listeners and timers in `onUnmount`

### Code Organization

1. **Group related components** - Keep related components in the same directory
2. **Use consistent file naming** - Follow a consistent naming convention
3. **Document component interfaces** - Use JSDoc comments for public methods

## 🔧 Troubleshooting

### Common Issues

#### Components not rendering
- Check that the component is properly registered
- Verify the route is correctly configured
- Ensure the component extends `BaseComponent`

#### Event handlers not working
- Verify onclick attributes are correctly set
- Check that component methods are exposed globally
- Ensure the component is mounted before events fire

#### State not updating
- Make sure you're calling `setState()` not directly modifying state
- Check for JavaScript errors in browser console
- Verify `getTemplate()` returns updated HTML

#### Routing issues
- Check browser console for navigation errors
- Verify route paths are correctly formatted
- Ensure fallback routes are configured

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const app = createApp({
    debug: true,
    logging: {
        level: 'debug',
        console: true
    }
});
```

### Browser Dev Tools

Use browser dev tools to inspect:
- **Console** - Check for JavaScript errors and debug logs
- **Elements** - Inspect component DOM structure
- **Network** - Monitor resource loading
- **Application** - Check local storage and session state

## 🏗️ Build and Deploy

### Development

```bash
npm run dev          # Start development server
npm run serve-dev    # Serve current directory
```

### Production

```bash
npm run build        # Build for production
npm run serve        # Serve built files
```

### Build Output

The build process creates:
- Minified CSS files
- Copied JavaScript modules
- PWA manifest
- Offline page
- Optimized assets

Built files are output to the `dist/` directory.

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy Forging! 🔥**
