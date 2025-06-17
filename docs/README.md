# 📚 VanillaForge Documentation

*Simple, zero-dependency JavaScript framework for building SPAs*

## 📖 Quick Navigation

- [📚 API Reference](API.md) - Complete API guide with examples
- [🧩 Components](components.md) - How to build components
- [🗺️ Routing](router.md) - URL routing and navigation
- [📡 Events](event-bus.md) - Component communication
- [🏗️ Build System](build-system.md) - Development and deployment

## 🚀 Quick Start

```javascript
// 1. Create a component
class HomeComponent extends BaseComponent {
    render() {
        return '<h1>Hello VanillaForge!</h1>';
    }
}

// 2. Create and start your app
const app = createApp({ appName: 'My App' });
await app.initialize({ routes: { '/': HomeComponent } });
await app.start();
```

## ✨ Key Features

- **Zero dependencies** - No external libraries
- **Small bundle** - <50KB total
- **Component-based** - Reusable UI components  
- **Client routing** - SPA navigation
- **Event system** - Component communication
- **Modern JavaScript** - ES2020+ features

## 🌍 Browser Support

Modern browsers (Chrome 80+, Firefox 72+, Safari 14+, Edge 80+)

---

*For detailed examples and API reference, see the individual documentation files above.*
