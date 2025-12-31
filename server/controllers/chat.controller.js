import ChatModel from '../models/chat.model.js'
import UserModel from '../models/user.model.js'

// Get or create chat session ID for a user
export async function getChatSessionController(request, response) {
    try {
        const userId = request.userId

        if (!userId) {
            return response.status(401).json({
                message: "User not authenticated",
                error: true,
                success: false
            })
        }

        // Get user details
        const user = await UserModel.findById(userId).select('name email avatar')
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        // Generate or get existing chat session ID
        const chatSessionId = `chat_${userId}_${Date.now()}`

        // Get recent chat history (last 50 messages)
        const chatHistory = await ChatModel.find({
            userId: userId
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('admin_id', 'name email')
        .lean()

        return response.json({
            message: "Chat session retrieved",
            error: false,
            success: true,
            data: {
                chatSessionId,
                user: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                },
                messages: chatHistory.reverse() // Reverse to show oldest first
            }
        })

    } catch (error) {
        console.error("Get chat session error:", error)
        return response.status(500).json({
            message: error.message || "Failed to get chat session",
            error: true,
            success: false
        })
    }
}

// Save chat message
export async function saveChatMessageController(request, response) {
    try {
        const { message, sender, chatSessionId } = request.body
        const userId = request.userId

        if (!userId && sender !== 'admin') {
            return response.status(401).json({
                message: "User not authenticated",
                error: true,
                success: false
            })
        }

        if (!message || !chatSessionId) {
            return response.status(400).json({
                message: "Message and chat session ID are required",
                error: true,
                success: false
            })
        }

        // Get user details and determine userId
        let userDetails = {}
        let finalUserId = userId
        
        if (sender === 'user' && userId) {
            // User message - use the authenticated user's ID
            const user = await UserModel.findById(userId).select('name email avatar')
            if (user) {
                userDetails = {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
                finalUserId = userId
            }
        } else if (sender === 'admin' || sender === 'support') {
            // Admin message - find the userId from the chat session
            // Look for the first user message in this chat session to get the userId
            const firstUserMessage = await ChatModel.findOne({
                chat_session_id: chatSessionId,
                sender: 'user'
            }).sort({ createdAt: 1 })
            
            if (firstUserMessage && firstUserMessage.userId) {
                finalUserId = firstUserMessage.userId
                // Get user details for the chat
                const user = await UserModel.findById(finalUserId).select('name email avatar')
                if (user) {
                    userDetails = {
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar
                    }
                }
            }
        }

        // Get admin details if sender is admin
        let adminId = null
        if (sender === 'admin' || sender === 'support') {
            adminId = request.userId // Admin's user ID
        }

        const chatMessage = new ChatModel({
            userId: finalUserId, // Will be null for admin messages if no user found, but that's okay now
            user_details: userDetails,
            message: message,
            sender: sender,
            admin_id: adminId,
            chat_session_id: chatSessionId,
            status: 'in-progress'
        })

        const savedMessage = await chatMessage.save()

        return response.json({
            message: "Message saved successfully",
            error: false,
            success: true,
            data: savedMessage
        })

    } catch (error) {
        console.error("Save chat message error:", error)
        return response.status(500).json({
            message: error.message || "Failed to save message",
            error: true,
            success: false
        })
    }
}

// Get chat history
export async function getChatHistoryController(request, response) {
    try {
        const userId = request.userId
        const { chatSessionId } = request.query
        const user = await UserModel.findById(userId).select('role')

        if (!userId) {
            return response.status(401).json({
                message: "User not authenticated",
                error: true,
                success: false
            })
        }

        // For admins, they can see any chat by chatSessionId
        // For users, they can only see their own chats
        const query = {}
        if (user?.role === 'ADMIN') {
            // Admin can view any chat by session ID
            if (chatSessionId) {
                query.chat_session_id = chatSessionId
            }
        } else {
            // Regular users can only see their own chats
            query.userId = userId
            if (chatSessionId) {
                query.chat_session_id = chatSessionId
            }
        }

        const messages = await ChatModel.find(query)
            .sort({ createdAt: 1 })
            .populate('admin_id', 'name email avatar')
            .populate('userId', 'name email avatar')
            .lean()

        return response.json({
            message: "Chat history retrieved",
            error: false,
            success: true,
            data: messages
        })

    } catch (error) {
        console.error("Get chat history error:", error)
        return response.status(500).json({
            message: error.message || "Failed to get chat history",
            error: true,
            success: false
        })
    }
}

// Get all active chats (for admin)
export async function getAllActiveChatsController(request, response) {
    try {
        const adminId = request.userId

        // Get all unique chat sessions
        const chatSessions = await ChatModel.aggregate([
            {
                $match: {
                    sender: 'user' // Only get chats where users have sent messages
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$chat_session_id',
                    userId: { $first: '$userId' },
                    user_details: { $first: '$user_details' },
                    lastMessage: { $first: '$message' },
                    lastMessageTime: { $first: '$createdAt' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ['$sender', 'user'] },
                                    { $ne: ['$is_read', true] }
                                ]},
                                1,
                                0
                            ]
                        }
                    },
                    status: { $first: '$status' }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ])

        // Populate user details if userId exists
        const populatedChats = await Promise.all(
            chatSessions.map(async (chat) => {
                if (chat.userId) {
                    const user = await UserModel.findById(chat.userId).select('name email avatar').lean()
                    if (user) {
                        chat.user_details = {
                            name: user.name,
                            email: user.email,
                            avatar: user.avatar,
                            ...chat.user_details
                        }
                    }
                }
                return chat
            })
        )

        return response.json({
            message: "Active chats retrieved",
            error: false,
            success: true,
            data: populatedChats
        })

    } catch (error) {
        console.error("Get active chats error:", error)
        return response.status(500).json({
            message: error.message || "Failed to get active chats",
            error: true,
            success: false
        })
    }
}

