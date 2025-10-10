# Privacy Policy

## Analytics & Privacy

This project can optionally use PostHog Cloud to collect anonymous usage analytics to help improve the software.

- Analytics are disabled by default. They are only enabled when `VITE_ENABLE_ANALYTICS` is set to `true` in your environment.
- When enabled, the app loads the PostHog client using the public key `VITE_PUBLIC_POSTHOG_KEY` and optional host `VITE_PUBLIC_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`).
- The app respects browser Do Not Track (DNT) and a local opt-out stored in `localStorage`. You can disable DNT respect for testing by setting `VITE_ANALYTICS_RESPECT_DNT=false` (not recommended for production).

## What We Collect

When enabled, the analytics may include events such as:
- App loaded, page views, page leave
- Export events (e.g., `export_image`, `export_json`) with basic metadata (layout id/name, number of cards, file format)

We do not intentionally collect personally identifiable information. Please avoid including sensitive data in layout names or content if you plan to enable analytics.

## Where Data Goes

If enabled, analytics data is sent to PostHog Cloud and handled under their terms. See PostHog’s privacy information at `https://posthog.com/`.

## How to Opt Out

- Do not set `VITE_ENABLE_ANALYTICS` to `true` (default is disabled), or
- In the running app, use the in-app notice to Opt out, or
- Manually set a local preference:
  ```js
  localStorage.setItem('analytics_opt_out', 'true');
  ```

You can clear the opt-out by removing the key:
```js
localStorage.removeItem('analytics_opt_out');
```

## For Contributors

- Only send analytics when `VITE_ENABLE_ANALYTICS === 'true'`.
- Use `VITE_PUBLIC_POSTHOG_KEY`/`VITE_PUBLIC_POSTHOG_HOST` for any client-side configuration.
- Respect `navigator.doNotTrack` and the local opt-out (`analytics_opt_out`).
- Update this document if analytics collection changes.
