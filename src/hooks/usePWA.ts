import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isSupported: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  installPWA: () => Promise<boolean>;
  checkInstallation: () => boolean;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<PushSubscription | null>;
}

export const usePWA = (): PWAState & PWAActions => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Vérifier le support PWA
  useEffect(() => {
    const checkPWASupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = 'manifest' in document.createElement('link');
      const hasPushManager = 'PushManager' in window;
      
      setIsSupported(hasServiceWorker && hasManifest && hasPushManager);
    };

    checkPWASupport();
  }, []);

  // Vérifier si l'app est en mode standalone
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();
    
    // Écouter les changements de mode d'affichage
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);
    
    return () => mediaQuery.removeEventListener('change', checkStandalone);
  }, []);

  // Gérer l'événement beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
      
      console.log('PWA: Prompt d\'installation disponible');
    };

    const handleAppInstalled = () => {
      console.log('PWA: Application installée');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      
      // Marquer l'installation dans la base de données
      fetch('/api/users/mark-pwa-installed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ installedAt: new Date().toISOString() })
      }).catch(err => console.error('Erreur marquage installation PWA:', err));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Fonction pour installer la PWA
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      console.warn('PWA: Aucun prompt d\'installation disponible');
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: Installation acceptée');
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      } else {
        console.log('PWA: Installation refusée');
        return false;
      }
    } catch (error) {
      console.error('PWA: Erreur lors de l\'installation:', error);
      return false;
    }
  }, [installPrompt]);

  // Vérifier si l'installation est effective
  const checkInstallation = useCallback((): boolean => {
    return isStandalone || isInstalled;
  }, [isStandalone, isInstalled]);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications non supportées');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('PWA: Permission notifications:', permission);
      return permission;
    } catch (error) {
      console.error('PWA: Erreur demande permission notifications:', error);
      return 'denied';
    }
  }, []);

  // S'abonner aux notifications push
  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('PWA: Push notifications non supportées');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Vérifier s'il y a déjà un abonnement
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('PWA: Abonnement push existant');
        return existingSubscription;
      }

      // Créer un nouvel abonnement avec la clé VAPID de l'environnement
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BKd3dGEK3wlITbqyZ3AeohkqgBOweVJFuFhsEm4yOfdLIFzTQTzWPPOvfTlRBpuEb1LoQ_hYmfpABqHyDy3dwQ8';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      console.log('PWA: Nouvel abonnement push créé');

      // Envoyer l'abonnement au serveur
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('PWA: Erreur abonnement push:', error);
      return null;
    }
  }, []);

  return {
    // État
    isInstallable,
    isInstalled,
    isStandalone,
    isSupported,
    installPrompt,
    
    // Actions
    installPWA,
    checkInstallation,
    requestNotificationPermission,
    subscribeToPush
  };
};
