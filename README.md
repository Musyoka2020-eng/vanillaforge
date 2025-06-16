# 🔥 VanillaForge

**Forge modern Single Page Applications with vanilla JavaScript**

A lightweight, powerful framework that gives you all the tools to build sophisticated SPAs without the complexity of large frameworks or external dependencies.

## ✨ Features

- 🏗️ **Component-Based Architecture** - Modular, reusable UI components
- 🛣️ **Client-Side Routing** - Full SPA routing with history API
- 📡 **Event-Driven Communication** - Centralized event bus system
- 🎯 **State Management** - Built-in state management capabilities
- 🐛 **Error Handling** - Comprehensive error handling and logging
- 📱 **Modern Web APIs** - Uses latest browser features
- 🔧 **Zero Dependencies** - No external libraries required
- ⚡ **Lightweight** - < 50KB minified
- 🌐 **ES Modules** - Modern module system

## 🏁 Quick Start

### Installation

```bash
# Clone VanillaForge
git clone https://github.com/Musyoka2020-eng/vanillaforge.git
cd vanillaforge

# Install dev dependencies
npm install

# Start development server
npm run dev
```

The framework will be available at http://localhost:3000

### Running Examples

```bash
# Run the todo app example
cd examples/todo-app
npm run dev
# Opens at http://localhost:3001
```

### Basic Usage

```javascript
import { createApp, BaseComponent } from './src/framework.js';

// Create a simple component
class HomeComponent extends BaseComponent {
    constructor(props = {}) {
        super(props);
        this.name = 'home-component';
    }
    
    render() {
        return `
            <div class="home">
                <h1>Welcome to VanillaForge! 🔥</h1>
                <p>Forge amazing SPAs with vanilla JavaScript.</p>
            </div>
        `;
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
        '/about': AboutComponent,
        '/contact': ContactComponent
    },
    components: {
        'home-component': HomeComponent
    }
});

// Start the application
await app.start();
```

## 📚 Core Concepts

### Components

Components are the building blocks of your application. Extend `BaseComponent` to create reusable UI elements:

```javascript
import { BaseComponent } from './src/framework.js';

class MyComponent extends BaseComponent {
    constructor(props = {}) {
        super(props);
        this.name = 'my-component';
        this.state = {
            count: 0
        };
    }
    
    render() {
        return `
            <div class="my-component">
                <h2>Count: ${this.state.count}</h2>
                <button data-action="increment">+</button>
                <button data-action="decrement">-</button>
            </div>
        `;
    }
    
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'increment') {
                this.setState({ count: this.state.count + 1 });
            } else if (e.target.dataset.action === 'decrement') {
                this.setState({ count: this.state.count - 1 });
            }
        });
    }
}
```

### Routing

The router handles client-side navigation:

```javascript
// Add routes during initialization
await app.initialize({
    routes: {
        '/': HomeComponent,
        '/users/:id': UserComponent,
        '/products': ProductListComponent,
        '/products/:id': ProductDetailComponent,
        '/404': NotFoundComponent
    }
});

// Navigate programmatically
app.navigate('/users/123');
app.navigate('/products', { replace: true });
```

### Event Bus

Communicate between components using the event bus:

```javascript
// Emit events
app.get('eventBus').emit('user:login', { userId: 123 });

// Listen for events
app.get('eventBus').on('user:login', (data) => {
    console.log('User logged in:', data.userId);
});

// Remove listeners
app.get('eventBus').off('user:login', handler);
```

### State Management

Manage application state with built-in state management:

```javascript
class MyComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: false
        };
    }
    
    async loadUsers() {
        this.setState({ loading: true });
        
        try {
            const users = await fetchUsers();
            this.setState({ users, loading: false });
        } catch (error) {
            this.setState({ loading: false });
            this.handleError(error);
        }
    }
    
    render() {
        if (this.state.loading) {
            return '<div class="loading">Loading...</div>';
        }
        
        return `
            <div class="users">
                ${this.state.users.map(user => `
                    <div class="user">${user.name}</div>
                `).join('')}
            </div>
        `;
    }
}
```

## 🛠️ Build System

The framework includes a build system for production deployment:

```bash
# Build for production
npm run build

# Serve built files
npm run serve

# Development with auto-rebuild
npm run dev
```

## 📁 Project Structure

```
vanilla-js-spa-framework/
├── src/
│   ├── core/                  # Framework core
│   │   ├── component-manager.js
│   │   ├── event-bus.js
│   │   └── router.js
│   ├── components/            # Base components
│   │   └── base-component.js
│   ├── utils/                 # Utilities
│   │   ├── logger.js
│   │   ├── error-handler.js
│   │   ├── validation.js
│   │   └── sweet-alert.js
│   ├── styles/                # Base styles
│   │   ├── main.css
│   │   └── components.css
│   └── framework.js           # Main entry point
├── scripts/
│   └── build.js              # Build script
├── examples/                 # Example applications
├── package.json
└── README.md
```

## 🎯 Examples

### Todo App Example

```javascript
import { createApp, BaseComponent } from './src/framework.js';

class TodoApp extends BaseComponent {
    constructor(props) {
        super(props);
        this.name = 'todo-app';
        this.state = {
            todos: [],
            input: ''
        };
    }
    
    render() {
        return `
            <div class="todo-app">
                <h1>Todo App</h1>
                <input type="text" 
                       placeholder="Add a todo..." 
                       data-input="todo">
                <button data-action="add">Add</button>
                <ul class="todo-list">
                    ${this.state.todos.map((todo, index) => `
                        <li class="todo-item ${todo.completed ? 'completed' : ''}">
                            <span>${todo.text}</span>
                            <button data-action="toggle" data-index="${index}">
                                ${todo.completed ? 'Undo' : 'Done'}
                            </button>
                            <button data-action="delete" data-index="${index}">
                                Delete
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const index = parseInt(e.target.dataset.index);
            
            switch (action) {
                case 'add':
                    this.addTodo();
                    break;
                case 'toggle':
                    this.toggleTodo(index);
                    break;
                case 'delete':
                    this.deleteTodo(index);
                    break;
            }
        });
        
        this.container.addEventListener('input', (e) => {
            if (e.target.dataset.input === 'todo') {
                this.state.input = e.target.value;
            }
        });
    }
    
    addTodo() {
        if (this.state.input.trim()) {
            const newTodos = [...this.state.todos, {
                text: this.state.input.trim(),
                completed: false
            }];
            this.setState({ todos: newTodos, input: '' });
        }
    }
    
    toggleTodo(index) {
        const newTodos = [...this.state.todos];
        newTodos[index].completed = !newTodos[index].completed;
        this.setState({ todos: newTodos });
    }
    
    deleteTodo(index) {
        const newTodos = this.state.todos.filter((_, i) => i !== index);
        this.setState({ todos: newTodos });
    }
}

// Initialize the app
const app = createApp({ debug: true });
await app.initialize({
    routes: { '/': TodoApp },
    components: { 'todo-app': TodoApp }
});
await app.start();
```

## 🚀 Deployment

### GitHub Pages

```bash
npm run deploy
```

### Static Hosting

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Why VanillaForge?

- **🔥 No Dependencies**: Zero external dependencies means no security vulnerabilities or update headaches
- **⚡ Modern JavaScript**: Uses ES2020+ features for clean, efficient code
- **📚 Educational**: Perfect for learning how frameworks work under the hood
- **🪶 Lightweight**: Perfect for projects where bundle size matters
- **🔧 Flexible**: Easy to extend and customize for your needs
- **🏗️ Production Ready**: Includes error handling, logging, and build system
- **🚀 Fast Development**: Intuitive API that gets out of your way

## 📖 Documentation

- [Component API Reference](docs/components.md)
- [Router Documentation](docs/router.md)
- [Event Bus Guide](docs/event-bus.md)
- [State Management](docs/state-management.md)
- [Build System](docs/build-system.md)

## �‍💻 Author

**Stephen Musyoka**  
Creator of VanillaForge Framework

*"Forging the future of vanilla JavaScript development, one component at a time."*

## �🔗 Links

- [GitHub Repository](https://github.com/Musyoka2020-eng/vanillaforge)
- [Examples](./examples/)
- [Issue Tracker](https://github.com/Musyoka2020-eng/vanillaforge/issues)

---

**Happy forging with VanillaForge! 🔥**
