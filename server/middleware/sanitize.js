import { body, query, param, validationResult } from 'express-validator'

// Sanitize string inputs to prevent XSS
export const sanitizeString = (value) => {
    if (typeof value !== 'string') return value
    // Remove HTML tags and encode special characters
    return value
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove remaining angle brackets
}

// Sanitize object recursively
export const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj
    
    if (typeof obj === 'string') {
        return sanitizeString(obj)
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item))
    }
    
    if (typeof obj === 'object') {
        const sanitized = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key])
            }
        }
        return sanitized
    }
    
    return obj
}

// Middleware to sanitize request body
export const sanitizeBody = (request, response, next) => {
    if (request.body) {
        request.body = sanitizeObject(request.body)
    }
    next()
}

// Middleware to sanitize query parameters
export const sanitizeQuery = (request, response, next) => {
    if (request.query) {
        request.query = sanitizeObject(request.query)
    }
    next()
}

// Validation middleware
export const validate = (validations) => {
    return async (request, response, next) => {
        await Promise.all(validations.map(validation => validation.run(request)))
        
        const errors = validationResult(request)
        if (errors.isEmpty()) {
            return next()
        }
        
        return response.status(400).json({
            message: 'Validation failed',
            errors: errors.array(),
            error: true,
            success: false
        })
    }
}

// Common validation rules
export const validationRules = {
    email: body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    password: body('password')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters'),
    
    name: body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'),
    
    mobile: body('mobile')
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Mobile number must be exactly 10 digits'),
    
    otp: body('otp')
        .trim()
        .isLength({ min: 4, max: 6 })
        .isNumeric()
        .withMessage('OTP must be 4-6 digits'),
}

