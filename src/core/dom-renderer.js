/**
 * DOM Renderer
 *
 * Handles rendering components to the DOM.
 */
export class DOMRenderer {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Render a component to the DOM
   *
   * @param {Object} instance - The component instance
   * @param {HTMLElement} container - The container element
   * @returns {HTMLElement} The rendered element
   */
  render(instance, container) {
    const element = document.createElement('div');
    element.className = `component ${instance.name}`;
    container.innerHTML = '';
    container.appendChild(element);
    instance.element = element;

    const template = instance.getTemplate();
    element.innerHTML = template;

    this.setupComponentMethods(instance);

    return element;
  }

  /**
   * Set up component methods and event listeners
   *
   * @param {Object} instance - Component instance
   */
  setupComponentMethods(instance) {
    if (!instance.element) return;

    const methods = (typeof instance.getMethods === 'function') ? instance.getMethods() : {};

    const actionElements = instance.element.querySelectorAll('[data-action]');
    actionElements.forEach(element => {
      const clickHandler = (event) => {
        const action = event.target.getAttribute('data-action');
        if (methods[action]) {
          event.preventDefault();
          try {
            methods[action].call(instance, event);
          } catch (error) {
            this.logger.error(`Error executing action: ${action}`, error);
          }
        }
      };
      element.addEventListener('click', clickHandler);
      this.storeListener(instance, element, 'click', clickHandler);
    });

    const forms = instance.element.querySelectorAll('form');
    forms.forEach(form => {
      const submitHandler = (event) => {
        const action = form.getAttribute('data-action');
        if (action && methods[action]) {
          methods[action].call(instance, event);
        } else if (methods.onSubmit) {
          methods.onSubmit.call(instance, event);
        }
      };
      form.addEventListener('submit', submitHandler);
      this.storeListener(instance, form, 'submit', submitHandler);
    });
  }

  /**
   * Store event listener for cleanup
   *
   * @param {Object} instance - Component instance
   * @param {HTMLElement} element - The element with the listener
   * @param {string} type - The event type
   * @param {Function} handler - The event handler
   */
  storeListener(instance, element, type, handler) {
    if (!instance._componentManagerListeners) {
      instance._componentManagerListeners = [];
    }
    instance._componentManagerListeners.push({ element, type, handler });
  }

  /**
   * Clean up component listeners
   *
   * @param {Object} instance - Component instance
   */
  cleanupComponentListeners(instance) {
    if (instance._componentManagerListeners) {
      instance._componentManagerListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      instance._componentManagerListeners = [];
    }
  }
}