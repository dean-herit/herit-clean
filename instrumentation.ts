export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./src/lib/sentry/server')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./src/lib/sentry/edge')
  }
}