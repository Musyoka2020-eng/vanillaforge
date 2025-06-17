# 🏗️ Build System

*Development and deployment*

## What is the Build System?

VanillaForge uses a simple build system to help you develop and deploy your applications. During development, it provides a local server with live reloading so you can see changes instantly. For production, it optimizes your code for better performance and smaller file sizes.

The build system handles:
- **Development server** - Local server with live reloading for rapid development
- **Production builds** - Optimized, minified code for deployment
- **Asset management** - Handles CSS, images, and other static files

## Development Commands

Start the development server to build and test your app locally:

```bash
# Start development server with live reloading
npm run dev

# Build optimized version for production
npm run build

# Run tests (when implemented)
npm test
```

## Project Structure

VanillaForge follows a simple, organized structure that separates framework code from your application code. Here's how the framework itself is organized:

```
vanillaforge/
├── src/
│   ├── framework.js       # Main framework file
│   ├── components/        # Framework components
│   ├── core/             # Core modules
│   └── utils/            # Utilities
├── examples/             # Example applications
├── docs/                # Documentation
└── dist/                # Built files
```

## Building Your App

When creating your own VanillaForge application, you'll organize your files separately from the framework. Here's a typical app structure and how to set it up:

```javascript
// Your app structure
my-app/
├── index.html
├── app.js               # Your main app file
├── components/          # Your components
│   ├── home.js
│   └── about.js
└── styles/
    └── main.css

// index.html
<!DOCTYPE html>
<html>
<head>
    <title>My VanillaForge App</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="app.js"></script>
</body>
</html>

// app.js
import { createApp } from './vanillaforge/src/framework.js';
import HomeComponent from './components/home.js';
import AboutComponent from './components/about.js';

const app = createApp({ appName: 'My App' });
await app.initialize({
    routes: {
        '/': HomeComponent,
        '/about': AboutComponent
    }
});
await app.start();
```

## Deployment

VanillaForge applications are built as static files (HTML, CSS, JavaScript) with no server-side requirements. This means you can deploy them to any web hosting service that serves static content:

- **Netlify**: Drag and drop your folder
- **Vercel**: Connect your GitHub repo
- **GitHub Pages**: Push to gh-pages branch
- **Any web server**: Upload files to public folder

## Production Optimizations

For production deployments, you'll want to optimize your code for better performance:

```javascript
// Use production build
const app = createApp({
    appName: 'My App',
    debug: false,  // Disable debug mode in production
    optimized: true
});
```

---

*VanillaForge apps are just static files - easy to deploy anywhere!*
