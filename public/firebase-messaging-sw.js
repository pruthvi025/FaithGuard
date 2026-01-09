// Service Worker for Firebase Cloud Messaging
// This file must be in the public directory to be accessible

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
// Note: This uses environment variables that are injected at build time
// For development, you may need to hardcode values or use a different approach

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

firebase.initializeApp(firebaseConfig)

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'FaithGuard'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/vite.svg', // You can customize this icon
    badge: '/vite.svg',
    tag: payload.data?.itemId || 'default', // Prevent duplicate notifications
    data: payload.data || {},
    requireInteraction: false,
    silent: false,
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.')

  event.notification.close()

  // Extract data from notification
  const data = event.notification.data || {}
  const itemId = data.itemId

  // Open the app and navigate to the relevant item
  const urlToOpen = itemId ? `/item/${itemId}` : '/home'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
