import React, { useState, useEffect } from 'react';

interface AdminNotification {
  id: string; // ou number
  recipient: string; // 'all', 'GEI/IT', etc.
  title: string;
  message: string;
  sentDate: string; // ou Date
}

// Simuler des options de filières
const filiereOptions = [
    { value: 'all', label: 'Tous les étudiants' },
    { value: 'GEI/EE', label: 'Filière GEI/EE' },
    { value: 'GEI/IT', label: 'Filière GEI/IT' },
    { value: 'GE/ER', label: 'Filière GE/ER' },
    { value: 'GMP', label: 'Filière GMP' },
    // ...ajouter d'autres filières ici si nécessaire
];

const initialNotifications: AdminNotification[] = [
  {
    id: 'hist1',
    recipient: 'Tous les étudiants',
    title: 'Rappel des dossiers de fin de stage',
    message: 'N\'oubliez pas de soumettre vos dossiers avant la date limite.',
    sentDate: 'Il y a 2 jours'
  },
  {
    id: 'hist2',
    recipient: 'Filière GEI/IT',
    title: 'Nouvelle offre de stage disponible',
    message: 'Une offre pertinente pour votre filière a été ajoutée.',
    sentDate: 'Il y a 1 semaine'
  }
];

const AdminNotificationsTab = () => {
  const [recipient, setRecipient] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationsHistory, setNotificationsHistory] = useState<AdminNotification[]>([]);

  useEffect(() => {
    setNotificationsHistory(initialNotifications);
  }, []);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
        alert("Veuillez remplir le titre et le message de la notification.");
        return;
    }
    const newNotification: AdminNotification = {
        id: `notif-${Date.now()}`,
        recipient: filiereOptions.find(f => f.value === recipient)?.label || recipient,
        title,
        message,
        sentDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setNotificationsHistory(prev => [newNotification, ...prev]);
    setTitle('');
    setMessage('');
    setRecipient('all');
    alert('Notification envoyée avec succès!');
    // TODO: Implémenter l'appel API pour envoyer réellement la notification
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Envoyer une nouvelle notification</h3>
        <form onSubmit={handleSendNotification} className="space-y-5">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
            <select 
              id="recipient" 
              name="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            >
              {filiereOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre de la notification</label>
            <input 
              type="text" 
              id="title" 
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Ex: Rappel important"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Contenu du message</label>
            <textarea 
              id="message" 
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors resize-y"
              placeholder="Rédigez votre message ici..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-colors">
              Envoyer la notification
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Historique des notifications envoyées ({notificationsHistory.length})</h3>
        {notificationsHistory.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {notificationsHistory.map(notif => (
                <div key={notif.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-md shadow-sm">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-700">{notif.title}</h4>
                    <span className="text-xs text-gray-500">{notif.sentDate}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1 whitespace-pre-wrap">{notif.message}</p>
                <p className="text-xs text-blue-600 font-medium">Destinataire: {notif.recipient}</p>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-500 py-8">Aucune notification n'a été envoyée pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsTab; 