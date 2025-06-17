# 🧩 Components

*How to build reusable UI components*

## What are Components?

Components are the building blocks of your VanillaForge application. Think of them like custom HTML elements - each component is a self-contained piece of your user interface that manages its own:

- **Content** (what HTML it shows)
- **Data** (what information it keeps track of)
- **Behavior** (how it responds to user interactions)

You can combine many small components to build complex applications, and reuse the same component in multiple places.

## Basic Component

The simplest component just needs to return some HTML. All components must extend from `BaseComponent`:

```javascript
class MyComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.state = { message: 'Hello!' };  // Component's data
    }

    render() {
        // This method returns the HTML for your component
        return `<div class="my-component">${this.state.message}</div>`;
    }

    afterRender() {
        // Add event listeners here (after HTML is created)
    }
}
```

## Component with State

State is the data your component keeps track of. When state changes, the component automatically re-renders to show the new data:

```javascript
class CounterComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        // Initialize the component's data
        this.state = { count: 0 };
    }

    render() {
        // Use state data in your HTML
        return `
            <div class="counter">
                <p>Count: ${this.state.count}</p>
                <button id="increment">+</button>
                <button id="decrement">-</button>
            </div>
        `;
    }

    afterRender() {
        // Add event listeners after the HTML is created
        this.element.querySelector('#increment').onclick = () => {
            // Update state - this automatically re-renders the component
            this.setState({ count: this.state.count + 1 });
        };
        
        this.element.querySelector('#decrement').onclick = () => {
            this.setState({ count: this.state.count - 1 });
        };
    }
}
```

## Lifecycle Methods

Components go through different stages: creation, rendering, and destruction. You can run code at each stage by defining these methods:

```javascript
class LifecycleComponent extends BaseComponent {
    async init() {
        // Called ONCE before the first render
        // Good for: loading data from APIs, setting up subscriptions
        console.log('Component initializing');
        this.state.data = await fetchSomeData();
    }

    render() {
        // Called EVERY TIME the component needs to update its HTML
        // Required method - must return an HTML string
        return '<div>Component content</div>';
    }

    afterRender() {
        // Called AFTER each render (when HTML is in the DOM)
        // Good for: adding event listeners, focusing inputs, setting up charts
        console.log('Component rendered');
    }

    beforeDestroy() {
        // Called BEFORE the component is removed from the page
        // Good for: cleaning up timers, removing event listeners, canceling API calls
        console.log('Component cleaning up');
    }
}
```

## Props and Parameters

Components can receive data from two sources:

1. **URL Parameters** - data from the URL (like `/users/123`)
2. **Props** - data passed from parent components

```javascript
// URL: /users/123
class UserComponent extends BaseComponent {
    async init() {
        // Get data from the URL
        const userId = this.props.params.id; // '123' from /users/123
        
        // Get data passed from parent
        const userData = this.props.userData; // Passed when component was created
        
        // Load user data based on URL parameter
        this.state.user = await fetchUser(userId);
    }

    render() {
        if (!this.state.user) {
            return '<div>Loading user...</div>';
        }

        return `
            <div class="user-profile">
                <h1>${this.state.user.name}</h1>
                <p>User ID: ${this.props.params.id}</p>
                <p>Email: ${this.state.user.email}</p>
            </div>
        `;
    }
}
```

## Component Communication

Components can talk to each other using the event system. This lets you build applications where different parts can communicate without being directly connected:

```javascript
class ParentComponent extends BaseComponent {
    async init() {
        // Listen for messages from child components
        this.eventBus.on('child:action', (data) => {
            console.log('Child did something:', data);
            // Update parent based on child action
            this.setState({ lastChildAction: data.action });
        });
    }

    beforeDestroy() {
        // Always clean up event listeners
        this.eventBus.off('child:action');
    }
}

class ChildComponent extends BaseComponent {
    afterRender() {
        this.element.querySelector('button').onclick = () => {
            // Tell parent (and anyone else listening) about this action
            this.eventBus.emit('child:action', { 
                action: 'button-click',
                timestamp: Date.now()
            });
        };
    }
}
```

## Best Practices

### Keep Components Small
Each component should have one clear purpose. If a component is doing too many things, split it into smaller components.

```javascript
// Good - focused component
class UserAvatar extends BaseComponent {
    render() {
        return `<img src="${this.props.user.avatar}" alt="${this.props.user.name}">`;
    }
}

// Good - another focused component  
class UserName extends BaseComponent {
    render() {
        return `<span class="user-name">${this.props.user.name}</span>`;
    }
}
```

### Clean Up Resources
Always clean up timers, event listeners, and API calls when components are destroyed:

```javascript
class ComponentWithTimer extends BaseComponent {
    afterRender() {
        // Set up a timer
        this.timer = setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    beforeDestroy() {
        // Clean up the timer
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
```

---

*Keep components small and focused on a single responsibility.*
