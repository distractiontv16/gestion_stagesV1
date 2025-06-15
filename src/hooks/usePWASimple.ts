import { useState, useEffect, useCallback } from 'react';

// Hook PWA simplifié basé sur le tutoriel YouTube
export const usePWASimple = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Vérifier le support PWA
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);
      setNotificationPermission(Notification.permission);
    };

    checkSupport();
  }, []);

  // Vérifier l'abonnement existant
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
          console.log('✅ Abonnement push existant trouvé');
        }
      } catch (error) {
        console.error('Erreur vérification abonnement:', error);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Demander la permission de notification
  const requestNotificationPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Notifications non supportées');
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission !== 'granted') {
      throw new Error('Permission de notification refusée');
    }

    return permission;
  }, [isSupported]);

  // S'abonner aux notifications push
  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications non supportées');
    }

    try {
      // Demander la permission si nécessaire
      if (notificationPermission !== 'granted') {
        await requestNotificationPermission();
      }

      // Nettoyer les anciens abonnements d'abord (important en développement)
      console.log('🧹 Nettoyage des anciens abonnements...');
      await fetch('/api/push/clean-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Attendre un peu pour que le nettoyage soit effectif
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtenir le service worker
      const registration = await navigator.serviceWorker.ready;

      // Créer l'abonnement avec la clé VAPID
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('Clé VAPID publique manquante');
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Envoyer l'abonnement au serveur
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSubscription)
      });

      if (!response.ok) {
        throw new Error('Erreur serveur lors de l\'abonnement');
      }

      setSubscription(newSubscription);
      setIsSubscribed(true);
      console.log('✅ Abonnement push créé avec succès');

      return newSubscription;
    } catch (error) {
      console.error('Erreur abonnement push:', error);
      throw error;
    }
  }, [isSupported, notificationPermission, requestNotificationPermission]);

  // Se désabonner des notifications push
  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription) return;

    try {
      // Désabonner côté client
      await subscription.unsubscribe();

      // Informer le serveur
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      setSubscription(null);
      setIsSubscribed(false);
      console.log('✅ Désabonnement push réussi');
    } catch (error) {
      console.error('Erreur désabonnement push:', error);
      throw error;
    }
  }, [subscription]);

  // Tester les notifications
  const testNotification = useCallback(async () => {
    if (!isSubscribed) {
      throw new Error('Pas d\'abonnement push actif');
    }

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur serveur lors du test');
      }

      console.log('✅ Notification de test envoyée');
    } catch (error) {
      console.error('Erreur test notification:', error);
      throw error;
    }
  }, [isSubscribed]);

  return {
    // État
    isSupported,
    isSubscribed,
    subscription,
    notificationPermission,
    
    // Actions
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification
  };
};
