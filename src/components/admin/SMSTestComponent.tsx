import React, { useState, useEffect } from 'react';

interface SMSStats {
  notifications: {
    total_notifications: number;
    push_sent: number;
    sms_sent: number;
    read_notifications: number;
    pending_sms: number;
  };
  scheduler: {
    isRunning: boolean;
    totalChecks: number;
    smsProcessed: number;
    smsSuccessful: number;
    smsFailed: number;
    successRate: string;
    lastCheck: string | null;
  };
  usage: {
    dailyLimit: number;
    monthlyLimit: number;
    bulkLimit: number;
    provider: string;
    plan: string;
  };
}

interface PendingNotification {
  id: number;
  prenom: string;
  telephone: string;
  titre: string;
  scheduled_sms_at: string;
  created_at: string;
}

const SMSTestComponent: React.FC = () => {
  const [stats, setStats] = useState<SMSStats | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testPhone, setTestPhone] = useState('+22912345678');
  const [testMessage, setTestMessage] = useState('Test SMS depuis l\'interface admin');

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sms/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Charger les notifications en attente
  const loadPendingNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sms/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Erreur chargement notifications en attente:', error);
    }
  };

  // Tester un SMS
  const testSMS = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: testPhone,
          message: testMessage
        })
      });
      
      const result = await response.json();
      setTestResult(result.success ? '✅ SMS envoyé avec succès' : `❌ Erreur: ${result.message}`);
      
      if (result.success) {
        loadStats(); // Recharger les stats
      }
    } catch (error) {
      setTestResult(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Forcer une vérification du scheduler
  const forceCheck = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sms/scheduler/force-check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      setTestResult(result.success ? '✅ Vérification forcée exécutée' : `❌ Erreur: ${result.message}`);
      
      // Recharger les données
      loadStats();
      loadPendingNotifications();
    } catch (error) {
      setTestResult(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadPendingNotifications();
    
    // Recharger toutes les 30 secondes
    const interval = setInterval(() => {
      loadStats();
      loadPendingNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📱 Système SMS - Phase 2
      </h2>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Stats Notifications */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Notifications</h3>
            <div className="space-y-1 text-sm">
              <div>Total: {stats.notifications.total_notifications}</div>
              <div>Push envoyés: {stats.notifications.push_sent}</div>
              <div>SMS envoyés: {stats.notifications.sms_sent}</div>
              <div>Lues: {stats.notifications.read_notifications}</div>
              <div className="font-semibold text-orange-600">
                SMS en attente: {stats.notifications.pending_sms}
              </div>
            </div>
          </div>

          {/* Stats Scheduler */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">⏰ Scheduler</h3>
            <div className="space-y-1 text-sm">
              <div className={`font-semibold ${stats.scheduler.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                {stats.scheduler.isRunning ? '✅ Actif' : '❌ Inactif'}
              </div>
              <div>Vérifications: {stats.scheduler.totalChecks}</div>
              <div>SMS traités: {stats.scheduler.smsProcessed}</div>
              <div>Taux succès: {stats.scheduler.successRate}</div>
              <div className="text-xs text-gray-600">
                Dernière: {stats.scheduler.lastCheck ? new Date(stats.scheduler.lastCheck).toLocaleString() : 'Jamais'}
              </div>
            </div>
          </div>

          {/* Stats Usage */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">📈 Limites TextBee</h3>
            <div className="space-y-1 text-sm">
              <div>Quotidien: {stats.usage.dailyLimit} SMS</div>
              <div>Mensuel: {stats.usage.monthlyLimit} SMS</div>
              <div>Bulk: {stats.usage.bulkLimit} destinataires</div>
              <div>Provider: {stats.usage.provider}</div>
              <div>Plan: {stats.usage.plan}</div>
            </div>
          </div>
        </div>
      )}

      {/* Test SMS */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">🧪 Test SMS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone
            </label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+22912345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Message de test"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={testSMS}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Envoyer SMS Test'}
          </button>
          <button
            onClick={forceCheck}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Forcer Vérification'}
          </button>
        </div>
        {testResult && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            {testResult}
          </div>
        )}
      </div>

      {/* Notifications en attente */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-4">
          ⏳ SMS en Attente ({pendingNotifications.length})
        </h3>
        {pendingNotifications.length === 0 ? (
          <p className="text-gray-600 text-sm">Aucun SMS en attente d'envoi</p>
        ) : (
          <div className="space-y-2">
            {pendingNotifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{notif.prenom} - {notif.telephone}</div>
                    <div className="text-sm text-gray-600">{notif.titre}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Programmé: {new Date(notif.scheduled_sms_at).toLocaleString()}</div>
                    <div>Créé: {new Date(notif.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
            {pendingNotifications.length > 5 && (
              <div className="text-sm text-gray-600 text-center">
                ... et {pendingNotifications.length - 5} autres
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• Le système envoie automatiquement un SMS 12h après une notification push non lue</div>
          <div>• Si l'utilisateur lit la notification, le SMS est automatiquement annulé</div>
          <div>• Le scheduler vérifie toutes les 10 minutes les SMS à envoyer</div>
          <div>• Configurez TEXTBEE_API_KEY et TEXTBEE_DEVICE_ID dans .env pour activer les vrais envois</div>
        </div>
      </div>
    </div>
  );
};

export default SMSTestComponent;
