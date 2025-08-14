import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Session Replay
  integrations: [
    Sentry.replayIntegration({
      // Capture 10% of all sessions,
      // plus 100% of sessions with an error
      sessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Filter out noisy errors
  beforeSend(event, hint) {
    // Filter out network errors from ad blockers, etc.
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        if (
          message.includes('AdBlock') ||
          message.includes('Network Error') ||
          message.includes('Load failed')
        ) {
          return null
        }
      }
    }
    return event
  },
})