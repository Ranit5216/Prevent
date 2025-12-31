import mongoose from 'mongoose';
import dotenv from 'dotenv'
import logger from '../utils/logger.js'

dotenv.config()

if(!process.env.MONGODB_URI){
    throw new Error(
        "Please provide MONGODB_URI in the .env file"
    )
}

async function connectDB(){
    try {
        const connectionOptions = {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            connectTimeoutMS: 10000, // 10 seconds connection timeout
            retryWrites: true,
            w: 'majority'
        };

        await mongoose.connect(process.env.MONGODB_URI, connectionOptions)
        logger.info("MongoDB connected successfully")
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err.message)
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...')
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected')
        });

    } catch (error) {
        logger.error("MongoDB connection failed:", {
            code: error.code,
            message: error.message
        })
        
        // Provide helpful error messages based on error type
        if (error.code === 'ECONNREFUSED') {
            logger.error("Troubleshooting: Check MongoDB Atlas cluster status, IP whitelist, and connection string")
        } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            logger.error("Troubleshooting: Check internet connection and MongoDB URI hostname")
        } else if (error.message.includes('authentication failed')) {
            logger.error("Troubleshooting: Verify MongoDB username, password, and user permissions")
        }
        
        // Don't exit immediately - allow the app to continue (useful for development)
        // Uncomment the line below if you want the app to exit on connection failure
        // process.exit(1)
    }
}

export default connectDB