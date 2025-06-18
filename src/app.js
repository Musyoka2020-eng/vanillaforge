import { createApp } from './framework.js';
import { HomeComponent } from './components/home-component.js';
import { NotFoundComponent } from './components/not-found-component.js';

async function initializeApp() {
  try {
    const app = createApp({
      appName: 'VanillaForge Demo',
      debug: true,
      router: {
        mode: 'history',
        fallback: '/404',
      },
    });

    await app.initialize({
      routes: {
        '/': HomeComponent,
        '/home': HomeComponent,
        '/404': NotFoundComponent,
      },
      components: {
        'home-component': HomeComponent,
        'not-found-component': NotFoundComponent,
      },
    });
    await app.start();

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🔥 VanillaForge application started!');
      console.log('📖 Framework instance available at window.app');
      console.log('🔍 Debug tools available at window.VanillaForgeDebug');
    }

    window.app = app;
  } catch (error) {
    console.error('Failed to initialize VanillaForge app:', error);
    document.getElementById('main-content').innerHTML = `
      <div style="padding: 40px; text-align: center; color: #dc3545;">
        <h2>❌ Failed to Load</h2>
        <p>Error: ${error.message}</p>
        <p style="margin-top: 20px;">
          <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Retry
          </button>
        </p>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}