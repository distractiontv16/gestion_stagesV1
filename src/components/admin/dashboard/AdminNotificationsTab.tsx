import React, { useState, useEffect, useCallback } from 'react';

// TODO: Déplacer vers des fichiers d'interfaces partagés
interface User { // Utilisateur simplifié pour la sélection
  id: number;
  email: string; 
  nom: string; // Ajouté
  prenom: string; // Ajouté
}

interface AdminNotification { // Correspond à la réponse de l'API
  id: number;
  utilisateur_id: number;
  utilisateur_email?: string; // Ajouté par jointure côté backend
  message: string;
  lue: boolean;
  created_at: string; 
}

// Pour le formulaire de création
interface NewNotificationPayload {
  utilisateur_id: number | null; // null si aucun utilisateur sélectionné
  message: string;
}

// TODO: Récupérer depuis une API /api/users ou /api/admin/etudiants
// const mockUsers: User[] = [ ... ]; // Supprimé

const AdminNotificationsTab: React.FC = () => {
  const [notificationsHistory, setNotificationsHistory] = useState<AdminNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Initialisé à vide
  
  const [newNotification, setNewNotification] = useState<NewNotificationPayload>({
    utilisateur_id: null,
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false); // Pour l'historique et l'envoi
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Pour le chargement des utilisateurs
  const [error, setError] = useState<string | null>(null); // Erreur pour l'historique
  const [errorUsers, setErrorUsers] = useState<string | null>(null); // Erreur pour les utilisateurs
  const [formError, setFormError] = useState<string | null>(null);

  const API_BASE_URL = '/api/admin'; // Ajustez si nécessaire

  const fetchNotificationsHistory = useCallback(async (token: string | null) => { // Ajout du token
    setIsLoading(true);
    setError(null);
    if (!token) { setError('Token manquant'); setIsLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` } // Ajout du token
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setNotificationsHistory(data.data || []); // data.data devrait être le tableau
      } else {
        throw new Error(data.message || 'Failed to fetch notifications history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching notifications history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (token: string | null) => { // Nouvelle fonction
    setIsLoadingUsers(true);
    setErrorUsers(null);
    if (!token) { setErrorUsers('Token manquant'); setIsLoadingUsers(false); return; }
    try {
      // Demande une limite élevée pour obtenir tous les étudiants pour le select.
      // Ajustez la limite si nécessaire ou implémentez une recherche/pagination pour le select si la liste est très grande.
      const response = await fetch(`${API_BASE_URL}/etudiants?limit=1000`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.etudiants)) {
        // Assurez-vous que les champs id, email, nom, prenom existent
        setUsers(data.data.etudiants.map((u: any) => ({
          id: u.id,
          email: u.email || 'N/A', // Fournir une valeur par défaut si email peut être null
          nom: u.nom || '',
          prenom: u.prenom || ''
        })));
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setErrorUsers(err instanceof Error ? err.message : String(err));
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Récupérer le token
    fetchNotificationsHistory(token);
    fetchUsers(token); // Appeler fetchUsers
  }, [fetchNotificationsHistory, fetchUsers]); // Ajout de fetchUsers aux dépendances

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNotification(prev => ({
      ...prev,
      [name]: name === 'utilisateur_id' ? (value ? parseInt(value, 10) : null) : value
    }));
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newNotification.utilisateur_id) {
      setFormError("Veuillez sélectionner un destinataire.");
      return;
    }
    if (!newNotification.message.trim()) {
      setFormError("Veuillez écrire un message pour la notification.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token'); // Récupérer le token
    if (!token) { setFormError('Non authentifié'); setIsLoading(false); return; }
    try {
      const payload: { utilisateur_id: number; message: string } = {
        utilisateur_id: newNotification.utilisateur_id, 
        message: newNotification.message,
      }; 

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, // Ajout du token
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error sending notification');
      }
      
      alert('Notification envoyée avec succès!');
      setNewNotification({ utilisateur_id: null, message: '' }); // Reset form
      fetchNotificationsHistory(token); // Re-fetch history
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
      // alert(`Erreur: ${err instanceof Error ? err.message : String(err)}`); // Peut-être redondant si formError est affiché
      console.error("Error sending notification:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Envoyer une nouvelle notification</h3>
        <form onSubmit={handleSendNotification} className="space-y-5">
          <div>
            <label htmlFor="utilisateur_id" className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
            <select 
              id="utilisateur_id" 
              name="utilisateur_id"
              value={newNotification.utilisateur_id === null ? '' : newNotification.utilisateur_id}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {isLoadingUsers ? <option disabled>Chargement des utilisateurs...</option> :
               errorUsers ? <option disabled>Erreur chargement utilisateurs</option> :
               users.length === 0 ? <option disabled>Aucun utilisateur trouvé</option> : 
               users.map(user => (
                <option key={user.id} value={user.id}>{user.prenom} {user.nom} ({user.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Contenu du message</label>
            <textarea 
              id="message" 
              name="message"
              rows={5}
              value={newNotification.message}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors resize-y"
              placeholder="Rédigez votre message ici..."
              required
            ></textarea>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-colors disabled:opacity-50">
              {isLoading ? 'Envoi en cours...' : 'Envoyer la notification'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Historique des notifications ({notificationsHistory.length})</h3>
        {isLoading && !notificationsHistory.length ? (
            <p className="text-center text-gray-500 py-8">Chargement de l'historique...</p>
        ) : error && !notificationsHistory.length ? (
            <p className="text-center text-red-500 py-8">{error}</p>
        ) : notificationsHistory.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {notificationsHistory.map(notif => (
                <div key={notif.id} className={`border-l-4 ${notif.lue ? 'border-gray-300' : 'border-blue-500'} pl-4 py-3 bg-gray-50 rounded-r-md shadow-sm`}>
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${notif.lue ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                        {notif.lue ? 'Lue' : 'Non lue'}
                    </span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">À: {notif.utilisateur_email || `ID Utilisateur: ${notif.utilisateur_id}`}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{notif.message}</p>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-500 py-8">Aucune notification dans l'historique.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsTab; 