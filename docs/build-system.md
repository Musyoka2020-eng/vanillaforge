# 🏗️ Build System

Complete guide to VanillaForge's build system and deployment process.

## Table of Contents

- [Overview](#overview)
- [Build Configuration](#build-configuration)
- [Development Workflow](#development-workflow)
- [Production Build](#production-build)
- [Asset Management](#asset-management)
- [Optimization](#optimization)
- [Deployment](#deployment)
- [Advanced Configuration](#advanced-configuration)

## Overview

VanillaForge includes a comprehensive build system that handles development, testing, and production deployment. The build system is designed to be simple yet powerful, providing all the tools needed for modern web development.

### Key Features

- **ES Module Support** - Native ES module handling
- **Asset Processing** - CSS, JavaScript, and static asset processing
- **Development Server** - Hot reload and live development
- **Production Optimization** - Minification, bundling, and optimization
- **Static Site Generation** - Pre-render pages for better SEO
- **PWA Support** - Service worker and manifest generation

## Build Configuration

### Package.json Scripts

```json
{
  "name": "vanillaforge-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "node scripts/dev-server.js",
    "build": "node scripts/build.js",
    "serve": "node scripts/serve.js",
    "test": "node scripts/test.js",
    "lint": "eslint src/ --ext .js",
    "clean": "rimraf dist/",
    "deploy": "npm run build && npm run deploy:static"
  },
  "devDependencies": {
    "http-server": "^14.1.1",
    "chokidar": "^3.5.3",
    "terser": "^5.16.1",
    "postcss": "^8.4.21",
    "autoprefixer": "^10.4.13",
    "cssnano": "^5.1.15"
  }
}
```

### Build Configuration File

```javascript
// build.config.js
export default {
  // Source directory
  srcDir: 'src',
  
  // Output directory
  outDir: 'dist',
  
  // Public assets directory
  publicDir: 'public',
  
  // Entry points
  entry: {
    main: 'src/framework.js',
    app: 'index.html'
  },
  
  // Development server configuration
  devServer: {
    port: 3000,
    host: 'localhost',
    open: true,
    cors: true,
    historyApiFallback: true
  },
  
  // Build options
  build: {
    minify: true,
    sourcemap: true,
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  
  // Asset processing
  assets: {
    // Images
    images: {
      formats: ['webp', 'avif'],
      quality: 80,
      sizes: [320, 640, 1280, 1920]
    },
    
    // CSS
    css: {
      autoprefixer: true,
      minify: true,
      purge: true
    },
    
    // JavaScript
    js: {
      minify: true,
      target: 'es2020',
      treeshake: true
    }
  },
  
  // PWA configuration
  pwa: {
    enabled: true,
    manifest: {
      name: 'VanillaForge App',
      short_name: 'VFApp',
      theme_color: '#2563eb',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      strategies: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        }
      ]
    }
  }
};
```

## Development Workflow

### Development Server

```javascript
// scripts/dev-server.js
import { createServer } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';

class DevServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.host = options.host || 'localhost';
    this.root = options.root || process.cwd();
    this.clients = new Set();
    
    this.setupServer();
    this.setupWebSocket();
    this.setupFileWatcher();
  }
  
  setupServer() {
    this.server = createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  }
  
  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = path.join(this.root, url.pathname);
    
    // Handle SPA routing
    if (url.pathname !== '/' && !path.extname(url.pathname)) {
      filePath = path.join(this.root, 'index.html');
    }
    
    // Default to index.html for root
    if (url.pathname === '/') {
      filePath = path.join(this.root, 'index.html');
    }
    
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      const contentType = this.getContentType(ext);
      
      // Inject live reload script for HTML files
      if (ext === '.html') {
        const modifiedContent = this.injectLiveReload(content.toString());
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(modifiedContent);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        throw error;
      }
    }
  }
  
  setupWebSocket() {
    this.wss = new WebSocketServer({ port: this.port + 1 });
    
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('Client connected for live reload');
      
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }
  
  setupFileWatcher() {
    const watcher = chokidar.watch([
      'src/**/*',
      'index.html',
      'public/**/*'
    ], {
      ignored: /node_modules/,
      persistent: true
    });
    
    watcher.on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      this.notifyClients('reload', { file: filePath });
    });
    
    watcher.on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      this.notifyClients('reload', { file: filePath });
    });
  }
  
  notifyClients(type, data) {
    const message = JSON.stringify({ type, data });
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }
  
  injectLiveReload(html) {
    const liveReloadScript = `
      <script>
        (function() {
          const ws = new WebSocket('ws://localhost:${this.port + 1}');
          
          ws.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'reload') {
              console.log('File changed, reloading...');
              window.location.reload();
            }
          };
          
          ws.onclose = function() {
            console.log('Live reload disconnected');
          };
        })();
      </script>
    `;
    
    return html.replace('</body>', `${liveReloadScript}\n</body>`);
  }
  
  getContentType(ext) {
    const types = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    return types[ext] || 'text/plain';
  }
  
  start() {
    this.server.listen(this.port, this.host, () => {
      console.log(`🚀 Dev server running at http://${this.host}:${this.port}`);
    });
  }
}

// Start development server
const devServer = new DevServer({
  port: 3000,
  host: 'localhost',
  root: process.cwd()
});

devServer.start();
```

### Hot Module Replacement

```javascript
// scripts/hmr.js
class HMRClient {
  constructor() {
    this.modules = new Map();
    this.acceptedDependencies = new Map();
    
    this.setupWebSocket();
  }
  
  setupWebSocket() {
    const ws = new WebSocket(`ws://localhost:${window.location.port + 1}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'update':
        this.handleUpdate(message.data);
        break;
      case 'reload':
        this.handleReload();
        break;
    }
  }
  
  async handleUpdate(updateData) {
    const { file, dependencies } = updateData;
    
    // Check if any loaded modules need to be updated
    for (const [moduleId, module] of this.modules) {
      if (dependencies.includes(moduleId)) {
        await this.updateModule(moduleId, module);
      }
    }
  }
  
  async updateModule(moduleId, module) {
    try {
      // Re-import the module
      const newModule = await import(`${moduleId}?t=${Date.now()}`);
      
      // Update components if they support HMR
      if (newModule.default && newModule.default.__hmr) {
        newModule.default.__hmr.updateComponent(module);
      }
      
      this.modules.set(moduleId, newModule);
    } catch (error) {
      console.error(`Failed to hot reload ${moduleId}:`, error);
      this.handleReload();
    }
  }
  
  handleReload() {
    window.location.reload();
  }
  
  accept(dependencies, callback) {
    if (typeof dependencies === 'string') {
      dependencies = [dependencies];
    }
    
    dependencies.forEach(dep => {
      this.acceptedDependencies.set(dep, callback);
    });
  }
}

// Global HMR client
window.__hmr = new HMRClient();
```

## Production Build

### Build Script

```javascript
// scripts/build.js
import { promises as fs } from 'fs';
import path from 'path';
import { minify } from 'terser';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

class Builder {
  constructor(config = {}) {
    this.config = {
      srcDir: 'src',
      outDir: 'dist',
      publicDir: 'public',
      minify: true,
      sourcemap: true,
      ...config
    };
  }
  
  async build() {
    console.log('🏗️  Building for production...');
    
    await this.cleanOutput();
    await this.copyPublicAssets();
    await this.processHTML();
    await this.processCSS();
    await this.processJavaScript();
    await this.generateManifest();
    await this.generateServiceWorker();
    
    console.log('✅ Build complete!');
  }
  
  async cleanOutput() {
    try {
      await fs.rm(this.config.outDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
    
    await fs.mkdir(this.config.outDir, { recursive: true });
  }
  
  async copyPublicAssets() {
    try {
      const publicDir = this.config.publicDir;
      const outDir = this.config.outDir;
      
      const files = await this.getFiles(publicDir);
      
      for (const file of files) {
        const relativePath = path.relative(publicDir, file);
        const outputPath = path.join(outDir, relativePath);
        
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.copyFile(file, outputPath);
      }
    } catch (error) {
      console.warn('Public directory not found, skipping...');
    }
  }
  
  async processHTML() {
    const htmlFiles = await this.getFiles('.', '.html');
    
    for (const htmlFile of htmlFiles) {
      const content = await fs.readFile(htmlFile, 'utf-8');
      const processedContent = await this.processHTMLContent(content);
      
      const outputPath = path.join(
        this.config.outDir,
        path.relative('.', htmlFile)
      );
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, processedContent);
    }
  }
  
  async processHTMLContent(content) {
    // Minify HTML
    if (this.config.minify) {
      content = content
        .replace(/\\s+/g, ' ')
        .replace(/<!--[\\s\\S]*?-->/g, '')
        .trim();
    }
    
    // Update asset paths for production
    content = content.replace(
      /src\\/(.*?\\.js)/g,
      (match, path) => `js/${path.split('/').pop()}`
    );
    
    content = content.replace(
      /src\\/(.*?\\.css)/g,
      (match, path) => `css/${path.split('/').pop()}`
    );
    
    return content;
  }
  
  async processCSS() {
    const cssFiles = await this.getFiles(this.config.srcDir, '.css');
    
    for (const cssFile of cssFiles) {
      const content = await fs.readFile(cssFile, 'utf-8');
      const processedContent = await this.processCSSContent(content);
      
      const fileName = path.basename(cssFile);
      const outputPath = path.join(this.config.outDir, 'css', fileName);
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, processedContent);
    }
  }
  
  async processCSSContent(content) {
    const plugins = [autoprefixer];
    
    if (this.config.minify) {
      plugins.push(cssnano);
    }
    
    const result = await postcss(plugins).process(content, {
      from: undefined
    });
    
    return result.css;
  }
  
  async processJavaScript() {
    const jsFiles = await this.getFiles(this.config.srcDir, '.js');
    
    for (const jsFile of jsFiles) {
      const content = await fs.readFile(jsFile, 'utf-8');
      const processedContent = await this.processJavaScriptContent(content);
      
      const fileName = path.basename(jsFile);
      const outputPath = path.join(this.config.outDir, 'js', fileName);
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, processedContent);
    }
  }
  
  async processJavaScriptContent(content) {
    if (!this.config.minify) {
      return content;
    }
    
    const result = await minify(content, {
      sourceMap: this.config.sourcemap,
      ecma: 2020,
      module: true,
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    });
    
    return result.code;
  }
  
  async generateManifest() {
    const manifest = {
      name: 'VanillaForge App',
      short_name: 'VF App',
      description: 'A VanillaForge application',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#2563eb',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };
    
    const manifestPath = path.join(this.config.outDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }
  
  async generateServiceWorker() {
    const swContent = `
      const CACHE_NAME = 'vanillaforge-app-v1';
      const urlsToCache = [
        '/',
        '/js/framework.js',
        '/css/main.css',
        '/css/components.css'
      ];
      
      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
        );
      });
      
      self.addEventListener('fetch', (event) => {
        event.respondWith(
          caches.match(event.request)
            .then((response) => {
              return response || fetch(event.request);
            })
        );
      });
    `;
    
    const swPath = path.join(this.config.outDir, 'sw.js');
    await fs.writeFile(swPath, swContent);
  }
  
  async getFiles(dir, extension = null) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getFiles(fullPath, extension);
          files.push(...subFiles);
        } else if (!extension || entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }
}

// Run build
const builder = new Builder();
builder.build().catch(console.error);
```

## Asset Management

### Image Optimization

```javascript
// scripts/optimize-images.js
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

class ImageOptimizer {
  constructor(options = {}) {
    this.formats = options.formats || ['webp', 'avif'];
    this.quality = options.quality || 80;
    this.sizes = options.sizes || [320, 640, 1280, 1920];
  }
  
  async optimizeImages(inputDir, outputDir) {
    const imageFiles = await this.getImageFiles(inputDir);
    
    for (const imageFile of imageFiles) {
      await this.processImage(imageFile, inputDir, outputDir);
    }
  }
  
  async processImage(imagePath, inputDir, outputDir) {
    const relativePath = path.relative(inputDir, imagePath);
    const { name, dir } = path.parse(relativePath);
    
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Generate responsive sizes
    for (const size of this.sizes) {
      if (size <= metadata.width) {
        await this.generateFormats(image, size, outputDir, dir, name);
      }
    }
    
    // Generate original size in modern formats
    await this.generateFormats(image, null, outputDir, dir, name);
  }
  
  async generateFormats(image, size, outputDir, dir, name) {
    let processedImage = image.clone();
    
    if (size) {
      processedImage = processedImage.resize(size);
    }
    
    // Generate modern formats
    for (const format of this.formats) {
      const suffix = size ? `_${size}w` : '';
      const outputPath = path.join(
        outputDir,
        dir,
        `${name}${suffix}.${format}`
      );
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      
      await processedImage
        .toFormat(format, { quality: this.quality })
        .toFile(outputPath);
    }
  }
  
  async getImageFiles(dir) {
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const files = [];
    
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.getImageFiles(fullPath);
        files.push(...subFiles);
      } else if (extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}
```

### CSS Processing

```javascript
// scripts/process-css.js
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import purgecss from '@fullhuman/postcss-purgecss';

class CSSProcessor {
  constructor(options = {}) {
    this.autoprefixer = options.autoprefixer !== false;
    this.minify = options.minify !== false;
    this.purge = options.purge === true;
    this.purgeContent = options.purgeContent || ['**/*.html', '**/*.js'];
  }
  
  async processCSS(content, options = {}) {
    const plugins = [];
    
    // Autoprefixer
    if (this.autoprefixer) {
      plugins.push(autoprefixer);
    }
    
    // PurgeCSS
    if (this.purge) {
      plugins.push(purgecss({
        content: this.purgeContent,
        defaultExtractor: content => content.match(/[\\w-/:]+(?<!:)/g) || []
      }));
    }
    
    // Minification
    if (this.minify) {
      plugins.push(cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true
        }]
      }));
    }
    
    const result = await postcss(plugins).process(content, {
      from: options.from || undefined,
      to: options.to || undefined
    });
    
    return result.css;
  }
}
```

## Optimization

### Bundle Analyzer

```javascript
// scripts/analyze-bundle.js
import { promises as fs } from 'fs';
import path from 'path';

class BundleAnalyzer {
  constructor(distDir = 'dist') {
    this.distDir = distDir;
  }
  
  async analyze() {
    const report = {
      totalSize: 0,
      files: [],
      breakdown: {
        js: { count: 0, size: 0 },
        css: { count: 0, size: 0 },
        images: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      }
    };
    
    await this.analyzeDirectory(this.distDir, report);
    
    console.log('📊 Bundle Analysis Report');
    console.log('========================');
    console.log(`Total Size: ${this.formatSize(report.totalSize)}`);
    console.log('');
    
    console.log('File Type Breakdown:');
    Object.entries(report.breakdown).forEach(([type, data]) => {
      console.log(`  ${type.toUpperCase()}: ${data.count} files, ${this.formatSize(data.size)}`);
    });
    
    console.log('');
    console.log('Largest Files:');
    report.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        console.log(`  ${file.path}: ${this.formatSize(file.size)}`);
      });
    
    return report;
  }
  
  async analyzeDirectory(dir, report) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await this.analyzeDirectory(fullPath, report);
      } else {
        const stats = await fs.stat(fullPath);
        const relativePath = path.relative(this.distDir, fullPath);
        
        report.totalSize += stats.size;
        report.files.push({
          path: relativePath,
          size: stats.size
        });
        
        const ext = path.extname(entry.name).toLowerCase();
        let category = 'other';
        
        if (['.js'].includes(ext)) {
          category = 'js';
        } else if (['.css'].includes(ext)) {
          category = 'css';
        } else if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'].includes(ext)) {
          category = 'images';
        }
        
        report.breakdown[category].count++;
        report.breakdown[category].size += stats.size;
      }
    }
  }
  
  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${sizes[i]}`;
  }
}
```

### Tree Shaking

```javascript
// scripts/tree-shake.js
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser';

class TreeShaker {
  async optimizeModule(inputPath, outputPath) {
    const bundle = await rollup({
      input: inputPath,
      external: [],
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },
      plugins: [
        terser({
          module: true,
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false
          }
        })
      ]
    });
    
    await bundle.write({
      file: outputPath,
      format: 'es'
    });
    
    await bundle.close();
  }
}
```

## Deployment

### Static Site Deployment

```javascript
// scripts/deploy-static.js
import { promises as fs } from 'fs';
import path from 'path';

class StaticDeployer {
  constructor(config) {
    this.config = {
      distDir: 'dist',
      baseUrl: '',
      ...config
    };
  }
  
  async deploy() {
    console.log('🚀 Deploying static site...');
    
    await this.generateSitemap();
    await this.generateRobotsTxt();
    await this.optimizeForCDN();
    
    console.log('✅ Deployment preparation complete!');
  }
  
  async generateSitemap() {
    // Generate sitemap.xml based on routes
    const routes = await this.getRoutes();
    const sitemap = this.createSitemap(routes);
    
    const sitemapPath = path.join(this.config.distDir, 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemap);
  }
  
  async getRoutes() {
    // Extract routes from your router configuration
    return [
      '/',
      '/about',
      '/contact',
      '/products',
      '/blog'
    ];
  }
  
  createSitemap(routes) {
    const baseUrl = this.config.baseUrl;
    const urls = routes.map(route => {
      return `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
    }).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }
  
  async generateRobotsTxt() {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${this.config.baseUrl}/sitemap.xml`;
    
    const robotsPath = path.join(this.config.distDir, 'robots.txt');
    await fs.writeFile(robotsPath, robotsTxt);
  }
  
  async optimizeForCDN() {
    // Add cache headers optimization
    const headerRules = {
      '*.js': 'Cache-Control: public, max-age=31536000, immutable',
      '*.css': 'Cache-Control: public, max-age=31536000, immutable',
      '*.html': 'Cache-Control: public, max-age=0, must-revalidate',
      '*.png,*.jpg,*.jpeg,*.webp,*.avif': 'Cache-Control: public, max-age=31536000'
    };
    
    const configPath = path.join(this.config.distDir, '_headers');
    const headerConfig = Object.entries(headerRules)
      .map(([pattern, rule]) => `/${pattern}\n  ${rule}`)
      .join('\n\n');
    
    await fs.writeFile(configPath, headerConfig);
  }
}
```

### GitHub Pages Deployment

```javascript
// scripts/deploy-github.js
import { execSync } from 'child_process';
import { promises as fs } from 'fs';

class GitHubPagesDeployer {
  constructor(options = {}) {
    this.branch = options.branch || 'gh-pages';
    this.distDir = options.distDir || 'dist';
    this.repo = options.repo;
  }
  
  async deploy() {
    console.log('🚀 Deploying to GitHub Pages...');
    
    // Build the project
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create .nojekyll file
    await fs.writeFile(`${this.distDir}/.nojekyll`, '');
    
    // Deploy to GitHub Pages
    execSync(`npx gh-pages -d ${this.distDir} -b ${this.branch}`, {
      stdio: 'inherit'
    });
    
    console.log('✅ Deployed to GitHub Pages!');
  }
}

// Deploy
const deployer = new GitHubPagesDeployer();
deployer.deploy().catch(console.error);
```

## Advanced Configuration

### Custom Build Pipeline

```javascript
// scripts/custom-build.js
class CustomBuildPipeline {
  constructor() {
    this.tasks = [];
  }
  
  addTask(name, fn) {
    this.tasks.push({ name, fn });
    return this;
  }
  
  async run() {
    console.log('🏗️  Running custom build pipeline...');
    
    for (const task of this.tasks) {
      console.log(`Running task: ${task.name}`);
      const start = Date.now();
      
      try {
        await task.fn();
        const duration = Date.now() - start;
        console.log(`✅ ${task.name} completed in ${duration}ms`);
      } catch (error) {
        console.error(`❌ ${task.name} failed:`, error);
        throw error;
      }
    }
    
    console.log('✅ Build pipeline completed!');
  }
}

// Usage
const pipeline = new CustomBuildPipeline()
  .addTask('Clean', () => cleanDist())
  .addTask('Copy Assets', () => copyPublicAssets())
  .addTask('Process CSS', () => processCSS())
  .addTask('Process JS', () => processJavaScript())
  .addTask('Optimize Images', () => optimizeImages())
  .addTask('Generate PWA', () => generatePWAFiles())
  .addTask('Create Archive', () => createDeploymentArchive());

pipeline.run().catch(console.error);
```

### Environment Configuration

```javascript
// scripts/env-config.js
class EnvironmentConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.config = this.loadConfig();
  }
  
  loadConfig() {
    const baseConfig = {
      development: {
        apiUrl: 'http://localhost:3001/api',
        debug: true,
        minify: false,
        sourcemap: true
      },
      staging: {
        apiUrl: 'https://staging-api.example.com',
        debug: true,
        minify: true,
        sourcemap: true
      },
      production: {
        apiUrl: 'https://api.example.com',
        debug: false,
        minify: true,
        sourcemap: false
      }
    };
    
    return baseConfig[this.env] || baseConfig.development;
  }
  
  get(key) {
    return this.config[key];
  }
  
  generateConfigFile() {
    return `
      // Auto-generated configuration
      export const CONFIG = ${JSON.stringify(this.config, null, 2)};
      export const ENV = '${this.env}';
    `;
  }
}
```

---

The VanillaForge build system provides a comprehensive solution for modern web development, from development to production deployment, with powerful optimization and asset management capabilities.
