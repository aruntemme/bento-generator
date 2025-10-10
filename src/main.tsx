import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';
import type { PostHog, ConfigDefaults } from 'posthog-js';
import App from './App.tsx';
import './index.css';

const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';
const respectDnt = (import.meta.env.VITE_ANALYTICS_RESPECT_DNT as string | undefined) !== 'false';
const debugEnabled = import.meta.env.VITE_ANALYTICS_DEBUG === 'true';

let optedOut = false;
try {
  optedOut = localStorage.getItem('analytics_opt_out') === 'true';
} catch {
  // no-op if storage blocked
}

const options = {
  api_host: host,
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  defaults: '2025-05-24' as unknown as ConfigDefaults,
  debug: debugEnabled,
  loaded: (ph: PostHog) => {
    if (respectDnt) {
      const windowWithDnt = window as Window & { doNotTrack?: string };
      if (navigator.doNotTrack === '1' || windowWithDnt.doNotTrack === '1') {
        ph.opt_out_capturing();
      }
    }
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {analyticsEnabled && apiKey && !optedOut ? (
      <PostHogProvider apiKey={apiKey} options={options}>
        <App />
      </PostHogProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
