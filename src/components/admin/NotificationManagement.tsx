import React, { useState, useEffect } from 'react';

interface Notification {
  id: number;
  titre: string;
  message: string;
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  lue: boolean;
  created_at: string;
  push_sent_at: string | null;
  sms_sent_at: string | null;
  scheduled_sms_at: string | null;
}

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
}

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<SMSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'pending_sms'>('all');

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  // Charger les statistiques SMS
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sms/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Forcer vérification scheduler
  const forceCheck = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/sms/scheduler/force-check', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Recharger les données
      await Promise.all([loadNotifications(), loadStats()]);
    } catch (error) {
      console.error('Erreur force check:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadStats();
    
    // Recharger toutes les 30 secondes
    const interval = setInterval(() => {
      loadNotifications();
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.lue;
      case 'pending_sms':
        return !notif.lue && notif.push_sent_at && !notif.sms_sent_at && notif.scheduled_sms_at;
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusBadge = (notif: Notification) => {
    if (notif.lue) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✅ Lue</span>;
    }
    if (notif.sms_sent_at) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">📱 SMS envoyé</span>;
    }
    if (notif.push_sent_at && notif.scheduled_sms_at) {
      const scheduledTime = new Date(notif.scheduled_sms_at);
      const now = new Date();
      const hoursLeft = Math.max(0, Math.round((scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
      
      if (hoursLeft > 0) {
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">⏰ SMS dans {hoursLeft}h</span>;
      } else {
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">🔄 SMS en cours</span>;
      }
    }
    if (notif.push_sent_at) {
      return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">🔔 Push envoyé</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">📋 Créée</span>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📱 Gestion des Notifications & SMS
      </h2>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Stats Notifications */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Notifications (30j)</h3>
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
            <h3 className="font-semibold text-green-800 mb-2">⏰ Scheduler SMS</h3>
            <div className="space-y-1 text-sm">
              <div className={`font-semibold ${stats.scheduler.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                {stats.scheduler.isRunning ? '✅ Actif' : '❌ Inactif'}
              </div>
              <div>Vérifications: {stats.scheduler.totalChecks}</div>
              <div>SMS traités: {stats.scheduler.smsProcessed}</div>
              <div>Taux succès: {stats.scheduler.successRate}</div>
              <div className="text-xs text-gray-600">
                Dernière: {stats.scheduler.lastCheck ? formatDate(stats.scheduler.lastCheck) : 'Jamais'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🔧 Actions</h3>
            <div className="space-y-2">
              <button
                onClick={forceCheck}
                disabled={loading}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {loading ? 'Vérification...' : 'Forcer Vérification'}
              </button>
              <div className="text-xs text-gray-600">
                Délai SMS: 12 heures
              </div>
              <div className="text-xs text-gray-600">
                Vérification: 10 minutes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'unread' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Non lues ({notifications.filter(n => !n.lue).length})
        </button>
        <button
          onClick={() => setFilter('pending_sms')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'pending_sms' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          SMS en attente ({notifications.filter(n => !n.lue && n.push_sent_at && !n.sms_sent_at && n.scheduled_sms_at).length})
        </button>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune notification trouvée
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div key={notif.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{notif.titre}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                </div>
                <div className="ml-4">
                  {getStatusBadge(notif)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm text-gray-600">
                <div>
                  <div><strong>Destinataire:</strong> {notif.prenom} {notif.nom}</div>
                  <div><strong>Email:</strong> {notif.email}</div>
                  <div><strong>Téléphone:</strong> {notif.telephone || 'Non renseigné'}</div>
                </div>
                <div>
                  <div><strong>Créée:</strong> {formatDate(notif.created_at)}</div>
                  {notif.push_sent_at && (
                    <div><strong>Push envoyé:</strong> {formatDate(notif.push_sent_at)}</div>
                  )}
                  {notif.scheduled_sms_at && (
                    <div><strong>SMS programmé:</strong> {formatDate(notif.scheduled_sms_at)}</div>
                  )}
                  {notif.sms_sent_at && (
                    <div><strong>SMS envoyé:</strong> {formatDate(notif.sms_sent_at)}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Fonctionnement du système</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• Les notifications push sont envoyées immédiatement</div>
          <div>• Un SMS de suivi est programmé automatiquement 12h après le push</div>
          <div>• Si l'utilisateur lit la notification, le SMS est automatiquement annulé</div>
          <div>• Le scheduler vérifie toutes les 10 minutes les SMS à envoyer</div>
          <div>• Les SMS sont envoyés via TextBee (plan gratuit : 50 SMS/jour)</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
