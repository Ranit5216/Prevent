import React, { useState, useRef, useEffect } from 'react'
import { FaComments, FaQuestionCircle, FaLifeRing, FaEnvelope, FaPaperPlane, FaChevronDown, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { io } from 'socket.io-client'
import { baseURL } from '../common/SummaryApi'

const CustomerSupport = () => {
  const user = useSelector((state) => state?.user) || {}
  const [chatOpen, setChatOpen] = useState(true)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [chatSessionId, setChatSessionId] = useState(null)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(true)
  const [activeFAQ, setActiveFAQ] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: 'General Inquiry',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef(null)
  const chatMessagesRef = useRef(null)

  const faqs = [
    {
      category: 'Booking',
      question: 'How do I book a service?',
      answer: 'To book a service, browse our categories, select the service you need, choose your preferred date and time slot, add it to cart, and proceed to checkout. Payment is made via cash on booking or direct payment to the vendor.'
    },
    {
      category: 'Booking',
      question: 'Can I modify my booking after confirmation?',
      answer: 'Yes, you can modify your booking if it\'s still pending. Go to "My Booking" and click on "Modify Order". For accepted orders, please contact our support team through live chat or create a support ticket.'
    },
    {
      category: 'Cancellation',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking if it\'s still pending. Go to "My Booking" and click on "Cancel Order". For accepted orders, please contact our support team. Refund policies apply based on the cancellation timing.'
    },
    {
      category: 'Cancellation',
      question: 'What is the refund policy?',
      answer: 'Since we accept cash payments and direct payments to vendors, refunds are processed directly with the vendor. For cancellations made 48 hours before the event, full refund is provided. For cancellations within 48 hours, a partial refund may apply based on vendor policies. Please contact our support team or the vendor directly for refund processing. Refunds are typically processed within 5-7 business days via cash or bank transfer.'
    },
    {
      category: 'Payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept cash on booking and direct payments to vendors. Payment can be made in cash at the time of booking or directly to the service provider. We do not process online transactions through our platform.'
    },
    {
      category: 'Payment',
      question: 'How do I make payment?',
      answer: 'Payment is made directly to the vendor either in cash at the time of booking or as agreed upon with the service provider. Our platform facilitates the booking process, and payment arrangements are made directly with the vendor.'
    },
    {
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by going to "My Account" > "Profile". You can change your name, email, phone number, and profile picture from there.'
    },
    {
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Click on "Login" and then "Forgot Password". Enter your registered email address and you will receive a password reset link. Follow the instructions in the email to reset your password.'
    },
    {
      category: 'General',
      question: 'How can I contact customer support?',
      answer: 'You can contact us through live chat (available 24/7), support tickets, email, or phone. Our support team is always ready to help you with any questions or issues.'
    },
    {
      category: 'General',
      question: 'What are your business hours?',
      answer: 'Our customer support is available 24/7 through live chat. For phone support, we are available Monday to Saturday, 9 AM to 8 PM IST. Email support responses are typically within 24 hours.'
    }
  ]

  const filteredFAQs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Initialize Socket.io connection and load chat history
  useEffect(() => {
    if (!user?._id) {
      setIsLoadingChat(false)
      return
    }

    const initializeChat = async () => {
      try {
        // Get or create chat session
        const sessionResponse = await Axios({
          ...SummaryApi.getChatSession
        })

        if (sessionResponse.data.success) {
          const { chatSessionId: sessionId, messages: chatHistory } = sessionResponse.data.data
          setChatSessionId(sessionId)
          setMessages(chatHistory.map(msg => ({
            id: msg._id || Date.now(),
            sender: msg.sender,
            text: msg.message,
            time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          })))

          // Connect to Socket.io
          const socketConnection = io(baseURL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
          })

          socketConnection.on('connect', () => {
            setIsConnected(true)
            socketConnection.emit('join-chat', sessionId)
          })

          socketConnection.on('disconnect', () => {
            setIsConnected(false)
          })

          socketConnection.on('receive-message', (data) => {
            setMessages(prev => [...prev, {
              id: data.id || Date.now(),
              sender: data.sender,
              text: data.text,
              time: data.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            }])
          })

          socketConnection.on('error', (error) => {
            // Socket error handled
            toast.error(error.message || 'Connection error')
          })

          setSocket(socketConnection)
        }
      } catch (error) {
        // Failed to initialize chat
        // If user is not logged in, show welcome message
        if (!user?._id) {
          setMessages([{
            id: 1,
            sender: 'support',
            text: 'Hello! Please log in to start chatting with our support team.',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          }])
        } else {
          AxiosToastError(error)
        }
      } finally {
        setIsLoadingChat(false)
      }
    }

    initializeChat()

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user?._id])

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom()
    }
  }, [messages, chatOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!user?._id) {
      toast.error('Please log in to send messages')
      return
    }

    if (!chatSessionId) {
      toast.error('Chat session not initialized')
      return
    }

    const messageText = messageInput.trim()
    setMessageInput('')

    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(),
      sender: 'user',
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
          sender: 'user',
          chatSessionId: chatSessionId
        }
      })

      // Send message via Socket.io
      if (socket && isConnected) {
        socket.emit('send-message', {
          message: messageText,
          sender: 'user',
          chatSessionId: chatSessionId
        })
      }
    } catch (error) {
      // Failed to send message
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      AxiosToastError(error)
    }
  }

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await Axios({
        ...SummaryApi.contactForm,
        data: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Your message has been sent! We will get back to you soon.')
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          subject: 'General Inquiry',
          message: ''
        })
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className='min-h-screen bg-[#F5F5F5] py-4 sm:py-6 md:py-8'>
      <div className='container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-md'>
          <h1 className='font-["Playfair_Display",serif] text-3xl sm:text-4xl md:text-5xl text-[#DC2626] mb-2 sm:mb-3'>
            💬 Customer Support
          </h1>
          <p className='text-gray-600 text-sm sm:text-base md:text-lg'>
            We're here to help you with any questions or issues.
          </p>
        </div>

        {/* Live Chat Section */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8'>
          <div className='flex items-center justify-between mb-4 sm:mb-6'>
            <h2 className='text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2 sm:gap-3'>
              <FaComments className='text-[#DC2626] text-xl sm:text-2xl' />
              <span className='hidden sm:inline'>Live Chat Support</span>
              <span className='sm:hidden'>Live Chat</span>
            </h2>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              aria-label={chatOpen ? 'Minimize chat' : 'Expand chat'}
            >
              {chatOpen ? <FaChevronDown className='text-gray-600' /> : <FaComments className='text-[#DC2626]' />}
            </button>
          </div>

          {chatOpen && (
            <div className='border-2 border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col h-[350px] sm:h-[450px] md:h-[500px]'>
              {/* Chat Header */}
              <div className='bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white p-3 sm:p-4 flex justify-between items-center'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-[#00b050] animate-pulse' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className='font-bold text-xs sm:text-sm md:text-base'>Support Team</div>
                    <div className='text-xs sm:text-sm opacity-90'>
                      {isLoadingChat ? 'Connecting...' : isConnected ? 'Online - Usually replies in 2 minutes' : 'Connecting...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatMessagesRef}
                className='flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#F5F5F5]'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#DC2626 #F3F4F6'
                }}
              >
                {isLoadingChat ? (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                      <FaSpinner className='animate-spin text-4xl text-[#DC2626] mx-auto mb-4' />
                      <p className='text-gray-600'>Loading chat...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                      <FaComments className='text-4xl text-gray-300 mx-auto mb-4' />
                      <p className='text-gray-600'>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 sm:mb-4 flex gap-2 sm:gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm`}>
                      {message.sender === 'user' ? (user?.name?.charAt(0)?.toUpperCase() || 'U') : 'ST'}
                    </div>
                    <div className={`max-w-[75%] sm:max-w-[70%] md:max-w-[65%]`}>
                      <div
                        className={`p-2.5 sm:p-3 md:p-4 rounded-xl text-xs sm:text-sm md:text-base ${
                          message.sender === 'user'
                            ? 'bg-[#DC2626] text-white rounded-br-sm'
                            : 'bg-white shadow-sm rounded-bl-sm'
                        }`}
                      >
                        {message.text}
                      </div>
                      <div className={`text-[10px] sm:text-xs text-[#6B7280] mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.time}
                      </div>
                    </div>
                  </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className='p-2 sm:p-3 md:p-4 bg-white border-t-2 border-[#E5E7EB] flex gap-2 sm:gap-3'>
                <input
                  type='text'
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                  placeholder={!user?._id ? 'Please log in to send messages' : 'Type your message...'}
                  disabled={!user?._id || !isConnected}
                  className='flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !user?._id || !isConnected || isLoadingChat}
                  className='px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-[#DC2626] text-white border-none rounded-lg font-semibold text-sm sm:text-base hover:bg-[#991B1B] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2'
                >
                  <FaPaperPlane className='text-xs sm:text-sm' />
                  <span className='hidden sm:inline'>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8'>
          <h2 className='text-xl sm:text-2xl font-bold text-[#111827] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3'>
            <FaQuestionCircle className='text-[#DC2626] text-xl sm:text-2xl' />
            Frequently Asked Questions
          </h2>

          {/* FAQ Categories */}
          <div className='flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6'>
            {['All', 'Booking', 'Payment', 'Cancellation', 'Account', 'General'].map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category)
                  setActiveFAQ(null)
                }}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                  activeCategory === category
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md'
                    : 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-[#FEE2E2] hover:border-[#DC2626]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          {filteredFAQs.length === 0 ? (
            <div className='text-center py-8 sm:py-12'>
              <FaQuestionCircle className='text-4xl sm:text-5xl text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 text-sm sm:text-base'>No FAQs found in this category.</p>
            </div>
          ) : (
            <div className='space-y-3 sm:space-y-4'>
              {filteredFAQs.map((faq, index) => {
                const globalIndex = faqs.indexOf(faq)
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-xl overflow-hidden transition-all ${
                      activeFAQ === globalIndex ? 'border-[#DC2626] shadow-md' : 'border-[#E5E7EB]'
                    }`}
                  >
                    <div
                      onClick={() => toggleFAQ(globalIndex)}
                      className='p-4 sm:p-5 md:p-6 cursor-pointer flex justify-between items-center font-semibold hover:bg-[#FEE2E2] transition-all'
                    >
                      <span className='text-sm sm:text-base md:text-lg pr-4'>{faq.question}</span>
                      <FaChevronDown
                        className={`text-[#DC2626] flex-shrink-0 transition-transform duration-300 ${
                          activeFAQ === globalIndex ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {activeFAQ === globalIndex && (
                      <div className='px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-[#6B7280] text-sm sm:text-base leading-relaxed'>
                      {faq.answer}
                    </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Help Center */}
        <div className='bg-gradient-to-br from-[#FEE2E2] to-white border-2 border-[#DC2626] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8'>
          <h2 className='text-xl sm:text-2xl font-bold text-[#111827] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3'>
            <FaLifeRing className='text-[#DC2626] text-xl sm:text-2xl' />
            Help Center
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
            {[
              { icon: '📖', title: 'User Guide', desc: 'Learn how to use our platform' },
              { icon: '🎥', title: 'Video Tutorials', desc: 'Watch step-by-step guides' },
              { icon: '📄', title: 'Documentation', desc: 'Read detailed documentation' },
              { icon: '🎧', title: '24/7 Support', desc: 'Get help anytime you need' }
            ].map((help, index) => (
              <div
                key={index}
                className='bg-white rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all'
                onClick={() => toast.info(`${help.title} - Coming soon!`)}
              >
                <div className='text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4'>{help.icon}</div>
                <div className='font-bold text-sm sm:text-base mb-2'>{help.title}</div>
                <div className='text-[#6B7280] text-xs sm:text-sm'>{help.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8'>
          <h2 className='text-xl sm:text-2xl font-bold text-[#111827] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3'>
            <FaEnvelope className='text-[#DC2626] text-xl sm:text-2xl' />
            Contact Us
          </h2>
          <form onSubmit={handleFormSubmit} className='space-y-4 sm:space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
              <div className='flex flex-col'>
                <label className='font-semibold mb-2 text-sm sm:text-base'>Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all'
                />
              </div>
              <div className='flex flex-col'>
                <label className='font-semibold mb-2 text-sm sm:text-base'>Email *</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className='px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all'
                />
              </div>
            </div>
            <div className='flex flex-col'>
              <label className='font-semibold mb-2 text-sm sm:text-base'>Subject *</label>
              <select
                name='subject'
                value={formData.subject}
                onChange={handleInputChange}
                required
                className='px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all'
              >
                <option value='General Inquiry'>General Inquiry</option>
                <option value='Booking Issue'>Booking Issue</option>
                <option value='Payment Problem'>Payment Problem</option>
                <option value='Technical Support'>Technical Support</option>
                <option value='Other'>Other</option>
              </select>
            </div>
            <div className='flex flex-col'>
              <label className='font-semibold mb-2 text-sm sm:text-base'>Message *</label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className='px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-all resize-vertical min-h-[120px]'
              ></textarea>
            </div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white border-none rounded-lg font-bold text-sm sm:text-base hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className='animate-spin' />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className='text-sm sm:text-base' />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerSupport
