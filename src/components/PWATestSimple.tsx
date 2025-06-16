import React, { useState } from 'react';
import { usePWASimple } from '../hooks/usePWASimple';

// Composant de test PWA simplifié basé sur le tutoriel YouTube
export const PWATestSimple: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    notificationPermission,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification
  } = usePWASimple();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
      showMessage('✅ Abonnement aux notifications réussi ! Anciens abonnements nettoyés.', 'success');
    } catch (error) {
      console.error('Erreur abonnement:', error);
      showMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      showMessage('✅ Désabonnement réussi !', 'success');
    } catch (error) {
      showMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        showMessage('✅ Notification de test envoyée ! Vérifiez vos notifications.', 'success');
      } else {
        showMessage(`❌ ${result.message || 'Erreur lors du test'}`, 'error');
      }
    } catch (error) {
      console.error('Erreur test:', error);
      showMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      await requestNotificationPermission();
      showMessage('✅ Permission accordée !', 'success');
    } catch (error) {
      showMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/push/clean-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        showMessage(`✅ ${result.message}`, 'success');
        // Forcer la mise à jour de l'état
        window.location.reload();
      } else {
        showMessage(`❌ ${result.message || 'Erreur lors du nettoyage'}`, 'error');
      }
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      showMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          ❌ PWA Non Supportée
        </h3>
        <p className="text-red-600">
          Votre navigateur ne supporte pas les notifications push PWA.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🧪 Test PWA Simplifié (Basé sur Tutoriel YouTube)
      </h3>

      {/* État actuel */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium text-gray-700 mb-2">État actuel :</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Support PWA : {isSupported ? '✅ Supporté' : '❌ Non supporté'}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              notificationPermission === 'granted' ? 'bg-green-500' : 
              notificationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            Permission : {notificationPermission}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            Abonnement : {isSubscribed ? '✅ Actif' : '❌ Inactif'}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
          message.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {notificationPermission !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '⏳ Demande en cours...' : '🔔 Demander Permission'}
          </button>
        )}

        {notificationPermission === 'granted' && !isSubscribed && (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '⏳ Abonnement...' : '📱 S\'abonner aux Notifications'}
          </button>
        )}

        {isSubscribed && (
          <>
            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? '⏳ Envoi...' : '🧪 Tester Notification'}
            </button>

            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? '⏳ Désabonnement...' : '🚫 Se Désabonner'}
            </button>
          </>
        )}

        {/* Bouton de nettoyage (toujours disponible) */}
        <button
          onClick={handleCleanSubscriptions}
          disabled={loading}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? '⏳ Nettoyage...' : '🧹 Nettoyer Abonnements Expirés'}
        </button>

        {isSubscribed && (
          <>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
        <h5 className="font-medium mb-1">📋 Instructions :</h5>
        <ol className="list-decimal list-inside space-y-1">
          <li>Accordez la permission de notification</li>
          <li>Nettoyez les anciens abonnements si nécessaire</li>
          <li>Abonnez-vous aux notifications push</li>
          <li>Testez l'envoi d'une notification</li>
          <li>Vérifiez que la notification apparaît</li>
        </ol>

        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700 text-xs">
            <strong>💡 Astuce :</strong> Si le test échoue avec "abonnement expiré",
            utilisez le bouton "Nettoyer" puis réabonnez-vous.
          </p>
        </div>
      </div>
    </div>
  );
};
