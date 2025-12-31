import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import contactRouter from './route/contact.route.js'
import chatRouter from './route/chat.route.js'
import reviewRouter from './route/review.route.js'
import adminRouter from './route/admin.route.js'
import notificationRouter from './route/notification.route.js'
import { Server } from 'socket.io'
import http from 'http'
import { sanitizeBody, sanitizeQuery } from './middleware/sanitize.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import logger from './utils/logger.js'

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  // Do not exit the process
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Do not exit the process
})

const app = express()

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy : false
}))

// CORS configuration
app.use(cors({
    credentials : true,
    origin : process.env.FRONTEND_URL
}))

// Body parser with size limit
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Request logging - disabled
// Uncomment below to enable logging:
// if (process.env.NODE_ENV === 'production') {
//     app.use(morgan('combined', {
//         skip: (req, res) => res.statusCode < 400
//     }))
// } else {
//     app.use(morgan('tiny'))
// }

// Input sanitization
app.use(sanitizeBody)
app.use(sanitizeQuery)

// Fix PORT configuration bug
const PORT = process.env.PORT || 8080

app.get("/",(request,response)=>{
    response.json({
        message : `Server is running on port ${PORT}`,
        status: 'ok'
    })
})

app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/file',uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use("/api/order",orderRouter)
app.use("/api/contact",contactRouter)
app.use("/api/chat",chatRouter)
app.use("/api/review",reviewRouter)
app.use("/api/admin",adminRouter)
app.use("/api/notifications",notificationRouter)

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }
})

// Socket.io connection handling
io.on('connection', (socket) => {
    logger.info('User connected:', socket.id)

    // Join user to their chat room
    socket.on('join-chat', (chatSessionId) => {
        socket.join(chatSessionId)
        logger.debug(`User ${socket.id} joined chat: ${chatSessionId}`)
    })

    // Handle new message
    socket.on('send-message', async (data) => {
        try {
            // Broadcast message to all users in the chat room
            io.to(data.chatSessionId).emit('receive-message', {
                id: Date.now(),
                sender: data.sender,
                text: data.message,
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                chatSessionId: data.chatSessionId
            })
        } catch (error) {
            logger.error('Error handling message:', error)
            socket.emit('error', { message: 'Failed to send message' })
        }
    })

    // Handle typing indicator
    socket.on('typing', (data) => {
        socket.to(data.chatSessionId).emit('user-typing', {
            userId: data.userId,
            isTyping: data.isTyping
        })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
        logger.info('User disconnected:', socket.id)
    })
})

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

connectDB().then(()=>{
    server.listen(PORT,()=>{
        logger.info(`Server is running on port ${PORT}`)
        logger.info('Socket.io server initialized')
    })
}).catch((error) => {
    logger.error('Failed to start server:', error)
    process.exit(1)
})



