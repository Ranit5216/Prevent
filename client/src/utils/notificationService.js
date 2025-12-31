// Push Notification Service
class NotificationService {
  constructor() {
    this.registration = null
    this.subscription = null
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      return { granted: false, error: 'This browser does not support notifications' }
    }

    if (Notification.permission === 'granted') {
      return { granted: true, message: 'Notifications already enabled' }
    }

    if (Notification.permission === 'denied') {
      return { granted: false, error: 'Notifications are blocked. Please enable them in browser settings.' }
    }

    try {
      const permission = await Notification.requestPermission()
      return {
        granted: permission === 'granted',
        error: permission === 'denied' ? 'Notification permission denied' : null
      }
    } catch (error) {
      return { granted: false, error: 'Error requesting permission: ' + error.message }
    }
  }

  // Register service worker and get subscription
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return { success: false, error: 'Service workers are not supported' }
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return { success: true, registration: this.registration }
    } catch (error) {
      // Try to register if not ready
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
        return { success: true, registration: this.registration }
      } catch (regError) {
        return { success: false, error: 'Failed to register service worker: ' + regError.message }
      }
    }
  }

  // Get push subscription
  async getSubscription() {
    if (!this.registration) {
      const regResult = await this.registerServiceWorker()
      if (!regResult.success) {
        return { success: false, error: regResult.error }
      }
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription()
      return { success: true, subscription: this.subscription }
    } catch (error) {
      return { success: false, error: 'Failed to get subscription: ' + error.message }
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    console.log('🔔 Starting push notification subscription process...')
    
    // Check permission first
    console.log('📋 Step 1: Checking notification permission...')
    const permissionResult = await this.requestPermission()
    if (!permissionResult.granted) {
      console.error('❌ Permission denied:', permissionResult.error)
      return { success: false, error: permissionResult.error }
    }
    console.log('✅ Permission granted')

    // Register service worker
    console.log('📋 Step 2: Registering service worker...')
    const regResult = await this.registerServiceWorker()
    if (!regResult.success) {
      console.error('❌ Service worker registration failed:', regResult.error)
      return { success: false, error: regResult.error }
    }
    console.log('✅ Service worker registered')

    try {
      // Check if already subscribed
      console.log('📋 Step 3: Checking existing subscription...')
      const existingSub = await this.registration.pushManager.getSubscription()
      if (existingSub) {
        console.log('ℹ️ Already subscribed, using existing subscription')
        this.subscription = existingSub
        return { success: true, subscription: existingSub, message: 'Already subscribed' }
      }

      // Create new subscription
      console.log('📋 Step 4: Creating new push subscription...')
      // VAPID key is optional - will work without it but may have limitations
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      const subscriptionOptions = {
        userVisibleOnly: true
      }
      
      if (vapidKey) {
        console.log('🔑 Using VAPID key for subscription')
        const applicationServerKey = this.urlBase64ToUint8Array(vapidKey)
        if (applicationServerKey && applicationServerKey.length > 0) {
          subscriptionOptions.applicationServerKey = applicationServerKey
        }
      } else {
        console.warn('⚠️ No VAPID key found - subscription may have limitations')
      }

      console.log('📤 Subscribing to push manager...')
      this.subscription = await this.registration.pushManager.subscribe(subscriptionOptions)
      console.log('✅ Push subscription created successfully!', {
        endpoint: this.subscription.endpoint.substring(0, 50) + '...'
      })

      return { success: true, subscription: this.subscription }
    } catch (error) {
      console.error('❌ Subscription error:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      return { success: false, error: 'Failed to subscribe: ' + error.message }
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (!this.registration) {
        const regResult = await this.registerServiceWorker()
        if (!regResult.success) {
          return { success: false, error: regResult.error }
        }
      }

      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        this.subscription = null
        return { success: true, message: 'Unsubscribed successfully' }
      }

      return { success: true, message: 'Not subscribed' }
    } catch (error) {
      return { success: false, error: 'Failed to unsubscribe: ' + error.message }
    }
  }

  // Check if user is subscribed
  async isSubscribed() {
    try {
      if (!this.registration) {
        const regResult = await this.registerServiceWorker()
        if (!regResult.success) {
          return false
        }
      }

      const subscription = await this.registration.pushManager.getSubscription()
      return !!subscription
    } catch (error) {
      return false
    }
  }

  // Convert VAPID key from URL base64 to Uint8Array
  urlBase64ToUint8Array(base64String) {
    if (!base64String) return new Uint8Array(0)
    
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Show local notification (for testing)
  async showLocalNotification(title, options = {}) {
    const permissionResult = await this.requestPermission()
    if (!permissionResult.granted) {
      return { success: false, error: permissionResult.error }
    }

    try {
      const notification = new Notification(title, {
        icon: '/src/assets/preevent-new-logo.png',
        badge: '/src/assets/preevent-new-logo.png',
        ...options
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        if (options.url) {
          window.location.href = options.url
        }
      }

      return { success: true, notification }
    } catch (error) {
      return { success: false, error: 'Failed to show notification: ' + error.message }
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService()
export default notificationService

