# 🧪 How to Test Push Notifications - Step by Step

## Quick Debugging Steps

### Step 1: Check Browser Console
1. Open your website
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for any red errors
5. Check for messages about service worker registration

### Step 2: Check Service Worker
1. In Developer Tools, go to Application tab
2. Click "Service Workers" in left sidebar
3. You should see your service worker registered
4. Status should be "activated and is running"

### Step 3: Check Notification Permission
1. In Application tab, click "Notifications" in left sidebar
2. Check if your site is listed
3. Permission should be "Allow" or "Default"

### Step 4: Check Network Requests
1. Go to Network tab in Developer Tools
2. Filter by "subscribe" or "notification"
3. Place an order or update order status
4. Look for POST request to `/api/notifications/subscribe`
5. Should return status 200

### Step 5: Test Manually in Console
Open browser console and run:

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistration().then(reg => console.log('SW:', reg))

// Check notification permission
console.log('Permission:', Notification.permission)

// Check if subscribed
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub ? 'YES' : 'NO')
    if (sub) console.log('Endpoint:', sub.endpoint)
  })
})
```

### Step 6: Check Server Logs
1. Look at your backend terminal
2. When order updates, you should see:
   - "Push notification sent successfully" (if working)
   - OR "VAPID keys not configured" (if keys missing)
   - OR "User not subscribed" (if user hasn't enabled)

### Step 7: Common Issues

**Issue: "VAPID keys not configured"**
- Solution: Add VAPID keys to server/.env and client/.env
- Restart both servers

**Issue: "User not subscribed"**
- Solution: User needs to enable notifications
- Click "Enable Notifications" button
- Allow in browser

**Issue: Service worker not registered**
- Solution: Check browser console for errors
- Make sure /sw.js file exists in public folder
- Try hard refresh (Ctrl+Shift+R)

**Issue: Permission denied**
- Solution: Go to browser settings
- Find your site in notifications
- Change to "Allow"

### Step 8: Force Test Notification
Add this to browser console to test:

```javascript
// Test local notification
new Notification('Test Notification', {
  body: 'This is a test',
  icon: '/src/assets/preevent-new-logo.png'
})
```

If this works, push notifications should work too!

