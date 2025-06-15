import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

interface TestResult {
  step: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

const PWANotificationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isSupported,
    subscribeToPush
  } = usePWA();

  const addTestResult = (step: string, status: TestResult['status'], message: string) => {
    const result: TestResult = {
      step,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testPWASupport = async () => {
    addTestResult('Support PWA', 'info', 'Vérification du support PWA...');

    // Vérification du manifeste plus robuste
    let manifestSupported = false;
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        const response = await fetch('/manifest.json');
        manifestSupported = response.ok;
      }
    } catch (error) {
      manifestSupported = false;
    }

    const checks = {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: manifestSupported,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      https: location.protocol === 'https:' || location.hostname === 'localhost'
    };

    Object.entries(checks).forEach(([feature, supported]) => {
      addTestResult(
        `Support ${feature}`,
        supported ? 'success' : 'error',
        supported ? `✅ ${feature} supporté` : `❌ ${feature} non supporté`
      );
    });

    // Vérification plus précise de l'installation PWA
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://');

    addTestResult('PWA Status', isPWAInstalled ? 'success' : 'warning',
      isPWAInstalled ? '✅ PWA installée et en mode standalone' : '⚠️ PWA non installée ou pas en mode standalone');
  };

  const testNotificationPermission = async () => {
    addTestResult('Permission', 'info', 'Vérification des permissions...');
    
    if (!('Notification' in window)) {
      addTestResult('Permission', 'error', '❌ Notifications non supportées');
      return;
    }

    const permission = Notification.permission;
    addTestResult('Permission actuelle', 
      permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'warning',
      `Permission: ${permission}`
    );

    if (permission === 'default') {
      try {
        const newPermission = await Notification.requestPermission();
        addTestResult('Demande permission', 
          newPermission === 'granted' ? 'success' : 'error',
          `Nouvelle permission: ${newPermission}`
        );
      } catch (error) {
        addTestResult('Demande permission', 'error', `Erreur: ${error}`);
      }
    }
  };

  const testPushSubscription = async () => {
    addTestResult('Abonnement Push', 'info', 'Test de l\'abonnement push...');

    try {
      // Vérifier d'abord s'il y a déjà un abonnement
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        addTestResult('Abonnement existant', 'info', '📋 Abonnement push déjà présent');
        setSubscriptionInfo(existingSubscription);
      }

      const subscription = await subscribeToPush();
      if (subscription) {
        setSubscriptionInfo(subscription);
        addTestResult('Abonnement Push', 'success', '✅ Abonnement push créé/vérifié avec succès');
        addTestResult('Debug abonnement', 'info', `🔑 Endpoint: ${subscription.endpoint.substring(0, 50)}...`);

        // Envoyer l'abonnement au serveur
        const token = localStorage.getItem('token');
        if (!token) {
          addTestResult('Envoi serveur', 'error', '❌ Token d\'authentification manquant');
          return;
        }

        addTestResult('Envoi serveur', 'info', 'Envoi de l\'abonnement au serveur...');

        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
        });

        const result = await response.json();

        addTestResult('Debug serveur', 'info', `Réponse: ${response.status} - ${JSON.stringify(result)}`);

        if (result.success) {
          addTestResult('Envoi serveur', 'success', '✅ Abonnement enregistré sur le serveur');
          addTestResult('Prêt notifications', 'success', '🎯 Système prêt pour les notifications push');
        } else {
          addTestResult('Envoi serveur', 'error', `❌ Erreur serveur: ${result.message}`);
        }
      } else {
        addTestResult('Abonnement Push', 'error', '❌ Échec de création de l\'abonnement');
        addTestResult('Debug', 'error', 'Vérifiez les permissions et le service worker');
      }
    } catch (error) {
      addTestResult('Abonnement Push', 'error', `❌ Erreur: ${error.message}`);
      addTestResult('Debug erreur', 'error', `🔍 ${error.stack || error}`);
    }
  };

  const testLocalNotification = async () => {
    addTestResult('Test Local', 'info', 'Test de notification via service worker...');

    if (Notification.permission !== 'granted') {
      addTestResult('Test Local', 'error', '❌ Permission notification requise');
      return;
    }

    try {
      // Utiliser le service worker pour les notifications (requis pour PWA)
      const registration = await navigator.serviceWorker.ready;

      if (!registration) {
        addTestResult('Test Local', 'error', '❌ Service worker non disponible');
        return;
      }

      await registration.showNotification('🎓 Test INSTI Local', {
        body: 'Ceci est un test de notification via service worker. Si vous voyez ceci, les notifications fonctionnent !',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-urgent.png',
        tag: 'test-local-sw',
        requireInteraction: true,
        actions: [
          {
            action: 'test-ok',
            title: '✅ Ça marche !',
          }
        ],
        data: {
          testType: 'local',
          timestamp: Date.now()
        }
      });

      addTestResult('Test Local', 'success', '✅ Notification locale envoyée via service worker');
      addTestResult('Instructions', 'info', '📱 Vérifiez votre appareil - la notification doit apparaître');

    } catch (error) {
      addTestResult('Test Local', 'error', `❌ Erreur service worker: ${error.message}`);

      // Fallback pour navigateurs sans service worker
      try {
        addTestResult('Fallback', 'info', 'Tentative avec API Notification directe...');
        const notification = new Notification('🎓 Test INSTI Fallback', {
          body: 'Test de notification directe (fallback)',
          icon: '/icons/icon-192x192.png'
        });
        addTestResult('Fallback', 'success', '✅ Notification fallback envoyée');
      } catch (fallbackError) {
        addTestResult('Fallback', 'error', `❌ Fallback échoué: ${fallbackError.message}`);
      }
    }
  };

  const cleanPushSubscriptions = async () => {
    addTestResult('Nettoyage', 'info', 'Nettoyage complet des abonnements push...');

    try {
      // Étape 1: Supprimer l'abonnement côté navigateur
      addTestResult('Nettoyage navigateur', 'info', '🌐 Suppression abonnement navigateur...');

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        addTestResult('Nettoyage navigateur', 'success', '✅ Abonnement navigateur supprimé');
      } else {
        addTestResult('Nettoyage navigateur', 'info', 'ℹ️ Aucun abonnement navigateur trouvé');
      }

      // Étape 2: Supprimer les abonnements côté serveur
      addTestResult('Nettoyage serveur', 'info', '🗄️ Suppression abonnements serveur...');

      const token = localStorage.getItem('token');
      if (!token) {
        addTestResult('Nettoyage serveur', 'error', '❌ Token d\'authentification manquant');
        return;
      }

      const response = await fetch('/api/push/clean-subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        addTestResult('Nettoyage serveur', 'success', `✅ ${result.data.deletedCount} abonnements serveur supprimés`);
        addTestResult('Nettoyage complet', 'success', '🎯 Nettoyage complet terminé');
        addTestResult('Instructions', 'warning', '🔄 IMPORTANT: Testez maintenant "Test Push" - un nouvel abonnement sera créé avec les bonnes clés VAPID');

        // Réinitialiser les informations d'abonnement
        setSubscriptionInfo(null);
      } else {
        addTestResult('Nettoyage serveur', 'error', `❌ Erreur serveur: ${result.message}`);
      }
    } catch (error) {
      addTestResult('Nettoyage', 'error', `❌ Erreur: ${error.message}`);
    }
  };

  const testPushNotification = async () => {
    addTestResult('Test Notification', 'info', 'Envoi d\'une notification de test...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addTestResult('Test Notification', 'error', '❌ Token d\'authentification manquant');
        return;
      }

      addTestResult('Debug', 'info', 'Envoi de la requête au serveur...');

      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      addTestResult('Debug', 'info', `Réponse serveur: ${response.status} ${response.statusText}`);

      const result = await response.json();

      addTestResult('Debug', 'info', `Contenu réponse: ${JSON.stringify(result)}`);

      if (result.success) {
        addTestResult('Test Notification', 'success', '✅ Notification de test envoyée côté serveur');
        addTestResult('Résultat détaillé', 'info', `📊 ${result.data?.message || 'Détails non disponibles'}`);
        addTestResult('Vérification', 'warning', '📱 Vérifiez votre appareil pour la notification dans les 10 secondes');

        // Attendre un peu et vérifier si la notification est arrivée
        setTimeout(() => {
          addTestResult('Conseil', 'info', '💡 Si pas de notification: vérifiez les permissions et le service worker');
        }, 3000);
      } else {
        addTestResult('Test Notification', 'error', `❌ Erreur serveur: ${result.message}`);
        if (result.error) {
          addTestResult('Détail erreur', 'error', `🔍 ${result.error}`);
        }
      }
    } catch (error) {
      addTestResult('Test Notification', 'error', `❌ Erreur réseau: ${error.message}`);
      addTestResult('Debug erreur', 'error', `🔍 ${error.stack || error}`);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    clearResults();

    addTestResult('Début', 'info', '🚀 Démarrage du test complet PWA...');

    try {
      // Test 1: Support PWA
      addTestResult('Étape 1/4', 'info', '🔍 Test du support PWA...');
      await testPWASupport();

      // Attendre un peu entre les tests
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Test 2: Permissions
      addTestResult('Étape 2/4', 'info', '🔔 Test des permissions...');
      await testNotificationPermission();

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Test 3: Abonnement Push
      addTestResult('Étape 3/4', 'info', '📡 Test de l\'abonnement push...');
      await testPushSubscription();

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Test 4: Notification de test
      addTestResult('Étape 4/4', 'info', '🧪 Test d\'envoi de notification...');
      await testPushNotification();

      addTestResult('Fin', 'success', '✅ Test complet terminé - Vérifiez les résultats ci-dessus');
      addTestResult('Instructions', 'info', '📱 Si notification non reçue: vérifiez les paramètres du navigateur');

    } catch (error) {
      addTestResult('Erreur', 'error', `❌ Erreur durant les tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔔 Test Notifications PWA</h2>
      
      {/* Informations PWA */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">État PWA actuel :</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Supportée: {isSupported ? '✅' : '❌'}</div>
          <div>Installable: {isInstallable ? '✅' : '❌'}</div>
          <div>Installée: {isInstalled ? '✅' : '❌'}</div>
          <div>Mode Standalone: {isStandalone ? '✅' : '❌'}</div>
        </div>
      </div>

      {/* Boutons de test */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={testPWASupport}
          disabled={isLoading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Support
        </button>
        
        <button
          onClick={testNotificationPermission}
          disabled={isLoading}
          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Permission
        </button>
        
        <button
          onClick={testPushSubscription}
          disabled={isLoading}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Abonnement
        </button>
        
        <button
          onClick={testPushNotification}
          disabled={isLoading}
          className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Push
        </button>

        <button
          onClick={testLocalNotification}
          disabled={isLoading}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test Local
        </button>

        <button
          onClick={cleanPushSubscriptions}
          disabled={isLoading}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50 font-semibold"
        >
          🧹 Reset Push
        </button>
      </div>

      {/* Bouton test complet */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runFullTest}
          disabled={isLoading}
          className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? '🔄 Test en cours...' : '🚀 Test Complet'}
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600"
        >
          Effacer
        </button>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3">Résultats des tests :</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(result.status)}</span>
                    <span className="font-medium">{result.step}</span>
                  </div>
                  <span className="text-xs opacity-75">{result.timestamp}</span>
                </div>
                <p className="mt-1 text-sm">{result.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations d'abonnement */}
      {subscriptionInfo && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">Abonnement Push actif :</h3>
          <div className="text-sm text-green-700">
            <p><strong>Endpoint:</strong> {subscriptionInfo.endpoint.substring(0, 50)}...</p>
            <p><strong>Clés:</strong> p256dh et auth configurées ✅</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWANotificationTest;
