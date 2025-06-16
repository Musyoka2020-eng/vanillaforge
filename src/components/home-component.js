/**
 * Home Component
 * 
 * Simple home page component for demonstration
 * 
 * @author VanillaForge Team
 * @version 1.0.0
 * @since 2025-06-15
 */

import { BaseComponent } from './base-component.js';

export class HomeComponent extends BaseComponent {
  constructor(eventBus, props = {}) {
    super(eventBus, props);
    this.name = 'home-component';
    this.state = {
      message: 'Welcome to VanillaForge!',
      counter: 0
    };
  }

  /**
   * Initialize component
   */
  async init() {
    await super.init();
    this.logger.info('Home component initialized');
  }

  /**
   * Get component template
   * 
   * @returns {string} HTML template
   */
  getTemplate() {
    return `
      <div class="home-container">
        <div class="home-content">
          <div class="hero-section">
            <h1 class="hero-title">🔥 ${this.state.message}</h1>
            <p class="hero-subtitle">
              A modern, lightweight framework for forging Single Page Applications with vanilla JavaScript.
            </p>
            <div class="hero-features">
              <div class="feature">
                <span class="feature-icon">🏗️</span>
                <span>Component-Based Architecture</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🛣️</span>
                <span>Client-Side Routing</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📡</span>
                <span>Event-Driven Communication</span>
              </div>
              <div class="feature">
                <span class="feature-icon">⚡</span>
                <span>Zero Dependencies</span>
              </div>
            </div>
          </div>
          
          <div class="demo-section">
            <h2>Interactive Demo</h2>
            <div class="counter-demo">
              <p>Counter: <span class="counter-value">${this.state.counter}</span></p>
              <div class="counter-buttons">
                <button class="btn btn-primary" data-action="increment">+</button>
                <button class="btn btn-secondary" data-action="decrement">-</button>
                <button class="btn btn-outline" data-action="reset">Reset</button>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h2>Getting Started</h2>
            <div class="code-example">
              <pre><code>import { createApp, BaseComponent } from './src/framework.js';

class MyComponent extends BaseComponent {
    constructor(eventBus, props) {
        super(eventBus, props);
        this.name = 'my-component';
    }
    
    getTemplate() {
        return \`&lt;div&gt;Hello VanillaForge!&lt;/div&gt;\`;
    }
}

const app = createApp({ debug: true });
await app.initialize({
    routes: { '/': MyComponent },
    components: { 'my-component': MyComponent }
});
await app.start();</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Component methods
   */  getMethods() {
    return {
      increment: () => {
        this.setState({ counter: this.state.counter + 1 });
      },
      
      decrement: () => {
        this.setState({ counter: this.state.counter - 1 });
      },
      
      reset: () => {
        this.setState({ counter: 0 });
      }
    };
  }/**
   * Component lifecycle methods
   */  getLifecycle() {
    return {
      onMount: async () => {
        this.logger.info('Home component mounted');
        
        // Add event listeners for demo buttons
        if (this.element) {
          // First, let's check if buttons exist
          const buttons = this.element.querySelectorAll('[data-action]');
          
          // Add a test button click programmatically
          setTimeout(() => {
            if (buttons.length > 0) {
              buttons[0].click();
            }
          }, 2000);
          
          this.element.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            const methods = this.getMethods();
            
            if (methods[action]) {
              methods[action]();
            }
          });
        }
      },
      
      onUnmount: () => {
        this.logger.info('Home component unmounted');
      }
    };
  }
}
