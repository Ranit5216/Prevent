import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: function() {
            // userId is required only for user messages, not for admin/support messages
            return this.sender === 'user'
        }
    },
    user_details: {
        name: String,
        email: String,
        avatar: String
    },
    message: {
        type: String,
        required: [true, "Message is required"]
    },
    sender: {
        type: String,
        enum: ['user', 'admin', 'support'],
        default: 'user'
    },
    admin_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    is_read: {
        type: Boolean,
        default: false
    },
    chat_session_id: {
        type: String,
        required: true,
        index: true
    }
}, {
    timestamps: true
})

// Index for faster queries
chatSchema.index({ chat_session_id: 1, createdAt: -1 })
chatSchema.index({ userId: 1, createdAt: -1 })
chatSchema.index({ status: 1 })

const ChatModel = mongoose.model('chat', chatSchema)

export default ChatModel

