import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';

const PWATestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isSupported,
    installPWA,
    checkInstallation,
    requestNotificationPermission,
    subscribeToPush
  } = usePWA();

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await testFunction();
      setTestResult(`✅ ${testName}: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ ${testName}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPushNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const testSubscription = async () => {
    try {
      const subscription = await subscribeToPush();
      return subscription ? 'Abonnement créé avec succès' : 'Échec de l\'abonnement';
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Test PWA & Notifications</h2>
      
      {/* État PWA */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">État PWA</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className={`p-2 rounded ${isSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            PWA Supportée: {isSupported ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${isInstallable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            Installable: {isInstallable ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${isInstalled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            Installée: {isInstalled ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${isStandalone ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            Mode Standalone: {isStandalone ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Permissions</h3>
        <div className="text-sm">
          <div className={`p-2 rounded mb-2 ${
            Notification.permission === 'granted' ? 'bg-green-100 text-green-800' :
            Notification.permission === 'denied' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            Notifications: {Notification.permission}
          </div>
        </div>
      </div>

      {/* Boutons de test */}
      <div className="space-y-3">
        <button
          onClick={() => runTest('Installation PWA', installPWA)}
          disabled={isLoading || !isInstallable}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Tester Installation PWA
        </button>

        <button
          onClick={() => runTest('Permission Notifications', requestNotificationPermission)}
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Demander Permission Notifications
        </button>

        <button
          onClick={() => runTest('Abonnement Push', testSubscription)}
          disabled={isLoading}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Tester Abonnement Push
        </button>

        <button
          onClick={() => runTest('Notification Test', testPushNotification)}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Envoyer Notification Test
        </button>

        <button
          onClick={() => setTestResult('')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Effacer Résultats
        </button>
      </div>

      {/* Résultats */}
      {testResult && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Résultat du Test</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {testResult}
          </pre>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Test en cours...</span>
        </div>
      )}

      {/* Informations de debug */}
      <div className="mt-6 text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer font-semibold">Informations de debug</summary>
          <div className="mt-2 space-y-1">
            <div>User Agent: {navigator.userAgent}</div>
            <div>Service Worker: {'serviceWorker' in navigator ? '✅' : '❌'}</div>
            <div>Push Manager: {'PushManager' in window ? '✅' : '❌'}</div>
            <div>Notification API: {'Notification' in window ? '✅' : '❌'}</div>
            <div>Display Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default PWATestComponent;
