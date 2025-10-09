import posthog from 'posthog-js';

/**
 * Initializes PostHog analytics if explicitly enabled via Vite env.
 * Requires Vite env variables:
 * - VITE_ENABLE_ANALYTICS: "true" to enable
 * - VITE_PUBLIC_POSTHOG_KEY: your PostHog project API key
 * - VITE_PUBLIC_POSTHOG_HOST: PostHog host (default https://us.i.posthog.com)
 */
export function initializeAnalytics(): void {
  const isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  if (!isEnabled) return;

  // Respect local opt-out (persistent)
  try {
    const isOptedOut = localStorage.getItem('analytics_opt_out') === 'true';
    if (isOptedOut) return;
  } catch {
    // no-op if storage blocked
  }

  const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
  const host = (import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

  if (!apiKey) {
    // Fail silently if key missing while enabled to avoid app crash
    console.warn('[analytics] VITE_ENABLE_ANALYTICS=true but VITE_PUBLIC_POSTHOG_KEY is missing');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (ph) => {
      // Respect do-not-track
      const windowWithDnt = window as Window & { doNotTrack?: string };
      if (navigator.doNotTrack === '1' || windowWithDnt.doNotTrack === '1') {
        ph.opt_out_capturing();
      }
    },
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  const isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  if (!isEnabled) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // no-op
  }
}

export function shutdownAnalytics(): void {
  const isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  if (!isEnabled) return;
  try {
    posthog.opt_out_capturing();
  } catch {
    // no-op
  }
}