# 📡 Event System

*Component communication via events*

## What is the Event System?

The event system is how components in your VanillaForge app communicate with each other. Instead of components being directly connected (which creates messy dependencies), they communicate by sending and listening for "events" - messages that flow through a central event bus.

Think of it like a radio system:
- Components can "broadcast" messages (emit events)
- Other components can "tune in" to specific messages (listen for events)
- Components don't need to know about each other directly

This makes your app more flexible and easier to maintain.

## Basic Events

### Sending Events (Emitting)
Any component can send an event using `this.eventBus.emit()`:

```javascript
// Send an event with data
this.eventBus.emit('user:login', { 
    userId: 123, 
    name: 'John',
    timestamp: Date.now()
});

// Send an event without data
this.eventBus.emit('sidebar:toggle');
```

### Listening for Events
Any component can listen for events using `this.eventBus.on()`:

```javascript
// Listen for an event
this.eventBus.on('user:login', (userData) => {
    console.log('User logged in:', userData);
    // Update this component based on the event
    this.setState({ currentUser: userData });
});

// Listen for events without data
this.eventBus.on('sidebar:toggle', () => {
    this.toggleSidebar();
});
```

### Stopping Listening
Always clean up event listeners when components are destroyed to prevent memory leaks:

```javascript
// Store the handler function so you can remove it later
this.handleUserLogin = (userData) => {
    this.setState({ currentUser: userData });
};

// Add the listener
this.eventBus.on('user:login', this.handleUserLogin);

// Remove the listener (usually in beforeDestroy)
this.eventBus.off('user:login', this.handleUserLogin);
```

## Component Communication Example

Here's how two components can communicate using events:

```javascript
// Login Form Component - sends events
class LoginFormComponent extends BaseComponent {
    afterRender() {
        this.element.querySelector('#login-btn').onclick = async () => {
            const email = this.element.querySelector('#email').value;
            const password = this.element.querySelector('#password').value;
            
            try {
                const userData = await loginUser(email, password);
                
                // Tell the whole app that user logged in
                this.eventBus.emit('user:login', userData);
                
                // Navigate to dashboard
                this.app.navigate('/dashboard');
                
            } catch (error) {
                // Tell the app about the error
                this.eventBus.emit('user:login:error', { 
                    message: 'Invalid credentials' 
                });
            }
        };
    }
}

// Header Component - listens for events
class HeaderComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.state = { user: null, loginError: null };
    }

    async init() {
        // Listen for successful login
        this.handleUserLogin = (userData) => {
            this.setState({ user: userData, loginError: null });
        };

        // Listen for login errors
        this.handleLoginError = (errorData) => {
            this.setState({ loginError: errorData.message });
        };

        // Set up listeners
        this.eventBus.on('user:login', this.handleUserLogin);
        this.eventBus.on('user:login:error', this.handleLoginError);
    }

    beforeDestroy() {
        // Clean up listeners
        this.eventBus.off('user:login', this.handleUserLogin);
        this.eventBus.off('user:login:error', this.handleLoginError);
    }

    render() {
        if (this.state.user) {
            return `
                <header>
                    <span>Welcome, ${this.state.user.name}!</span>
                    <button id="logout">Logout</button>
                </header>
            `;
        }

        return `
            <header>
                <span>Please log in</span>
                ${this.state.loginError ? `<div class="error">${this.state.loginError}</div>` : ''}
            </header>
        `;
    }
}
```

## Common Event Patterns

Use descriptive event names that follow a pattern. Here are some common conventions:

```javascript
// User-related events
this.eventBus.emit('user:login', userData);
this.eventBus.emit('user:logout');
this.eventBus.emit('user:profile:updated', newProfileData);

// Data-related events  
this.eventBus.emit('data:loaded', responseData);
this.eventBus.emit('data:error', errorMessage);
this.eventBus.emit('data:saved', savedItem);
this.eventBus.emit('data:deleted', deletedItemId);

// UI-related events
this.eventBus.emit('ui:loading', true);
this.eventBus.emit('ui:modal:open', modalData);
this.eventBus.emit('ui:notification', { type: 'success', message: 'Saved!' });
this.eventBus.emit('ui:sidebar:toggle');

// Navigation events
this.eventBus.emit('nav:page:changed', newPageData);
this.eventBus.emit('nav:breadcrumb:update', breadcrumbItems);
```

## One-Time Events

Sometimes you only want to listen for an event once. Use `once()` instead of `on()`:

```javascript
// Listen for event only once, then automatically stop listening
this.eventBus.once('app:ready', () => {
    console.log('App is ready!');
    this.initializeFeatures();
});

// This is equivalent to:
const handler = () => {
    console.log('App is ready!');
    this.initializeFeatures();
    this.eventBus.off('app:ready', handler); // Remove listener
};
this.eventBus.on('app:ready', handler);
```

## Event Cleanup Best Practices

Always clean up event listeners to prevent memory leaks:

```javascript
class MyComponent extends BaseComponent {
    async init() {
        // Store handler references for cleanup
        this.handleDataUpdate = (data) => {
            this.setState({ data });
        };
        
        this.handleUserLogin = (userData) => {
            this.setState({ user: userData });
        };
        
        // Set up listeners
        this.eventBus.on('data:updated', this.handleDataUpdate);
        this.eventBus.on('user:login', this.handleUserLogin);
    }

    beforeDestroy() {
        // Always clean up ALL event listeners
        this.eventBus.off('data:updated', this.handleDataUpdate);
        this.eventBus.off('user:login', this.handleUserLogin);
    }
}
```

## Tips for Effective Event Usage

### Use Descriptive Names
```javascript
// Good
this.eventBus.emit('shopping-cart:item:added', itemData);
this.eventBus.emit('user:profile:photo:updated', photoUrl);

// Avoid
this.eventBus.emit('update', data);
this.eventBus.emit('thing-happened');
```

### Include Useful Data
```javascript
// Good - includes context
this.eventBus.emit('form:validation:failed', {
    field: 'email',
    error: 'Invalid email format',
    value: userInput
});

// Less helpful
this.eventBus.emit('form:error');
```

### Don't Overuse Events
Events are great for:
- ✅ Cross-component communication
- ✅ Notifying multiple components about changes
- ✅ Decoupling components

Events might be overkill for:
- ❌ Simple parent-child communication (use props instead)
- ❌ One-off actions within a single component

---

*Always clean up event listeners to prevent memory leaks.*
