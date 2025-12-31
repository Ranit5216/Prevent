import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'

const auth = async(request, response, next) => {
    try {
        // Safely extract token from cookies or authorization header
        let token = request.cookies?.accessToken
        
        if (!token && request.headers?.authorization) {
            const authHeader = request.headers.authorization
            if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1]
            }
        }
       
        if (!token) {
            return response.status(401).json({
                message: 'User not Login. Please Login First',
                error: true,
                success: false
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if (!decode || !decode.id) {
            return response.status(401).json({
                message: 'Invalid token. Please login again.',
                error: true,
                success: false
            })
        }

        request.userId = decode.id
        next()

    } catch (error) {
        // Handle specific JWT errors
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

        logger.error('Auth middleware error:', error)
        return response.status(500).json({
            message: 'Authentication error. Please try again.',
            error: true,
            success: false
        })
    }
}

export default auth