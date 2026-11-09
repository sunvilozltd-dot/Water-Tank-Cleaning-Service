import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically handle dynamic import chunk load errors after new deployments
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    console.warn('New deployment detected, reloading page to fetch latest code...');
    window.location.reload();
  });

  // Ensure any legacy or rogue service worker is unregistered to prevent stale cache interception
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  }
}

const container = document.getElementById('root')!;
createRoot(container).render(<App />);
