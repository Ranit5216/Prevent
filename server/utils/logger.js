// Simple logger utility to replace console.log
// In production, you can integrate with services like Winston, Pino, or Sentry

const isDevelopment = process.env.NODE_ENV !== 'production'

const logger = {
    info: (...args) => {
        if (isDevelopment) {
            console.log('[INFO]', ...args)
        }
        // In production, send to logging service
    },
    
    error: (...args) => {
        console.error('[ERROR]', ...args)
        // In production, send to error tracking service (e.g., Sentry)
    },
    
    warn: (...args) => {
        if (isDevelopment) {
            console.warn('[WARN]', ...args)
        }
    },
    
    debug: (...args) => {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args)
        }
    }
}

export default logger

