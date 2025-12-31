import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaBell, FaBellSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import notificationService from '../utils/notificationService'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

const NotificationPermission = () => {
  const user = useSelector(state => state.user)
  const [permission, setPermission] = useState('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return ''
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  useEffect(() => {
    checkNotificationStatus()
  }, [user])

  const checkNotificationStatus = async () => {
    if (!user?._id) {
      setShowPrompt(false)
      return
    }

    // Check browser permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Check subscription status
    const subscribed = await notificationService.isSubscribed()
    setIsSubscribed(subscribed)

    // Show prompt EVERY TIME until permission is granted
    // Remove sessionStorage check - show on every page load until they allow
    if (user?._id && !subscribed) {
      // Only hide if permission is explicitly granted
      if (Notification.permission === 'granted') {
        console.log('✅ Notification permission already granted - prompt hidden')
        setShowPrompt(false)
      } else {
        // Show prompt if permission is 'default' or 'denied'
        // This will show EVERY TIME until they allow
        console.log('🔔 Showing notification prompt (will show every time until allowed)...')
        console.log(`ℹ️ Current permission: "${Notification.permission}"`)
        // Delay showing prompt slightly to ensure page is loaded
        setTimeout(() => {
          console.log('✅ Displaying notification prompt now')
          setShowPrompt(true)
        }, 2000)
      }
    }
    
    // Also show if permission is granted but not subscribed (edge case)
    if (user?._id && Notification.permission === 'granted' && !subscribed) {
      // User granted permission but subscription failed - try to subscribe automatically
      setTimeout(async () => {
        try {
          const result = await notificationService.subscribe()
          if (result.success && result.subscription) {
            const sub = result.subscription
            const subscriptionData = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
                auth: arrayBufferToBase64(sub.getKey('auth'))
              }
            }
            await Axios({
              ...SummaryApi.saveNotificationSubscription,
              data: subscriptionData
            })
            setIsSubscribed(true)
          }
        } catch (error) {
          // Silent fail - user can enable manually
        }
      }, 1000)
    }
  }

  const handleEnableNotifications = async () => {
    if (!user?._id) {
      toast.error('Please login to enable notifications')
      return
    }

    console.log('🔔 User clicked Enable Notifications, User ID:', user._id)
    setLoading(true)
    try {
      // Request permission
      console.log('📋 Requesting notification permission...')
      const permissionResult = await notificationService.requestPermission()
      
      if (!permissionResult.granted) {
        console.error('❌ Permission denied:', permissionResult.error)
        toast.error(permissionResult.error || 'Notification permission denied')
        setPermission('denied')
        setShowPrompt(false)
        setLoading(false)
        return
      }
      console.log('✅ Permission granted!')

      // Subscribe to push notifications
      console.log('🔔 Step 1: Requesting push subscription...')
      const subscribeResult = await notificationService.subscribe()
      
      if (!subscribeResult.success) {
        console.error('❌ Subscription failed:', subscribeResult.error)
        toast.error(subscribeResult.error || 'Failed to enable notifications')
        setLoading(false)
        return
      }

      console.log('✅ Step 2: Subscription successful, sending to backend...')
      // Send subscription to backend
      const subscription = subscribeResult.subscription
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      }

      console.log('📤 Step 3: Sending subscription data to server...', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        hasKeys: !!subscriptionData.keys.p256dh && !!subscriptionData.keys.auth
      })

      try {
        console.log('📤 Making API call to save subscription...')
        const response = await Axios({
          ...SummaryApi.saveNotificationSubscription,
          data: subscriptionData
        })
        
        console.log('✅ Step 4: Subscription saved to backend!', response.data)
        setIsSubscribed(true)
        setPermission('granted')
        setShowPrompt(false)
        toast.success('Notifications enabled! You will receive updates about your orders.')
      } catch (error) {
        console.error('❌ Failed to save subscription to backend:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        // Check if it's a 401 error (not logged in)
        if (error.response?.status === 401) {
          toast.error('Please login again to enable notifications')
          console.error('⚠️ Authentication error - user may need to login again')
        } else {
          AxiosToastError(error)
        }
        
        // Still mark as subscribed locally even if backend save fails
        setIsSubscribed(true)
        setPermission('granted')
      }
    } catch (error) {
      toast.error('Failed to enable notifications')
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setLoading(true)
    try {
      const unsubscribeResult = await notificationService.unsubscribe()
      
      if (unsubscribeResult.success) {
        // Remove from backend
        try {
          await Axios({
            ...SummaryApi.removeNotificationSubscription,
            method: 'delete'
          })
        } catch (error) {
          // Continue even if backend removal fails
        }

        setIsSubscribed(false)
        toast.success('Notifications disabled')
      } else {
        toast.error(unsubscribeResult.error || 'Failed to disable notifications')
      }
    } catch (error) {
      toast.error('Failed to disable notifications')
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }


  // Don't show if user is not logged in
  if (!user?._id) {
    return null
  }

  // Banner prompt for enabling notifications - Centered and Large with Professional Transparent Design
  // Show if permission is 'default' or 'denied' (until they allow)
  if (showPrompt && (permission === 'default' || permission === 'denied') && !isSubscribed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-gray-900/30 to-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 max-w-xl w-full p-10 relative animate-scale-up" style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}>
          <button
            onClick={() => {
              setShowPrompt(false)
              toast.info('Notification prompt will appear again until you enable notifications')
            }}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <FaTimesCircle className="text-2xl" />
          </button>
          
          <div className="flex flex-col items-center text-center">
            {/* Icon with glow effect */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626] to-[#991B1B] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#DC2626] to-[#991B1B] rounded-full flex items-center justify-center shadow-2xl">
                <FaBell className="text-white text-5xl" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Stay Updated!
            </h3>
            
            {/* Description */}
            <p className="text-lg text-gray-600 mb-6 max-w-md leading-relaxed">
              Get instant notifications about your order status updates. Never miss important updates about your bookings!
            </p>
            
            {/* Warning for denied permission */}
            {permission === 'denied' && (
              <div className="bg-amber-50/80 backdrop-blur-sm border-l-4 border-amber-400 p-4 mb-6 rounded-lg max-w-md w-full text-left shadow-md">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Notifications are currently blocked. Please enable them in your browser settings to receive updates.
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-4 w-full max-w-md mt-2">
              <button
                onClick={handleEnableNotifications}
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white rounded-xl font-bold text-lg hover:from-[#EF4444] hover:to-[#DC2626] transition-all disabled:opacity-50 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                style={{
                  boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)'
                }}
              >
                {loading ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                onClick={() => {
                  setShowPrompt(false)
                  toast.info('Notification prompt will appear again until you enable notifications')
                }}
                className="flex-1 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-white hover:border-gray-300 transition-all shadow-md hover:shadow-lg"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Status indicator (optional - can be shown in header or settings)
  return null
}

export default NotificationPermission

