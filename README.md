# 🔥 VanillaForge

**A modern, zero-dependency JavaScript framework for building sophisticated Single Page Applications**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ES Modules](https://img.shields.io/badge/ES-Modules-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Framework](https://img.shields.io/badge/Framework-Vanilla%20JS-orange.svg)](https://vanillajs.org/)

VanillaForge gives you all the power of modern frameworks—components, routing, state management, and more—built entirely with vanilla JavaScript. No dependencies, no build complexity, just pure web standards.

## ✨ Why VanillaForge?

- 🚀 **Zero Dependencies** - No npm hell, security vulnerabilities, or breaking changes
- ⚡ **Lightweight** - < 50KB total, loads instantly
- 🏗️ **Component-Based** - Modular, reusable UI components
- 🛣️ **Full Routing** - SPA routing with history API
- 📡 **Event System** - Centralized communication
- 🔧 **Modern JS** - ES2020+, Web APIs, ES Modules

## 🚀 Quick Start

```bash
# Get VanillaForge
git clone https://github.com/Musyoka2020-eng/vanillaforge.git
cd vanillaforge

# Start building
npm run dev
```

**Your first component:**

```javascript
import { createApp, BaseComponent } from './src/framework.js';

class HelloWorld extends BaseComponent {
    constructor(eventBus, props = {}) {
        super(eventBus, props);
        this.name = 'hello-world';
    }
    
    getTemplate() {
        return `
            <div class="hello">
                <h1>Hello, VanillaForge! 🔥</h1>
                <p>Building SPAs the vanilla way.</p>
            </div>
        `;
    }
}

// Create app and go!
const app = createApp({ debug: true });
await app.initialize({
    routes: { '/': HelloWorld }
});
await app.start();
```

## 📚 Learn More

**Ready to dive deeper?** Check out our comprehensive documentation:

- 📖 **[Full Documentation](docs/README.md)** - Complete guide and tutorials
- 🧩 **[Components Guide](docs/components.md)** - Build reusable UI components  
- 🛣️ **[Routing System](docs/router.md)** - SPA navigation and routing
- 📡 **[Event Bus](docs/event-bus.md)** - Component communication
- 🎯 **[State Management](docs/state-management.md)** - Manage application state
- 🔧 **[API Reference](docs/API.md)** - Complete API documentation
- 🏗️ **[Build System](docs/build-system.md)** - Production builds

**Examples:**
- 📝 **[Todo App](examples/todo-app/)** - Complete working example

## 🛠️ Browser Support

**Modern browsers with ES2020+ support:**
- Chrome 80+ | Firefox 72+ | Safari 14+ | Edge 80+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/README.md#contributing) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Support VanillaForge

- ⭐ **Star this repo** on GitHub
- 🐛 **Report issues** and suggest features
- 📖 **Improve docs** and add examples  
- 💬 **Share your projects** built with VanillaForge

---

## 👨‍💻 Author

**Stephen Musyoka** - *Creator of VanillaForge*

*"Forging the future of vanilla JavaScript development, one component at a time."*

🔗 **Links:**
- [GitHub Repository](https://github.com/Musyoka2020-eng/vanillaforge)
- [Issue Tracker](https://github.com/Musyoka2020-eng/vanillaforge/issues)
- [Full Documentation](docs/README.md)

---

**Ready to forge something amazing? 🔥**
