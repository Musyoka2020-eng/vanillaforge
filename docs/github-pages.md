# GitHub Pages Deployment Guide

## Overview

VanillaForge now supports deployment to GitHub Pages with proper single-page application (SPA) routing. The framework automatically detects when running on GitHub Pages and configures the appropriate base path and routing behavior.

## Automatic Configuration

When your application is hosted on GitHub Pages (`*.github.io`), VanillaForge automatically:

1. **Sets the base path** to your repository name (e.g., `/vanillaforge/`)
2. **Configures HTML base tag** for proper asset loading
3. **Handles client-side routing** with the correct URL structure
4. **Provides fallback routing** for direct URL access

## Files Added/Modified for GitHub Pages Support

### Core Changes

1. **Router Base Path Support** (`src/core/router.js`)
   - Added `basePath` configuration option
   - Automatic path resolution for GitHub Pages
   - Proper URL handling for navigation

2. **Framework Configuration** (`src/framework.js`)
   - Router now accepts configuration options
   - Base path is passed from app configuration

3. **Application Setup** (`src/app.js`)
   - Automatic GitHub Pages detection
   - Dynamic base path configuration
   - Redirect parameter handling for deep links

4. **HTML Base Tag** (`index.html`)
   - Dynamic base tag injection for GitHub Pages
   - Ensures proper asset loading

### GitHub Pages Specific Files

1. **`.nojekyll`** - Prevents Jekyll processing
2. **`404.html`** - Handles client-side routing fallback

## How It Works

### Local Development
- Base path: empty (`''`)
- URLs: `http://localhost:8080/`, `http://localhost:8080/home`

### GitHub Pages
- Base path: `/vanillaforge/` (repository name)
- URLs: `https://username.github.io/vanillaforge/`, `https://username.github.io/vanillaforge/home`

### Deep Link Handling

When a user navigates directly to a route (e.g., `https://username.github.io/vanillaforge/home`):

1. GitHub Pages serves `404.html` (since the file doesn't exist)
2. `404.html` detects the intended route and redirects to `index.html` with a redirect parameter
3. The main application reads the redirect parameter and navigates to the correct route
4. The URL is cleaned up to show the proper route

## Configuration Options

### Router Configuration

```javascript
const app = createApp({
  router: {
    mode: 'history',
    fallback: '/404',
    basePath: '/your-repo-name', // Automatic on GitHub Pages
  },
});
```

### Manual Base Path

If you need to manually set a base path (for custom domains or subdirectories):

```javascript
const app = createApp({
  router: {
    basePath: '/custom-path',
  },
});
```

## Deployment Steps

1. **Build your application** (if using a build process)
2. **Commit all files** including `.nojekyll` and `404.html`
3. **Push to GitHub**
4. **Enable GitHub Pages** in repository settings
5. **Set source** to main branch (or gh-pages if using a separate branch)

## Troubleshooting

### Common Issues

1. **Assets not loading**: Make sure the base tag is properly set in `index.html`
2. **Routes not working**: Check that `.nojekyll` file exists
3. **404 on refresh**: Verify `404.html` is in the repository root
4. **Wrong base path**: Ensure repository name matches the configured base path

### Debug Mode

Enable debug mode to see routing information:

```javascript
const app = createApp({
  debug: true, // Enables router debug logs
});
```

Check browser console for routing information and any errors.

## Custom Domain Setup

If using a custom domain with GitHub Pages:

1. Set up your custom domain in GitHub Pages settings
2. Update the base path detection logic if needed:

```javascript
// In src/app.js
const isCustomDomain = window.location.hostname === 'your-domain.com';
const basePath = isCustomDomain ? '' : '/vanillaforge';
```

## Performance Considerations

- The base path detection is minimal overhead
- Client-side routing is efficient with proper caching
- Static assets are served directly by GitHub Pages CDN

## Browser Support

GitHub Pages deployment supports the same browsers as the main framework:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
