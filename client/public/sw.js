// Cache versioning
const CACHE_VERSION = 'v2'
const CACHE_NAME = `preevent-${CACHE_VERSION}`
const STATIC_CACHE = `preevent-static-${CACHE_VERSION}`
const IMAGE_CACHE = `preevent-images-${CACHE_VERSION}`
const API_CACHE = `preevent-api-${CACHE_VERSION}`

// Cache size limits (in MB)
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB

// Static assets to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
}

// Determine cache strategy based on request
const getCacheStrategy = (request) => {
  const url = new URL(request.url)
  
  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST
  }
  
  // Images - cache first with network fallback
  if (request.destination === 'image') {
    return CACHE_STRATEGIES.CACHE_FIRST
  }
  
  // Static assets (JS, CSS) - stale while revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
  }
  
  // HTML documents - network first
  if (request.destination === 'document') {
    return CACHE_STRATEGIES.NETWORK_FIRST
  }
  
  // Default - stale while revalidate
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
}

// Get appropriate cache name
const getCacheName = (request) => {
  if (request.url.includes('/api/')) return API_CACHE
  if (request.destination === 'image') return IMAGE_CACHE
  return STATIC_CACHE
}

// Cache First Strategy
const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return offline fallback if available
    if (request.destination === 'image') {
      return new Response('', { status: 404 })
    }
    throw error
  }
}

// Network First Strategy
const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// Stale While Revalidate Strategy
const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  // Fetch fresh data in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => null)
  
  // Return cached version immediately if available
  if (cached) {
    return cached
  }
  
  // Otherwise wait for network
  return fetchPromise || new Response('', { status: 404 })
}

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('Cache install failed:', error)
      })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests that we can't cache
  const url = new URL(event.request.url)
  if (url.origin !== location.origin && !event.request.url.includes('/api/')) {
    return
  }

  const strategy = getCacheStrategy(event.request)
  const cacheName = getCacheName(event.request)

  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case CACHE_STRATEGIES.CACHE_FIRST:
            return await cacheFirst(event.request, cacheName)
          
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return await networkFirst(event.request, cacheName)
          
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return await staleWhileRevalidate(event.request, cacheName)
          
          case CACHE_STRATEGIES.NETWORK_ONLY:
            return await fetch(event.request)
          
          default:
            return await staleWhileRevalidate(event.request, cacheName)
        }
      } catch (error) {
        // Fallback for document requests
        if (event.request.destination === 'document') {
          const fallback = await caches.match('/index.html')
          if (fallback) return fallback
        }
        throw error
      }
    })()
  )
})

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: 'PreEvent', body: event.data.text() || 'You have a new notification' }
    }
  }

  const title = data.title || 'PreEvent'
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/src/assets/preevent-new-logo.png',
    badge: data.badge || '/src/assets/preevent-new-logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'preevent-notification',
    requireInteraction: false,
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Order'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action
  const url = event.notification.data.url || '/'

  if (action === 'close') {
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

