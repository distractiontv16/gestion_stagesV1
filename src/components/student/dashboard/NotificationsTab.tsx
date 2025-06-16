import React, { useState, useEffect } from 'react';
import { Notification } from '@/types'; // Importer depuis les types globaux
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Helper pour formater la date relative
const formatDateRelativeToNow = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch (error) {
    console.error("Erreur de formatage de date pour notification:", dateString, error);
    return "Date invalide";
  }
};

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Gérer l'absence de token, peut-être rediriger vers login ou afficher une erreur spécifique
        throw new Error("Utilisateur non authentifié");
      }
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erreur lors de la récupération des notifications" }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data || []);
      } else {
        throw new Error(result.message || "Échec de la récupération des notifications (success false)");
      }
    } catch (err) {
      console.error("Erreur fetchNotifications:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erreur lors du marquage" }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Recharger les notifications pour mettre à jour l'affichage
        await fetchNotifications();
        console.log('✅ Notification marquée comme lue, SMS annulé');
      } else {
        throw new Error(result.message || "Échec du marquage");
      }
    } catch (err) {
      console.error("Erreur handleMarkAsRead:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erreur lors du marquage global" }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Recharger les notifications pour mettre à jour l'affichage
        await fetchNotifications();
        console.log('✅ Toutes les notifications marquées comme lues');
      } else {
        throw new Error(result.message || "Échec du marquage global");
      }
    } catch (err) {
      console.error("Erreur handleMarkAllAsRead:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p className="ml-3 text-gray-600">Chargement des notifications...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">Erreur: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        {/* Bouton pour marquer tout comme lu */}
        {notifications.some(n => !n.lue) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-5 rounded-lg border-l-4 shadow-sm transition-all duration-200 ease-in-out ${
                notif.lue ? 'bg-gray-50 border-gray-300 opacity-70' : 'bg-blue-50 border-blue-500 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`text-md font-semibold ${
                  notif.lue ? 'text-gray-700' : 'text-blue-700'
                }`}>{notif.titre}</h3> {/* Utilisation du champ titre */} 
                {!notif.lue && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
              <p className={`mt-1 text-sm ${
                notif.lue ? 'text-gray-600' : 'text-gray-700'
              }`}>
                {notif.message}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {formatDateRelativeToNow(notif.created_at)} {/* Utilisation de created_at pour la date relative */}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune notification</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n\'avez aucune nouvelle notification pour le moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab; 