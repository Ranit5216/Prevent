import * as Sentry from "@sentry/react";

// Initialize Sentry only in production
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "", // Add your Sentry DSN in .env file
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    environment: import.meta.env.MODE || "production",
    // Set sample rate for profiling
    profilesSampleRate: 1.0,
  });
  
  // Make Sentry available globally for error handling
  window.Sentry = Sentry;
}

export default Sentry;
