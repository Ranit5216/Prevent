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
import { Server } from 'socket.io'
import http from 'http';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Do not exit the process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit the process
});

const app = express()
app.use(cors({
    credentials : true,
    origin : process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
// app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : false
}))

    const PORT = 8080 || process.env.PORT

app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running" + PORT
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
    console.log('User connected:', socket.id)

    // Join user to their chat room
    socket.on('join-chat', (chatSessionId) => {
        socket.join(chatSessionId)
        console.log(`User ${socket.id} joined chat: ${chatSessionId}`)
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
            console.error('Error handling message:', error)
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
        console.log('User disconnected:', socket.id)
    })
})

connectDB().then(()=>{
    server.listen(PORT,()=>{
        console.log("Server is running on port",PORT)
        console.log("Socket.io server initialized")
    })
})



