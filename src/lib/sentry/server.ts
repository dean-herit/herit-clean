import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced context for estate planning app
  beforeSend(event, hint) {
    // Add user context for estate planning
    if (event.user?.id) {
      event.tags = {
        ...event.tags,
        user_type: 'estate_planning_user',
      }
    }
    
    // Enhanced context for database operations
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        if (message.includes('database') || message.includes('query')) {
          event.tags = {
            ...event.tags,
            error_category: 'database',
          }
        }
      }
    }
    
    return event
  },
})