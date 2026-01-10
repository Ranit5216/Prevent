import React, { useState, useRef, useEffect } from 'react'
import { FaComments, FaPaperPlane, FaSpinner, FaUser, FaCircle, FaTimes } from 'react-icons/fa'
import { io } from 'socket.io-client'
import { baseURL } from '../common/SummaryApi'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const AdminChat = () => {
  const user = useSelector((state) => state?.user) || {}
  const [activeChats, setActiveChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Load active chats
  useEffect(() => {
    loadActiveChats()
  }, [])

  // Initialize Socket.io
  useEffect(() => {
    const socketConnection = io(baseURL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socketConnection.on('connect', () => {
      setIsConnected(true)
      // Admin connected to Socket.io
    })

    socketConnection.on('disconnect', () => {
      setIsConnected(false)
    })

    socketConnection.on('receive-message', (data) => {
      if (selectedChat && data.chatSessionId === selectedChat.chat_session_id) {
        setMessages(prev => [...prev, {
          id: data.id || Date.now(),
          sender: data.sender,
          text: data.text,
          time: data.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        }])
      }
      // Refresh active chats to show new messages
      loadActiveChats()
    })

    setSocket(socketConnection)

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat.chat_session_id)
      if (socket && isConnected) {
        socket.emit('join-chat', selectedChat.chat_session_id)
      }
    }
  }, [selectedChat, socket, isConnected])

  const loadActiveChats = async () => {
    try {
      setIsLoading(true)
      const response = await Axios({
        ...SummaryApi.getAllActiveChats
      })

      if (response.data.success) {
        const chats = response.data.data || []
        // Transform the data to match our format
        const formattedChats = chats.map(chat => ({
          chat_session_id: chat._id,
          user_details: chat.user_details || {},
          userId: chat.userId,
          lastMessage: chat.lastMessage || 'No messages',
          lastMessageTime: chat.lastMessageTime,
          unreadCount: chat.unreadCount || 0,
          status: chat.status || 'open'
        }))
        setActiveChats(formattedChats)
      }
    } catch (error) {
      // Failed to load active chats
      AxiosToastError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatMessages = async (chatSessionId) => {
    try {
      const response = await Axios({
        ...SummaryApi.getChatHistory,
        params: {
          chatSessionId: chatSessionId
        }
      })

      if (response.data.success) {
        const chatMessages = response.data.data || []
        setMessages(chatMessages.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        })))
      }
    } catch (error) {
      // Failed to load chat messages
      AxiosToastError(error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedChat) {
      return
    }

    const messageText = messageInput.trim()
    setMessageInput('')

    // Optimistically add message
    const tempMessage = {
      id: Date.now(),
      sender: 'admin',
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      // Save message to database
      await Axios({
        ...SummaryApi.saveChatMessage,
        data: {
          message: messageText,
          sender: 'admin',
          chatSessionId: selectedChat.chat_session_id
        }
      })

      // Send via Socket.io
      if (socket && isConnected) {
        socket.emit('send-message', {
          message: messageText,
          sender: 'admin',
          chatSessionId: selectedChat.chat_session_id
        })
      }

      // Refresh active chats
      loadActiveChats()
    } catch (error) {
      // Failed to send message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      AxiosToastError(error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className='min-h-screen bg-[#F5F5F5] p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-xl shadow-md mb-4 sm:mb-6 p-4 sm:p-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-[#111827] mb-2 flex items-center gap-3'>
            <FaComments className='text-[#DC2626]' />
            Admin Chat Support
          </h1>
          <p className='text-gray-600 text-sm sm:text-base'>
            Manage and respond to customer chat messages in real-time
          </p>
          <div className='mt-4 flex items-center gap-2'>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className='text-sm text-gray-600'>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
          {/* Active Chats List */}
          <div className='lg:col-span-1 bg-white rounded-xl shadow-md p-4 sm:p-6'>
            <h2 className='text-xl font-bold text-[#111827] mb-4'>Active Chats</h2>
            
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <FaSpinner className='animate-spin text-4xl text-[#DC2626]' />
              </div>
            ) : activeChats.length === 0 ? (
              <div className='text-center py-8'>
                <FaComments className='text-4xl text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500'>No active chats</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {activeChats.map((chat) => (
                  <div
                    key={chat.chat_session_id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedChat?.chat_session_id === chat.chat_session_id
                        ? 'border-[#DC2626] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold flex-shrink-0'>
                          {chat.user_details?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='font-semibold text-sm sm:text-base text-[#111827] truncate'>
                            {chat.user_details?.name || 'Unknown User'}
                          </div>
                          <div className='text-xs text-gray-500 truncate'>
                            {chat.user_details?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className='bg-[#DC2626] text-white text-xs font-bold px-2 py-1 rounded-full'>
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                      {chat.lastMessage}
                    </p>
                    <div className='text-xs text-gray-400'>
                      {formatTime(chat.lastMessageTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className='lg:col-span-2 bg-white rounded-xl shadow-md flex flex-col' style={{ height: 'calc(100vh - 200px)' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className='bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-white text-[#DC2626] flex items-center justify-center font-bold'>
                      {selectedChat.user_details?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className='font-bold text-sm sm:text-base'>
                        {selectedChat.user_details?.name || 'Unknown User'}
                      </div>
                      <div className='text-xs opacity-90'>
                        {selectedChat.user_details?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedChat(null)}
                    className='lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors'
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Messages */}
                <div className='flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F5F5F5]'>
                  {messages.length === 0 ? (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-center'>
                        <FaComments className='text-4xl text-gray-300 mx-auto mb-4' />
                        <p className='text-gray-600'>No messages yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.sender === 'admin' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                            message.sender === 'admin' ? 'bg-[#DC2626] text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {message.sender === 'admin' ? (user?.name?.charAt(0)?.toUpperCase() || 'A') : (selectedChat.user_details?.name?.charAt(0)?.toUpperCase() || 'U')}
                          </div>
                          <div style={{ maxWidth: '70%' }} className={message.sender === 'admin' ? 'text-right' : ''}>
                            <div
                              className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base ${
                                message.sender === 'admin'
                                  ? 'bg-[#DC2626] text-white rounded-br-sm'
                                  : 'bg-white shadow-sm rounded-bl-sm'
                              }`}
                            >
                              {message.text}
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                              {message.time}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className='p-4 border-t border-gray-200 bg-white'>
                  <form onSubmit={handleSendMessage} className='flex gap-3'>
                    <input
                      type='text'
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                      placeholder='Type your message...'
                      className='flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all'
                    />
                    <button
                      type='submit'
                      disabled={!messageInput.trim() || !isConnected}
                      className='px-4 sm:px-6 py-3 bg-[#DC2626] text-white rounded-lg font-semibold hover:bg-[#991B1B] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2'
                    >
                      <FaPaperPlane />
                      <span className='hidden sm:inline'>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <FaComments className='text-6xl text-gray-300 mx-auto mb-4' />
                  <p className='text-gray-600 text-lg'>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminChat

