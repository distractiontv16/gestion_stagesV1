// Service Worker INSTI - Version simplifiée basée sur le tutoriel YouTube
console.log('[SW] Service Worker INSTI chargé');

const CACHE_NAME = 'insti-stages-v3';

// Placeholder pour VitePWA (requis pour le build)
self.__WB_MANIFEST;

// Installation du service worker - Version simplifiée
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du service worker INSTI v3');
  // Force l'activation immédiate comme dans le tutoriel
  self.skipWaiting();
});

// Activation du service worker - Version simplifiée
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du service worker');
  // Prend le contrôle immédiatement comme dans le tutoriel
  self.clients.claim();
});

// Gestion des notifications push - Version simplifiée basée sur le tutoriel
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue:', event);

  // Récupération des données comme dans le tutoriel
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

  // Configuration de la notification comme dans le tutoriel
  const options = {
    body: data.message || 'Nouvelle notification INSTI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-urgent.png',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '🔗 Ouvrir Maintenant'
      }
    ],
    data: {
      url: data.targetUrl || '/student/dashboard',
      notificationId: data.notificationId
    },
    tag: 'insti-notification'
  };

  // Affichage de la notification comme dans le tutoriel
  event.waitUntil(
    self.registration.showNotification('🎓 INSTI - URGENT', options)
  );
});

// Gestion des clics sur les notifications - Version simplifiée basée sur le tutoriel
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification:', event.action);

  event.notification.close();

  const notificationData = event.notification.data;
  const url = notificationData?.url || '/student/dashboard';

  // Gestion spéciale pour les tests locaux
  if (event.notification.tag === 'test-local-sw') {
    console.log('[SW] Test local détecté - notification fonctionnelle !');
    return;
  }

  // Ouvrir l'application comme dans le tutoriel
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher si une fenêtre est déjà ouverte
        for (let client of clientList) {
          if (client.url.includes('/student/dashboard') && 'focus' in client) {
            client.focus();
            return client.navigate(url);
          }
        }

        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service Worker INSTI chargé et prêt');
