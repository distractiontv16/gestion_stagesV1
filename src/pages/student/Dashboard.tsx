import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StageForm } from '@/components/ui/stage-form';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('infos');
  const [showStageForm, setShowStageForm] = useState(false);
  const [hasFoundInternship, setHasFoundInternship] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Données fictives pour la démo
  const studentInfo = {
    nom: 'Diallo',
    prenom: 'Mamadou',
    email: 'mamadou.diallo@example.com',
    matricule: 'ETU1234',
    filiere: 'GEI/IT',
    telephone: '77123456',
  };

  // Données fictives pour les propositions de stages
  const internshipOffers = [
    {
      id: 1,
      company: 'SONATEL',
      position: 'Développeur Full Stack',
      location: 'Dakar, Sénégal',
      description: 'Stage de fin d\'études pour le développement d\'applications web modernes.',
      requirements: 'React, Node.js, MongoDB',
      duration: '6 mois'
    },
    {
      id: 2,
      company: 'FREE',
      position: 'Ingénieur Réseau',
      location: 'Dakar, Sénégal',
      description: 'Stage dans le domaine des réseaux et télécommunications.',
      requirements: 'Cisco, Réseaux IP, Administration système',
      duration: '4 mois'
    },
    {
      id: 3,
      company: 'SGBS',
      position: 'Analyste de données',
      location: 'Dakar, Sénégal',
      description: 'Stage d\'analyse de données financières et création de tableaux de bord.',
      requirements: 'Excel, Power BI, SQL',
      duration: '5 mois'
    }
  ];

  const handleLogout = () => {
    // Dans un cas réel, vous effaceriez ici les tokens d'authentification
    console.log("Déconnexion de l'utilisateur");
    // Redirection vers la page de login
    navigate('/login');
  };

  const handleStartFormClick = () => {
    setShowStageForm(true);
  };

  const handleInternshipStatusChange = (status: boolean) => {
    setHasFoundInternship(status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">ISI Stages</h1>
          <div className="flex items-center gap-3">
            <span>{studentInfo.prenom} {studentInfo.nom}</span>
            <button 
              className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {showStageForm ? (
          <div>
            <button 
              onClick={() => setShowStageForm(false)}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Retour au tableau de bord
            </button>
            <StageForm />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Navigation par onglets */}
            <div className="flex border-b overflow-x-auto">
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'infos'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('infos')}
              >
                Mon Profil
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'stage'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('stage')}
              >
                Informations de Stage
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'find'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('find')}
              >
                Trouver un Stage
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </div>

            {/* Contenu des onglets */}
            <div className="p-6">
              {activeTab === 'infos' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Mes Informations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Nom</p>
                      <p className="font-medium">{studentInfo.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prénom</p>
                      <p className="font-medium">{studentInfo.prenom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{studentInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{studentInfo.telephone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Matricule</p>
                      <p className="font-medium">{studentInfo.matricule}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Filière</p>
                      <p className="font-medium">{studentInfo.filiere}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stage' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Informations de Stage</h2>
                  
                  {/* État du stage */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Vous n'avez pas encore soumis vos informations de stage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulaire de stage par étapes */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-4">Formulaire de Stage</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Complétez ce formulaire avec les informations relatives à votre stage.
                    </p>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      onClick={handleStartFormClick}
                    >
                      Commencer le formulaire
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'find' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Trouver un Stage</h2>
                  
                  {/* Statut de recherche de stage */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium mb-4">Avez-vous déjà trouvé un stage ?</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          hasFoundInternship === true 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleInternshipStatusChange(true)}
                      >
                        Oui, j'ai trouvé un stage
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          hasFoundInternship === false 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleInternshipStatusChange(false)}
                      >
                        Non, je cherche encore
                      </button>
                    </div>
                    
                    {hasFoundInternship === true && (
                      <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                        <p className="text-green-700">
                          Excellent ! N'oubliez pas de remplir le formulaire d'information de stage dans l'onglet "Informations de Stage".
                        </p>
                      </div>
                    )}
                    
                    {hasFoundInternship === false && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-blue-700">
                          Consultez les propositions de stages ci-dessous. Elles sont sélectionnées selon votre profil et votre filière.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Propositions de stages */}
                  {hasFoundInternship === false && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Propositions de stages</h3>
                      <div className="space-y-4">
                        {internshipOffers.map(offer => (
                          <div key={offer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg">{offer.position}</h4>
                                <p className="text-blue-600 font-medium">{offer.company}</p>
                                <p className="text-gray-600 text-sm">{offer.location} • {offer.duration}</p>
                              </div>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                Postuler
                              </button>
                            </div>
                            <p className="mt-2 text-gray-700">{offer.description}</p>
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">Compétences requises:</span>
                              <p className="text-sm text-gray-600">{offer.requirements}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                  
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <p className="text-sm font-medium">Date limite de soumission</p>
                      <p className="text-sm text-gray-600">
                        N'oubliez pas de soumettre vos informations de stage avant le 30 juin.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Il y a 2 jours</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <p className="text-sm font-medium">Bienvenue sur la plateforme</p>
                      <p className="text-sm text-gray-600">
                        Bienvenue sur la plateforme de gestion des stages de l'ISI.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Il y a 7 jours</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard; 