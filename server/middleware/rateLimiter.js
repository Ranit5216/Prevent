import rateLimit from 'express-rate-limit'

// General API rate limiter (excludes auth endpoints)
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later.',
        error: true,
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for authentication endpoints (they have their own limiters)
    skip: (request) => {
        const authPaths = ['/api/user/login', '/api/user/register', '/api/user/verify-otp', '/api/user/resend-otp']
        return authPaths.some(path => request.path.startsWith(path))
    }
})

// Rate limiter for authentication endpoints (more lenient for normal use)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 login/register attempts per 15 minutes
    message: {
        message: 'Too many login attempts, please try again after 15 minutes.',
        error: true,
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
})

// OTP rate limiter
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: {
        message: 'Too many OTP requests, please try again after 15 minutes.',
        error: true,
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: {
        message: 'Too many password reset attempts, please try again after 1 hour.',
        error: true,
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// File upload rate limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 uploads per hour
    message: {
        message: 'Too many upload requests, please try again later.',
        error: true,
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
})

