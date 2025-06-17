# 🔧 VanillaForge API Reference

*Essential API methods and examples*

## 🚀 App Creation

### What is an App?
An "app" in VanillaForge represents your entire single-page application. It manages routing (which component shows for each URL), handles navigation between pages, and coordinates all the components working together.

### Creating Your App
The `createApp()` function sets up your application with configuration options:

```javascript
// Create app
const app = createApp({ appName: 'My App', debug: true });

// Initialize with routes
await app.initialize({
    routes: { '/': HomeComponent, '/about': AboutComponent }
});

// Start the app
await app.start();

// Navigate programmatically  
app.navigate('/about');
```

## 🧩 Components

### What are Components?
Components are reusable pieces of your user interface. Think of them like custom HTML elements - each component manages its own content, styling, and behavior. You can combine many small components to build complex applications.

### Creating a Component
All components extend from `BaseComponent` and must have a `render()` method that returns HTML:

```javascript
class MyComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.state = { count: 0 };  // Component's data
    }

    render() {
        // This method returns the HTML for your component
        return `<div>Count: ${this.state.count}</div>`;
    }

    afterRender() {
        // Add event listeners after the HTML is created
    }

    // Update component data and automatically re-render
    increment() {
        this.setState({ count: this.state.count + 1 });
    }
}
```

## 🗺️ Routing

### What is Routing?
Routing connects URLs (like `/about` or `/users/123`) to specific components. When someone visits a URL, VanillaForge shows the right component. This is how single-page applications simulate having multiple "pages".

### Setting Up Routes
Routes are defined when you initialize your app:

```javascript
// Static routes - exact URL matches
'/': HomeComponent          // Shows HomeComponent at homepage
'/about': AboutComponent    // Shows AboutComponent at /about

// Dynamic routes - URLs with variables
'/users/:id': UserComponent          // :id captures the user ID (e.g., /users/123)
'/posts/:slug/edit': EditComponent   // Multiple variables allowed

// Navigation guards - check permissions before showing pages
router.beforeNavigation((route, path) => {
    if (path.startsWith('/admin') && !isLoggedIn) {
        app.navigate('/login');
        return false;  // Stop the navigation
    }
    return true;  // Allow the navigation
});
```

## 📡 Events

### What is the Event System?
The event system lets components communicate with each other without being directly connected. One component can "emit" an event (like "user logged in") and other components can "listen" for that event and react accordingly.

### Using Events
Components use the event bus to send and receive messages:

```javascript
// Send an event (from any component)
this.eventBus.emit('user:login', userData);

// Listen for events (in any other component)
this.eventBus.on('user:login', (data) => {
    console.log('User logged in:', data);
    // Update this component based on the event
});

// Stop listening (important for cleanup)
this.eventBus.off('user:login', handler);
```

## 🔧 Utilities

### What are Utilities?
VanillaForge includes helpful utility functions for common tasks like showing alerts, validating forms, and monitoring performance. These save you from writing repetitive code.

### Available Utilities

**Alerts** - Show beautiful notifications to users:
```javascript
SweetAlert.success('Saved!');                    // Green success message
SweetAlert.error('Failed to save');              // Red error message
const confirmed = await SweetAlert.confirm('Delete item?');  // Yes/No dialog
```

**Validation** - Check if user input is valid:
```javascript
ValidationUtils.email('test@email.com');         // Returns true if valid email
ValidationUtils.required(value);                 // Returns true if not empty
ValidationUtils.minLength(password, 8);          // Returns true if 8+ characters
```

**Performance** - Measure how fast things run:
```javascript
PerformanceUtils.startTimer('operation');        // Start timing
// ... do some work ...
const duration = PerformanceUtils.endTimer('operation');  // Get duration in milliseconds
```

**Logging** - Keep track of what's happening:
```javascript
Logger.info('App started');                      // General information
Logger.error('Something failed', error);         // Error messages
```

## 📝 Component Lifecycle

### What is the Component Lifecycle?
The lifecycle refers to the different stages a component goes through: creation, rendering, updating, and destruction. VanillaForge calls specific methods at each stage, letting you run code at the right time.

### Lifecycle Methods
Here are the methods you can override in your components:

```javascript
class Component extends BaseComponent {
    async init() {
        // Called once before the first render
        // Good for: loading data, setting up event listeners
        console.log('Component is initializing');
    }

    render() {
        // Called every time the component needs to update its HTML
        // Required method - must return HTML string
        return '<div>Hello</div>';
    }

    afterRender() {
        // Called after the HTML is added to the page
        // Good for: adding click handlers, focusing inputs
        console.log('Component is now visible');
    }

    beforeDestroy() {
        // Called before the component is removed
        // Good for: cleaning up timers, removing event listeners
        console.log('Component is about to be removed');
    }
}
```

---

*That's it! These are the core APIs you'll use 90% of the time.*
