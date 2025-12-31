import logger from '../utils/logger.js'

// Centralized error handler middleware
export const errorHandler = (error, request, response, next) => {
    logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        ip: request.ip
    })

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        return response.status(400).json({
            message: 'Validation error',
            errors: Object.values(error.errors).map(err => err.message),
            error: true,
            success: false
        })
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]
        return response.status(400).json({
            message: `${field} already exists`,
            error: true,
            success: false
        })
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            message: 'Invalid token. Please login again.',
            error: true,
            success: false
        })
    }

    if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            message: 'Token expired. Please login again.',
            error: true,
            success: false
        })
    }

    // Multer file upload errors
    if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return response.status(400).json({
                message: 'File size too large. Maximum size is 5MB.',
                error: true,
                success: false
            })
        }
        return response.status(400).json({
            message: 'File upload error',
            error: true,
            success: false
        })
    }

    // Default error response
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'

    return response.status(statusCode).json({
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred. Please try again later.' 
            : message,
        error: true,
        success: false,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    })
}

// 404 handler
export const notFoundHandler = (request, response, next) => {
    response.status(404).json({
        message: `Route ${request.originalUrl} not found`,
        error: true,
        success: false
    })
}

