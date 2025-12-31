import express from 'express'
import { getChatSessionController, saveChatMessageController, getChatHistoryController, getAllActiveChatsController } from '../controllers/chat.controller.js'
import auth from '../middleware/auth.js'
import { isAdmin } from '../middleware/isAdmin.js'

const chatRouter = express.Router()

// User routes
chatRouter.get('/session', auth, getChatSessionController)
chatRouter.post('/message', auth, saveChatMessageController)
chatRouter.get('/history', auth, getChatHistoryController)

// Admin routes
chatRouter.get('/admin/active-chats', auth, isAdmin, getAllActiveChatsController)

export default chatRouter

