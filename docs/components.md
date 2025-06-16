# 🧩 Component System

Complete guide to VanillaForge's component system.

## Table of Contents

- [Overview](#overview)
- [Component Lifecycle](#component-lifecycle)
- [State Management](#state-management)
- [Event Handling](#event-handling)
- [Component Communication](#component-communication)
- [Best Practices](#best-practices)
- [Advanced Patterns](#advanced-patterns)

## Overview

VanillaForge components are the building blocks of your application. They provide:

- **Encapsulation** - Self-contained UI elements with their own state and logic
- **Reusability** - Components can be used throughout your application
- **Composition** - Complex UIs built from simple components
- **Lifecycle Management** - Automatic cleanup and resource management

## Component Lifecycle

Every component goes through several phases during its lifetime:

### 1. Creation
```javascript
class MyComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'my-component';
        this.state = { /* initial state */ };
    }
}
```

### 2. Initialization
```javascript
async init() {
    await super.init();
    // Custom initialization logic
    this.setupEventListeners();
    this.loadData();
}
```

### 3. Rendering
```javascript
getTemplate() {
    return `
        <div class="${this.name}">
            <!-- Component HTML -->
        </div>
    `;
}
```

### 4. Mounting
```javascript
getLifecycle() {
    return {
        onMount: () => {
            // Component is now in the DOM
            this.initializePlugins();
            this.startAnimations();
        }
    };
}
```

### 5. Updates
```javascript
// State changes trigger re-renders
this.setState({ newData: 'value' });
```

### 6. Unmounting
```javascript
getLifecycle() {
    return {
        onUnmount: () => {
            // Component being removed from DOM
            this.cleanup();
            this.stopAnimations();
        }
    };
}
```

### 7. Destruction
```javascript
async destroy() {
    // Final cleanup
    this.removeEventListeners();
    await super.destroy();
}
```

## State Management

Components manage their own local state and can respond to state changes.

### Initial State
```javascript
constructor(eventBus, props = {}) {
    super(eventBus, props);
    this.state = {
        loading: false,
        data: [],
        error: null,
        selectedItem: null
    };
}
```

### Updating State
```javascript
// Simple update
this.setState({ loading: true });

// Multiple properties
this.setState({
    loading: false,
    data: responseData,
    error: null
});

// Conditional updates
if (this.state.selectedItem !== newItem) {
    this.setState({ selectedItem: newItem });
}
```

### Computed Properties
```javascript
getTemplate() {
    const { data, loading, error } = this.state;
    
    // Compute derived values in template
    const itemCount = data.length;
    const hasItems = itemCount > 0;
    
    return `
        <div class="component">
            ${loading ? '<div class="loading">Loading...</div>' : ''}
            ${error ? `<div class="error">${error}</div>` : ''}
            ${hasItems ? `<div class="count">${itemCount} items</div>` : ''}
            <!-- Rest of template -->
        </div>
    `;
}
```

## Event Handling

Components can handle user interactions and system events.

### DOM Events
```javascript
getTemplate() {
    return `
        <div class="component">
            <button onclick="window.${this.name}.handleClick(event)">
                Click Me
            </button>
            <input 
                type="text" 
                oninput="window.${this.name}.handleInput(event)"
                value="${this.state.inputValue}"
            >
        </div>
    `;
}

handleClick(event) {
    console.log('Button clicked!');
    this.setState({ clicked: true });
}

handleInput(event) {
    this.setState({ inputValue: event.target.value });
}

getLifecycle() {
    return {
        onMount: () => {
            // Expose component globally for event handlers
            window[this.name] = this;
        },
        onUnmount: () => {
            // Clean up global reference
            delete window[this.name];
        }
    };
}
```

### Framework Events
```javascript
async init() {
    await super.init();
    
    // Listen for framework events
    this.eventBus.on('user:login', this.handleUserLogin.bind(this));
    this.eventBus.on('theme:changed', this.handleThemeChange.bind(this));
}

handleUserLogin(userData) {
    this.setState({ 
        user: userData,
        isLoggedIn: true 
    });
}

handleThemeChange(theme) {
    this.element.className = `${this.name} theme-${theme}`;
}

async destroy() {
    // Clean up event listeners
    this.eventBus.off('user:login', this.handleUserLogin);
    this.eventBus.off('theme:changed', this.handleThemeChange);
    await super.destroy();
}
```

## Component Communication

Components can communicate through several mechanisms:

### Event Bus
```javascript
// Component A emits an event
this.eventBus.emit('product:selected', {
    productId: 123,
    productName: 'Widget'
});

// Component B listens for the event
this.eventBus.on('product:selected', (product) => {
    this.setState({ selectedProduct: product });
});
```

### Props
```javascript
// Parent passes props to child
const childComponent = new ChildComponent(this.eventBus, {
    title: 'Child Title',
    data: this.state.data,
    onUpdate: (newData) => {
        this.setState({ data: newData });
    }
});
```

### Global State
```javascript
// Using a global state manager
class AppState {
    static state = { user: null, theme: 'light' };
    static listeners = [];
    
    static setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener(this.state));
    }
    
    static subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

// In component
async init() {
    await super.init();
    this.unsubscribe = AppState.subscribe((state) => {
        this.setState({ globalState: state });
    });
}

async destroy() {
    this.unsubscribe();
    await super.destroy();
}
```

## Best Practices

### Component Design
1. **Single Responsibility** - Each component should do one thing well
2. **Small and Focused** - Keep components small and manageable
3. **Descriptive Names** - Use clear, descriptive component names
4. **Consistent Structure** - Follow consistent patterns across components

### State Management
1. **Minimize State** - Only store what's necessary for rendering
2. **Immutable Updates** - Always create new objects when updating state
3. **Validate Props** - Validate props in the constructor
4. **Default Values** - Provide sensible defaults for all props

### Performance
1. **Efficient Renders** - Only call setState when state actually changes
2. **Cleanup Resources** - Always clean up timers, listeners, and subscriptions
3. **Lazy Loading** - Load data only when needed
4. **Debounce Updates** - Debounce rapid state changes

### Error Handling
```javascript
async loadData() {
    this.setState({ loading: true, error: null });
    
    try {
        const data = await fetchData();
        this.setState({ data, loading: false });
    } catch (error) {
        this.setState({ 
            error: error.message, 
            loading: false 
        });
        this.logger.error('Failed to load data', error);
    }
}
```

## Advanced Patterns

### Higher-Order Components
```javascript
function withLoading(ComponentClass) {
    return class extends ComponentClass {
        constructor(eventBus, props) {
            super(eventBus, props);
            this.state = { ...this.state, loading: false };
        }
        
        showLoading() {
            this.setState({ loading: true });
        }
        
        hideLoading() {
            this.setState({ loading: false });
        }
        
        getTemplate() {
            if (this.state.loading) {
                return '<div class="loading">Loading...</div>';
            }
            return super.getTemplate();
        }
    };
}

// Usage
const LoadableUserList = withLoading(UserListComponent);
```

### Component Composition
```javascript
class PageComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'page-component';
        this.children = [];
    }
    
    async init() {
        await super.init();
        
        // Create child components
        this.header = new HeaderComponent(this.eventBus, {
            title: this.props.title
        });
        this.content = new ContentComponent(this.eventBus, {
            data: this.props.data
        });
        this.footer = new FooterComponent(this.eventBus);
        
        this.children = [this.header, this.content, this.footer];
        
        // Initialize children
        await Promise.all(this.children.map(child => child.init()));
    }
    
    getTemplate() {
        return `
            <div class="page">
                <div id="header-container"></div>
                <div id="content-container"></div>
                <div id="footer-container"></div>
            </div>
        `;
    }
    
    getLifecycle() {
        return {
            onMount: async () => {
                // Render children into containers
                await this.header.render();
                this.header.container = this.element.querySelector('#header-container');
                this.header.container.appendChild(this.header.element);
                
                await this.content.render();
                this.content.container = this.element.querySelector('#content-container');
                this.content.container.appendChild(this.content.element);
                
                await this.footer.render();
                this.footer.container = this.element.querySelector('#footer-container');
                this.footer.container.appendChild(this.footer.element);
            },
            onUnmount: () => {
                // Cleanup children
                this.children.forEach(child => child.destroy());
            }
        };
    }
}
```

### Dynamic Components
```javascript
class DynamicContainer extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'dynamic-container';
        this.currentComponent = null;
    }
    
    async loadComponent(componentName, props = {}) {
        // Unload current component
        if (this.currentComponent) {
            await this.currentComponent.destroy();
        }
        
        // Load new component
        const ComponentClass = this.getComponentClass(componentName);
        this.currentComponent = new ComponentClass(this.eventBus, props);
        
        await this.currentComponent.init();
        await this.currentComponent.render();
        
        // Mount in container
        if (this.element) {
            this.element.innerHTML = '';
            this.element.appendChild(this.currentComponent.element);
        }
    }
    
    getComponentClass(name) {
        const components = {
            'user-list': UserListComponent,
            'user-detail': UserDetailComponent,
            'settings': SettingsComponent
        };
        return components[name] || NotFoundComponent;
    }
}
```

---

This component system provides a solid foundation for building complex, maintainable applications with VanillaForge.
