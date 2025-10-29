/**
 * Service Worker Registration for GiftBuddy PWA
 * Handles registration, updates, and lifecycle events
 */

export async function registerServiceWorker() {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('✅ Service Worker registered successfully', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // New service worker available
          console.log('New version available! Refresh to update.');

          // Show update notification (optional)
          showUpdateNotification();
        }
      });
    });

    // Handle controller change (new version activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

// Show update notification
function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('GiftBuddy Update', {
      body: 'A new version is available. Refresh to get the latest features!',
      icon: '/gift.png',
      badge: '/gift.svg',
    });
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Install PWA prompt handler
export function setupInstallPrompt() {
  let deferredPrompt: Event | null = null;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Install prompt available');
  });

  return {
    canInstall: () => deferredPrompt !== null,
    install: async () => {
      if (!deferredPrompt) return false;

      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      console.log(`User response to install prompt: ${outcome}`);

      deferredPrompt = null;
      return outcome === 'accepted';
    },
  };
}
