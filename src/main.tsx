import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  import('./lib/analytics').then((m) => m.initializeAnalytics());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
