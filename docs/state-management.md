# 🎯 State Management

Complete guide to state management in VanillaForge applications.

## Table of Contents

- [Overview](#overview)
- [Component State](#component-state)
- [Global State](#global-state)
- [State Patterns](#state-patterns)
- [State Persistence](#state-persistence)
- [Advanced Techniques](#advanced-techniques)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)

## Overview

VanillaForge provides flexible state management capabilities at both the component and application level. The framework encourages predictable state updates and efficient rendering through its built-in state management system.

### Key Concepts

- **Component State** - Local state managed by individual components
- **Global State** - Application-wide state accessible by all components
- **State Immutability** - Always create new state objects
- **Reactive Updates** - Automatic re-rendering on state changes
- **State Persistence** - Saving and restoring state across sessions

## Component State

### Basic State Management

```javascript
class UserProfileComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'user-profile';
        
        // Initialize component state
        this.state = {
            user: null,
            loading: false,
            editing: false,
            errors: {},
            isDirty: false
        };
    }
    
    // Update state and trigger re-render
    updateProfile(profileData) {
        this.setState({
            user: { ...this.state.user, ...profileData },
            isDirty: true,
            errors: {}
        });
    }
    
    // Handle async operations
    async saveProfile() {
        this.setState({ loading: true, errors: {} });
        
        try {
            const updatedUser = await saveUserProfile(this.state.user);
            this.setState({
                user: updatedUser,
                loading: false,
                editing: false,
                isDirty: false
            });
        } catch (error) {
            this.setState({
                loading: false,
                errors: { save: error.message }
            });
        }
    }
}
```

### Computed State

```javascript
class ShoppingCartComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.state = {
            items: [],
            taxRate: 0.08,
            shippingCost: 10.00
        };
    }
    
    getTemplate() {
        // Compute derived values in template
        const { items, taxRate, shippingCost } = this.state;
        
        const subtotal = items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const tax = subtotal * taxRate;
        const total = subtotal + tax + shippingCost;
        const itemCount = items.reduce((sum, item) => 
            sum + item.quantity, 0
        );
        
        return `
            <div class="shopping-cart">
                <h2>Shopping Cart (${itemCount} items)</h2>
                <div class="items">
                    ${items.map(item => this.renderItem(item)).join('')}
                </div>
                <div class="summary">
                    <div>Subtotal: $${subtotal.toFixed(2)}</div>
                    <div>Tax: $${tax.toFixed(2)}</div>
                    <div>Shipping: $${shippingCost.toFixed(2)}</div>
                    <div class="total">Total: $${total.toFixed(2)}</div>
                </div>
            </div>
        `;
    }
    
    addItem(product) {
        const existingItem = this.state.items.find(item => 
            item.id === product.id
        );
        
        if (existingItem) {
            this.updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            this.setState({
                items: [...this.state.items, { ...product, quantity: 1 }]
            });
        }
    }
    
    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(itemId);
            return;
        }
        
        this.setState({
            items: this.state.items.map(item =>
                item.id === itemId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        });
    }
    
    removeItem(itemId) {
        this.setState({
            items: this.state.items.filter(item => item.id !== itemId)
        });
    }
}
```

### State Validation

```javascript
class FormComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.state = {
            formData: {
                email: '',
                password: '',
                confirmPassword: '',
                name: ''
            },
            errors: {},
            isSubmitting: false,
            isValid: false
        };
    }
    
    updateField(fieldName, value) {
        const newFormData = {
            ...this.state.formData,
            [fieldName]: value
        };
        
        const errors = this.validateForm(newFormData);
        const isValid = Object.keys(errors).length === 0;
        
        this.setState({
            formData: newFormData,
            errors,
            isValid
        });
    }
    
    validateForm(formData) {
        const errors = {};
        
        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!this.isValidEmail(formData.email)) {
            errors.email = 'Invalid email format';
        }
        
        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }
        
        return errors;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
```

## Global State

### Application State Manager

```javascript
class AppStateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = {
            user: null,
            theme: 'light',
            language: 'en',
            isOnline: navigator.onLine,
            notifications: [],
            settings: {}
        };
        
        this.subscribers = new Set();
        this.setupEventListeners();
    }
    
    getState() {
        return { ...this.state };
    }
    
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Notify subscribers
        this.subscribers.forEach(callback => {
            callback(this.state, prevState);
        });
        
        // Emit global state change event
        this.eventBus.emit('app:state-changed', {
            newState: this.state,
            prevState,
            changes: newState
        });
    }
    
    subscribe(callback) {
        this.subscribers.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }
    
    // State action methods
    setUser(user) {
        this.setState({ user });
        this.eventBus.emit('app:user-changed', user);
    }
    
    setTheme(theme) {
        this.setState({ theme });
        this.eventBus.emit('app:theme-changed', theme);
        
        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    addNotification(notification) {
        const notifications = [
            ...this.state.notifications,
            { ...notification, id: Date.now(), timestamp: new Date() }
        ];
        this.setState({ notifications });
    }
    
    removeNotification(notificationId) {
        const notifications = this.state.notifications.filter(
            n => n.id !== notificationId
        );
        this.setState({ notifications });
    }
    
    setupEventListeners() {
        // Listen for online/offline status
        window.addEventListener('online', () => {
            this.setState({ isOnline: true });
        });
        
        window.addEventListener('offline', () => {
            this.setState({ isOnline: false });
        });
        
        // Listen for app-level events
        this.eventBus.on('user:login', (user) => {
            this.setUser(user);
        });
        
        this.eventBus.on('user:logout', () => {
            this.setUser(null);
        });
    }
}

// Create global instance
const appState = new AppStateManager(eventBus);

// Make available to components
window.appState = appState;
```

### Component State Synchronization

```javascript
class StatefulComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'stateful-component';
        
        // Local state
        this.state = {
            localData: null,
            isLoading: false
        };
        
        // Subscribe to global state
        this.unsubscribeFromGlobal = appState.subscribe(
            this.handleGlobalStateChange.bind(this)
        );
    }
    
    handleGlobalStateChange(newGlobalState, prevGlobalState) {
        // React to specific global state changes
        if (newGlobalState.user !== prevGlobalState.user) {
            this.handleUserChange(newGlobalState.user);
        }
        
        if (newGlobalState.theme !== prevGlobalState.theme) {
            this.handleThemeChange(newGlobalState.theme);
        }
    }
    
    handleUserChange(user) {
        if (user) {
            this.loadUserData(user.id);
        } else {
            this.setState({ localData: null });
        }
    }
    
    handleThemeChange(theme) {
        // Update component for new theme
        if (this.element) {
            this.element.setAttribute('data-theme', theme);
        }
    }
    
    async destroy() {
        // Clean up global state subscription
        this.unsubscribeFromGlobal();
        await super.destroy();
    }
}
```

## State Patterns

### Redux-like Pattern

```javascript
// Actions
const actions = {
    ADD_TODO: 'ADD_TODO',
    TOGGLE_TODO: 'TOGGLE_TODO',
    REMOVE_TODO: 'REMOVE_TODO',
    SET_FILTER: 'SET_FILTER'
};

// Reducer
function todoReducer(state = { todos: [], filter: 'all' }, action) {
    switch (action.type) {
        case actions.ADD_TODO:
            return {
                ...state,
                todos: [
                    ...state.todos,
                    {
                        id: Date.now(),
                        text: action.payload.text,
                        completed: false,
                        createdAt: new Date()
                    }
                ]
            };
            
        case actions.TOGGLE_TODO:
            return {
                ...state,
                todos: state.todos.map(todo =>
                    todo.id === action.payload.id
                        ? { ...todo, completed: !todo.completed }
                        : todo
                )
            };
            
        case actions.REMOVE_TODO:
            return {
                ...state,
                todos: state.todos.filter(todo => todo.id !== action.payload.id)
            };
            
        case actions.SET_FILTER:
            return {
                ...state,
                filter: action.payload.filter
            };
            
        default:
            return state;
    }
}

// Store
class Store {
    constructor(reducer, initialState = {}) {
        this.reducer = reducer;
        this.state = initialState;
        this.subscribers = new Set();
    }
    
    getState() {
        return { ...this.state };
    }
    
    dispatch(action) {
        const prevState = { ...this.state };
        this.state = this.reducer(this.state, action);
        
        // Notify subscribers
        this.subscribers.forEach(callback => {
            callback(this.state, prevState, action);
        });
    }
    
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}

// Usage in component
class TodoComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.store = new Store(todoReducer, { todos: [], filter: 'all' });
        
        this.unsubscribe = this.store.subscribe(
            this.handleStoreChange.bind(this)
        );
    }
    
    handleStoreChange(newState, prevState, action) {
        this.setState({ storeState: newState });
    }
    
    addTodo(text) {
        this.store.dispatch({
            type: actions.ADD_TODO,
            payload: { text }
        });
    }
    
    toggleTodo(id) {
        this.store.dispatch({
            type: actions.TOGGLE_TODO,
            payload: { id }
        });
    }
}
```

### Observer Pattern

```javascript
class ObservableState {
    constructor(initialState = {}) {
        this.state = initialState;
        this.observers = new Map();
    }
    
    get(key) {
        return this.state[key];
    }
    
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        this.notifyObservers(key, value, oldValue);
    }
    
    observe(key, callback) {
        if (!this.observers.has(key)) {
            this.observers.set(key, new Set());
        }
        
        this.observers.get(key).add(callback);
        
        // Return unobserve function
        return () => {
            this.observers.get(key).delete(callback);
        };
    }
    
    notifyObservers(key, newValue, oldValue) {
        if (this.observers.has(key)) {
            this.observers.get(key).forEach(callback => {
                callback(newValue, oldValue, key);
            });
        }
    }
    
    batch(updates) {
        const changes = [];
        
        Object.entries(updates).forEach(([key, value]) => {
            const oldValue = this.state[key];
            this.state[key] = value;
            changes.push({ key, newValue: value, oldValue });
        });
        
        // Notify all observers after batch update
        changes.forEach(({ key, newValue, oldValue }) => {
            this.notifyObservers(key, newValue, oldValue);
        });
    }
}

// Usage
const globalState = new ObservableState({
    user: null,
    theme: 'light',
    isLoading: false
});

class ComponentWithObserver extends BaseComponent {
    async init() {
        await super.init();
        
        // Observe specific state changes
        this.unobserveUser = globalState.observe('user', (user) => {
            this.setState({ currentUser: user });
        });
        
        this.unobserveTheme = globalState.observe('theme', (theme) => {
            this.updateTheme(theme);
        });
    }
    
    async destroy() {
        this.unobserveUser();
        this.unobserveTheme();
        await super.destroy();
    }
}
```

## State Persistence

### Local Storage State

```javascript
class PersistentState {
    constructor(key, initialState = {}) {
        this.storageKey = key;
        this.state = this.loadState() || initialState;
        this.subscribers = new Set();
        
        // Auto-save on state change
        this.subscribe(() => {
            this.saveState();
        });
    }
    
    loadState() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
            return null;
        }
    }
    
    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save state to localStorage:', error);
        }
    }
    
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.subscribers.forEach(callback => {
            callback(this.state, prevState);
        });
    }
    
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    
    clear() {
        this.state = {};
        localStorage.removeItem(this.storageKey);
    }
}

// Usage
const userPreferences = new PersistentState('user-preferences', {
    theme: 'light',
    language: 'en',
    notifications: true
});
```

### Session State

```javascript
class SessionState {
    constructor(key, initialState = {}) {
        this.storageKey = key;
        this.state = this.loadState() || initialState;
        this.subscribers = new Set();
        
        // Auto-save on state change
        this.subscribe(() => {
            this.saveState();
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }
    
    loadState() {
        try {
            const stored = sessionStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('Failed to load session state:', error);
            return null;
        }
    }
    
    saveState() {
        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save session state:', error);
        }
    }
    
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.subscribers.forEach(callback => {
            callback(this.state, prevState);
        });
    }
    
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}
```

### IndexedDB State

```javascript
class IndexedDBState {
    constructor(dbName, storeName, version = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.db = null;
        this.state = {};
        this.subscribers = new Set();
        
        this.initDB();
    }
    
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.loadState().then(resolve);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }
    
    async loadState() {
        if (!this.db) return;
        
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(store);
        const request = store.getAll();
        
        return new Promise((resolve) => {
            request.onsuccess = () => {
                const items = request.result;
                this.state = items.reduce((acc, item) => {
                    acc[item.id] = item.data;
                    return acc;
                }, {});
                resolve(this.state);
            };
        });
    }
    
    async saveState(key, data) {
        if (!this.db) return;
        
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        await store.put({ id: key, data, timestamp: Date.now() });
    }
    
    async setState(key, value) {
        this.state[key] = value;
        await this.saveState(key, value);
        
        this.subscribers.forEach(callback => {
            callback(this.state, key, value);
        });
    }
    
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}
```

## Advanced Techniques

### State Machines

```javascript
class StateMachine {
    constructor(initialState, states, transitions) {
        this.currentState = initialState;
        this.states = states;
        this.transitions = transitions;
        this.subscribers = new Set();
    }
    
    canTransition(toState) {
        const allowedTransitions = this.transitions[this.currentState];
        return allowedTransitions && allowedTransitions.includes(toState);
    }
    
    transition(toState, data = {}) {
        if (!this.canTransition(toState)) {
            throw new Error(
                `Cannot transition from ${this.currentState} to ${toState}`
            );
        }
        
        const prevState = this.currentState;
        
        // Exit current state
        if (this.states[prevState]?.onExit) {
            this.states[prevState].onExit(data);
        }
        
        // Change state
        this.currentState = toState;
        
        // Enter new state
        if (this.states[toState]?.onEnter) {
            this.states[toState].onEnter(data);
        }
        
        // Notify subscribers
        this.subscribers.forEach(callback => {
            callback(toState, prevState, data);
        });
    }
    
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}

// Usage example: User authentication state
const authStates = {
    'logged-out': {
        onEnter: () => console.log('User logged out'),
        onExit: () => console.log('Leaving logged out state')
    },
    'logging-in': {
        onEnter: () => console.log('Attempting login'),
        onExit: () => console.log('Login attempt finished')
    },
    'logged-in': {
        onEnter: (user) => console.log('User logged in:', user),
        onExit: () => console.log('User logging out')
    },
    'error': {
        onEnter: (error) => console.log('Auth error:', error),
        onExit: () => console.log('Recovering from error')
    }
};

const authTransitions = {
    'logged-out': ['logging-in'],
    'logging-in': ['logged-in', 'error', 'logged-out'],
    'logged-in': ['logged-out'],
    'error': ['logging-in', 'logged-out']
};

const authStateMachine = new StateMachine(
    'logged-out',
    authStates,
    authTransitions
);

// Use in component
class AuthComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.authMachine = authStateMachine;
        
        this.unsubscribe = this.authMachine.subscribe(
            this.handleAuthStateChange.bind(this)
        );
    }
    
    handleAuthStateChange(newState, prevState, data) {
        this.setState({ authState: newState });
        
        // Update UI based on auth state
        if (newState === 'logged-in') {
            this.showUserDashboard(data);
        } else if (newState === 'error') {
            this.showErrorMessage(data);
        }
    }
    
    async login(credentials) {
        this.authMachine.transition('logging-in');
        
        try {
            const user = await authenticateUser(credentials);
            this.authMachine.transition('logged-in', user);
        } catch (error) {
            this.authMachine.transition('error', error);
        }
    }
}
```

### Time Travel Debugging

```javascript
class TimeTravel {
    constructor(initialState = {}) {
        this.history = [{ state: initialState, timestamp: Date.now() }];
        this.currentIndex = 0;
        this.maxHistory = 100;
    }
    
    pushState(newState) {
        // Remove future states if we're in the middle of history
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // Add new state
        this.history.push({
            state: { ...newState },
            timestamp: Date.now()
        });
        
        // Maintain history limit
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }
    
    canUndo() {
        return this.currentIndex > 0;
    }
    
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return this.getCurrentState();
        }
        return null;
    }
    
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return this.getCurrentState();
        }
        return null;
    }
    
    getCurrentState() {
        return { ...this.history[this.currentIndex].state };
    }
    
    getHistory() {
        return this.history.map((entry, index) => ({
            ...entry,
            isCurrent: index === this.currentIndex
        }));
    }
    
    jumpToState(index) {
        if (index >= 0 && index < this.history.length) {
            this.currentIndex = index;
            return this.getCurrentState();
        }
        return null;
    }
}
```

## Best Practices

### State Structure

1. **Keep State Flat** - Avoid deep nesting when possible
2. **Normalize Data** - Use normalized structures for complex data
3. **Separate Concerns** - Keep UI state separate from domain data

```javascript
// Good: Flat structure
const state = {
    users: { 1: { id: 1, name: 'John' }, 2: { id: 2, name: 'Jane' } },
    userIds: [1, 2],
    selectedUserId: 1,
    isLoading: false,
    error: null
};

// Avoid: Deep nesting
const state = {
    data: {
        users: {
            list: [
                { id: 1, name: 'John', profile: { avatar: '...', settings: { ... } } }
            ],
            selected: { ... },
            meta: { loading: false, error: null }
        }
    }
};
```

### State Updates

1. **Immutable Updates** - Always create new objects
2. **Batch Updates** - Minimize re-renders with batched updates
3. **Validate State** - Validate state changes when necessary

```javascript
// Good: Immutable update
this.setState({
    users: {
        ...this.state.users,
        [userId]: { ...this.state.users[userId], name: newName }
    }
});

// Good: Batch updates
this.setState({
    loading: false,
    data: responseData,
    error: null,
    lastUpdated: new Date()
});
```

### Performance

1. **Shallow Comparisons** - Use shallow comparison for change detection
2. **Memoization** - Cache expensive computations
3. **Lazy Loading** - Load state data only when needed

```javascript
class OptimizedComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.memoizedComputations = new Map();
    }
    
    getExpensiveComputation(key, data) {
        if (!this.memoizedComputations.has(key) || 
            this.hasDataChanged(key, data)) {
            
            const result = this.performExpensiveComputation(data);
            this.memoizedComputations.set(key, {
                result,
                data: { ...data },
                timestamp: Date.now()
            });
        }
        
        return this.memoizedComputations.get(key).result;
    }
    
    hasDataChanged(key, newData) {
        const cached = this.memoizedComputations.get(key);
        if (!cached) return true;
        
        return JSON.stringify(cached.data) !== JSON.stringify(newData);
    }
}
```

---

VanillaForge's state management system provides the flexibility to handle simple local state as well as complex application-wide state with predictable updates and efficient rendering.
