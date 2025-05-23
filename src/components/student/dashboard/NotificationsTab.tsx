interface Notification {
  id: string; // ou number, selon votre structure
  title: string;
  message: string;
  date: string;
  read?: boolean; // Optionnel: pour marquer une notification comme lue
}

// Données fictives pour les notifications (à remplacer par des données réelles)
const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Date limite de soumission des fiches de stage',
    message: 'N\'oubliez pas de soumettre vos informations de stage avant le 30 juin. Passé ce délai, aucune soumission ne sera acceptée.',
    date: 'Il y a 2 jours',
    read: false,
  },
  {
    id: '2',
    title: 'Bienvenue sur la plateforme INSTI Stages',
    message: 'Nous sommes ravis de vous accueillir ! Explorez les fonctionnalités et trouvez le stage de vos rêves.',
    date: 'Il y a 1 semaine',
    read: true,
  },
  {
    id: '3',
    title: 'Nouvelle offre de stage disponible',
    message: 'Une nouvelle offre de stage en Développement Web chez TechSolutions vient d\'être publiée. Consultez l\'onglet "Trouver un stage".',
    date: 'Il y a 3 jours',
    read: false,
  },
];

const NotificationsTab = () => {
  // Idéalement, les notifications viendraient des props ou d'un état global/contexte
  const notifications = dummyNotifications;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-5 rounded-lg border-l-4 shadow-sm transition-all duration-200 ease-in-out ${
                notif.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`text-md font-semibold ${
                  notif.read ? 'text-gray-700' : 'text-blue-700'
                }`}>{notif.title}</h3>
                {!notif.read && (
                  <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">Nouveau</span>
                )}
              </div>
              <p className={`mt-1 text-sm ${
                notif.read ? 'text-gray-600' : 'text-gray-700'
              }`}>
                {notif.message}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {notif.date}
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
            Vous n'avez aucune nouvelle notification pour le moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab; 