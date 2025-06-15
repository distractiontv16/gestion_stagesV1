const CACHE_NAME = 'insti-stages-v2';
const urlsToCache = [
  '/',
  '/student/dashboard',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du service worker INSTI v2');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert');
        return cache.addAll(urlsToCache.filter(url => url !== '/'));
      })
      .then(() => {
        console.log('[SW] Ressources mises en cache avec succès');
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de la mise en cache:', error);
        // Continue même en cas d'erreur pour certaines ressources
      })
  );
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prend le contrôle immédiatement
  self.clients.claim();
});

// Gestion des requêtes (stratégie cache-first pour les assets, network-first pour les API)
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network-first pour les API
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Pas de connexion internet' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
  } else {
    // Cache-first pour les autres ressources
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue:', event);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
    console.log('[SW] Données push reçues:', data);
  } catch (error) {
    console.error('[SW] Erreur parsing des données push:', error);
    data = {
      title: 'INSTI - Notification',
      message: 'Nouvelle notification INSTI',
      notificationId: 'fallback-' + Date.now()
    };
  }
  
  const options = {
    body: data.message || 'Nouvelle notification INSTI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-urgent.png',
    requireInteraction: true,
    persistent: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: '🔗 Ouvrir Maintenant',
        icon: '/icons/open-icon.png'
      },
      {
        action: 'snooze',
        title: '⏰ Dans 1h',
        icon: '/icons/snooze-icon.png'
      }
    ],
    data: {
      studentId: data.studentId,
      notificationId: data.notificationId,
      url: data.targetUrl || '/student/dashboard',
      timestamp: Date.now()
    },
    tag: 'insti-notification-' + (data.notificationId || Date.now()),
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification('🎓 INSTI - URGENT', options)
      .then(() => {
        console.log('[SW] Notification affichée avec succès');
        // Marquer la notification comme délivrée
        return fetch('/api/push/mark-delivered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: data.notificationId,
            deliveredAt: new Date().toISOString()
          })
        }).catch(err => console.log('[SW] Erreur marquage livraison:', err));
      })
      .catch((error) => {
        console.error('[SW] Erreur affichage notification:', error);
      })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification:', event.action, event.notification.tag);

  event.notification.close();

  const notificationData = event.notification.data;

  // Gestion spéciale pour les tests locaux
  if (event.notification.tag === 'test-local-sw') {
    console.log('[SW] Test local détecté - notification fonctionnelle !');
    if (event.action === 'test-ok') {
      console.log('[SW] Utilisateur a confirmé que le test fonctionne');
    }
    return;
  }
  
  if (event.action === 'open') {
    // Ouvrir l'application
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const url = notificationData.url || '/student/dashboard';
          
          // Chercher si une fenêtre est déjà ouverte
          for (let client of clientList) {
            if (client.url.includes('/student/dashboard') && 'focus' in client) {
              client.focus();
              client.navigate(url);
              return;
            }
          }
          
          // Ouvrir une nouvelle fenêtre
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
        .then(() => {
          // Marquer la notification comme ouverte
          return fetch('/api/push/mark-opened', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notificationId: notificationData.notificationId,
              openedAt: new Date().toISOString()
            })
          }).catch(err => console.log('[SW] Erreur marquage ouverture:', err));
        })
    );
  } else if (event.action === 'snooze') {
    // Programmer une nouvelle notification dans 1h
    event.waitUntil(
      fetch('/api/push/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notificationData.notificationId,
          snoozeMinutes: 60
        })
      }).catch(err => console.log('[SW] Erreur snooze:', err))
    );
  } else {
    // Clic par défaut (sur le corps de la notification)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const url = notificationData.url || '/student/dashboard';
          
          for (let client of clientList) {
            if (client.url.includes('/student/dashboard') && 'focus' in client) {
              client.focus();
              client.navigate(url);
              return;
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
        .then(() => {
          // Marquer comme ouverte
          return fetch('/api/push/mark-opened', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notificationId: notificationData.notificationId,
              openedAt: new Date().toISOString()
            })
          }).catch(err => console.log('[SW] Erreur marquage ouverture:', err));
        })
    );
  }
});

// Gestion des erreurs de push
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Changement d\'abonnement push');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BGpP0bGg3XCRT0xOvW1jEbOAZeHQh7YjGgze1uLZYB9uY2ceAOeU4X4AhHu0T9sxGmTmzBNB-fSajJXI5QPaypo'
    })
    .then((subscription) => {
      return fetch('/api/push/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    })
    .catch(err => console.log('[SW] Erreur réabonnement:', err))
  );
});

console.log('[SW] Service Worker INSTI chargé et prêt');

// Spécial pour Brave Browser - Force l'enregistrement
if (navigator.userAgent.includes('Brave')) {
  console.log('[SW] Brave Browser détecté - Configuration spéciale');

  // Force l'activation immédiate pour Brave
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
}
