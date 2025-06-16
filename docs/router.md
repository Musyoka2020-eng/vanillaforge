# 🛣️ Router System

Complete guide to VanillaForge's client-side routing system.

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Route Configuration](#route-configuration)
- [Navigation](#navigation)
- [Route Parameters](#route-parameters)
- [Route Guards](#route-guards)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## Overview

VanillaForge's router provides client-side navigation for Single Page Applications (SPAs). It uses the HTML5 History API to manage navigation without full page reloads.

### Key Features

- **History API Support** - Uses `pushState` and `popState` for clean URLs
- **Route Parameters** - Dynamic route segments (e.g., `/users/:id`)
- **Route Guards** - Before and after navigation hooks
- **Fallback Routes** - Handle 404 and error cases
- **Hash Mode** - Fallback for older browsers
- **Programmatic Navigation** - Navigate via JavaScript

## Basic Usage

### Setting Up Routes

```javascript
import { createApp } from './src/framework.js';
import { HomeComponent, AboutComponent, ContactComponent } from './components/index.js';

const app = createApp({
    router: {
        mode: 'history',    // 'history' or 'hash'
        fallback: '/404'    // Fallback route for unmatched paths
    }
});

await app.initialize({
    routes: {
        '/': HomeComponent,
        '/about': AboutComponent,
        '/contact': ContactComponent,
        '/404': NotFoundComponent
    }
});

await app.start();
```

### Hash Mode (for older browsers)

```javascript
const app = createApp({
    router: {
        mode: 'hash',
        fallback: '#/404'
    }
});

// URLs will be: http://example.com/#/about
```

## Route Configuration

### Simple Routes

```javascript
const routes = {
    '/': HomeComponent,
    '/about': AboutComponent,
    '/contact': ContactComponent
};
```

### Advanced Route Configuration

```javascript
const routes = {
    '/': {
        component: HomeComponent,
        name: 'home',
        meta: { title: 'Home Page' }
    },
    '/users': {
        component: UserListComponent,
        name: 'users',
        meta: { 
            title: 'Users',
            requiresAuth: true 
        }
    },
    '/users/:id': {
        component: UserDetailComponent,
        name: 'user-detail',
        meta: { 
            title: 'User Details',
            requiresAuth: true 
        }
    },
    '/admin/*': {
        component: AdminComponent,
        name: 'admin',
        meta: { 
            title: 'Admin Panel',
            requiresAuth: true,
            requiresRole: 'admin'
        }
    }
};
```

### Route Patterns

#### Static Routes
```javascript
'/about' → matches exactly '/about'
'/contact' → matches exactly '/contact'
```

#### Dynamic Routes
```javascript
'/users/:id' → matches '/users/123', '/users/abc'
'/posts/:slug' → matches '/posts/my-first-post'
```

#### Wildcard Routes
```javascript
'/admin/*' → matches '/admin/users', '/admin/settings', etc.
'/docs/*' → matches any path starting with '/docs/'
```

## Navigation

### Programmatic Navigation

```javascript
const router = app.get('router');

// Navigate to a route
await router.navigate('/users/123');

// Navigate with options
await router.navigate('/about', {
    replace: true,  // Replace current history entry
    state: { data: 'custom data' }
});

// Using the app instance
app.navigate('/contact');
```

### Link Navigation

```javascript
// In component templates
getTemplate() {
    return `
        <nav>
            <a href="/" data-navigate>Home</a>
            <a href="/about" data-navigate>About</a>
            <a href="/contact" data-navigate>Contact</a>
        </nav>
    `;
}
```

### Programmatic Navigation from Components

```javascript
class MyComponent extends BaseComponent {
    handleButtonClick() {
        // Navigate using event bus
        this.eventBus.emit('router:navigate', '/users/123');
        
        // Or use the router directly
        const router = this.eventBus.router;
        router.navigate('/dashboard');
    }
    
    goBack() {
        window.history.back();
    }
    
    goForward() {
        window.history.forward();
    }
}
```

## Route Parameters

### Accessing Parameters

```javascript
class UserDetailComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'user-detail';
        
        // Props contain route parameters
        this.userId = props.id; // From route '/users/:id'
        this.state = { user: null, loading: true };
    }
    
    async init() {
        await super.init();
        await this.loadUser();
    }
    
    async loadUser() {
        try {
            const user = await fetchUser(this.userId);
            this.setState({ user, loading: false });
        } catch (error) {
            this.setState({ loading: false, error: error.message });
        }
    }
    
    getTemplate() {
        const { user, loading, error } = this.state;
        
        if (loading) return '<div class="loading">Loading user...</div>';
        if (error) return `<div class="error">Error: ${error}</div>`;
        if (!user) return '<div class="error">User not found</div>';
        
        return `
            <div class="user-detail">
                <h1>${user.name}</h1>
                <p>Email: ${user.email}</p>
                <p>ID: ${this.userId}</p>
            </div>
        `;
    }
}
```

### Multiple Parameters

```javascript
// Route: '/posts/:category/:slug'
// URL: '/posts/tech/my-first-post'

class PostComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.category = props.category; // 'tech'
        this.slug = props.slug;         // 'my-first-post'
    }
}
```

### Query Parameters

```javascript
// URL: '/search?q=javascript&page=2'

class SearchComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        
        // Parse query parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.query = urlParams.get('q') || '';
        this.page = parseInt(urlParams.get('page')) || 1;
    }
    
    updateSearch(newQuery, newPage = 1) {
        const url = `/search?q=${encodeURIComponent(newQuery)}&page=${newPage}`;
        this.eventBus.emit('router:navigate', url);
    }
}
```

## Route Guards

Route guards allow you to control navigation flow and implement authentication.

### Before Navigation

```javascript
const router = app.get('router');

// Add global before navigation guard
router.beforeNavigation(async (route, path) => {
    console.log(`Navigating to: ${path}`);
    
    // Check authentication
    if (route.meta?.requiresAuth && !isAuthenticated()) {
        await router.navigate('/login');
        return false; // Cancel navigation
    }
    
    // Check user role
    if (route.meta?.requiresRole && !hasRole(route.meta.requiresRole)) {
        await router.navigate('/unauthorized');
        return false;
    }
    
    return true; // Allow navigation
});
```

### After Navigation

```javascript
router.afterNavigation((route, path) => {
    // Update page title
    if (route.meta?.title) {
        document.title = `${route.meta.title} - My App`;
    }
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_path: path
        });
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
});
```

### Component-Level Guards

```javascript
class ProtectedComponent extends BaseComponent {
    async init() {
        // Check access before initializing
        if (!this.hasAccess()) {
            this.eventBus.emit('router:navigate', '/unauthorized');
            return;
        }
        
        await super.init();
    }
    
    hasAccess() {
        return currentUser.role === 'admin';
    }
}
```

## Advanced Features

### Nested Routing

```javascript
class AdminComponent extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'admin';
        this.subRouter = new Router(eventBus);
    }
    
    async init() {
        await super.init();
        
        // Set up sub-routes
        this.subRouter.addRoute('/users', AdminUsersComponent);
        this.subRouter.addRoute('/settings', AdminSettingsComponent);
        this.subRouter.addRoute('/reports', AdminReportsComponent);
        
        await this.subRouter.init();
    }
    
    getTemplate() {
        return `
            <div class="admin">
                <nav class="admin-nav">
                    <a href="/admin/users" data-navigate>Users</a>
                    <a href="/admin/settings" data-navigate>Settings</a>
                    <a href="/admin/reports" data-navigate>Reports</a>
                </nav>
                <div id="admin-content"></div>
            </div>
        `;
    }
}
```

### Route Transitions

```javascript
class TransitionRouter extends Router {
    async loadRouteComponent(route) {
        // Add fade out effect
        const currentComponent = document.getElementById('main-content');
        if (currentComponent) {
            currentComponent.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Load new component
        await super.loadRouteComponent(route);
        
        // Add fade in effect
        const newComponent = document.getElementById('main-content');
        if (newComponent) {
            newComponent.style.opacity = '0';
            requestAnimationFrame(() => {
                newComponent.style.transition = 'opacity 300ms';
                newComponent.style.opacity = '1';
            });
        }
    }
}
```

### Route Data Loading

```javascript
class DataRoute {
    static async resolve(route, params) {
        // Pre-load data for the route
        const data = await Promise.all([
            fetchUser(params.id),
            fetchUserPosts(params.id),
            fetchUserStats(params.id)
        ]);
        
        return {
            user: data[0],
            posts: data[1],
            stats: data[2]
        };
    }
}

// In router configuration
const routes = {
    '/users/:id': {
        component: UserDetailComponent,
        resolve: DataRoute.resolve
    }
};
```

### Dynamic Route Registration

```javascript
class DynamicRouter {
    constructor(eventBus) {
        this.router = new Router(eventBus);
        this.dynamicRoutes = new Map();
    }
    
    addDynamicRoute(pattern, componentFactory) {
        this.dynamicRoutes.set(pattern, componentFactory);
    }
    
    async loadComponent(path) {
        // Check dynamic routes first
        for (const [pattern, factory] of this.dynamicRoutes) {
            if (this.matchPattern(path, pattern)) {
                const component = await factory(path);
                return component;
            }
        }
        
        // Fall back to static routes
        return this.router.loadComponent(path);
    }
}
```

## Best Practices

### Route Organization

1. **Group Related Routes** - Keep related routes together
2. **Use Descriptive Names** - Route names should be clear and consistent
3. **Consistent Patterns** - Use consistent parameter naming across routes

```javascript
const routes = {
    // User management
    '/users': UserListComponent,
    '/users/:id': UserDetailComponent,
    '/users/:id/edit': UserEditComponent,
    
    // Product management
    '/products': ProductListComponent,
    '/products/:id': ProductDetailComponent,
    '/products/:id/edit': ProductEditComponent,
    
    // Admin routes
    '/admin/users': AdminUserListComponent,
    '/admin/products': AdminProductListComponent
};
```

### Performance

1. **Lazy Load Components** - Load components only when needed
2. **Preload Critical Routes** - Preload important routes in background
3. **Cache Component Instances** - Reuse component instances when possible

```javascript
class LazyRouter {
    constructor() {
        this.componentCache = new Map();
    }
    
    async loadComponent(name) {
        if (this.componentCache.has(name)) {
            return this.componentCache.get(name);
        }
        
        const component = await import(`./components/${name}.js`);
        this.componentCache.set(name, component);
        return component;
    }
}
```

### Error Handling

1. **Handle Missing Routes** - Always provide a 404 component
2. **Handle Load Errors** - Gracefully handle component loading failures
3. **Validate Parameters** - Validate route parameters before use

```javascript
router.beforeNavigation(async (route, path) => {
    try {
        // Validate route exists
        if (!route) {
            await router.navigate('/404');
            return false;
        }
        
        // Validate parameters
        if (route.path.includes(':id') && !isValidId(route.params.id)) {
            await router.navigate('/404');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Navigation error:', error);
        await router.navigate('/error');
        return false;
    }
});
```

### SEO Considerations

1. **Set Page Titles** - Update document title for each route
2. **Meta Tags** - Update meta description and other tags
3. **Canonical URLs** - Set canonical URLs for routes

```javascript
router.afterNavigation((route, path) => {
    // Update title
    document.title = route.meta?.title || 'My App';
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && route.meta?.description) {
        metaDesc.content = route.meta.description;
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = window.location.href;
    }
});
```

---

The VanillaForge router provides powerful, flexible routing capabilities while maintaining simplicity and performance.
