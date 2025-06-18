/**
 * DOM-related utilities
 */

/**
 * Optimize images for different screen sizes
 * @param {HTMLImageElement} img - Image element
 * @param {Object} sizes - Size configuration
 */
export function optimizeImage(img, sizes = {}) {
  const defaultSizes = {
    small: '(max-width: 480px)',
    medium: '(max-width: 768px)',
    large: '(min-width: 769px)'
  };

  const imageSizes = { ...defaultSizes, ...sizes };

  const picture = document.createElement('picture');

  Object.entries(imageSizes).forEach(([size, media]) => {
    const source = document.createElement('source');
    source.media = media;
    source.srcset = img.dataset[`src${size.charAt(0).toUpperCase() + size.slice(1)}`] || img.src;
    picture.appendChild(source);
  });

  picture.appendChild(img.cloneNode(true));
  return picture;
}

/**
 * Batch DOM operations to avoid layout thrashing
 * @param {Function[]} operations - Array of DOM operations
 */
export function batchDOMOperations(operations) {
  requestAnimationFrame(() => {
    operations.forEach(operation => operation());
  });
}