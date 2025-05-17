import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StageForm } from '@/components/ui/stage-form';

// Liste des filières pour mappage ID -> nom
const filieres = [
  { id: 1, nom: 'GEI/EE' },
  { id: 2, nom: 'GEI/IT' },
  { id: 3, nom: 'GE/ER' },
  { id: 4, nom: 'GMP' },
  { id: 5, nom: 'MSY/MI' },
  { id: 6, nom: 'ER/SE' },
  { id: 7, nom: 'GC/A' },
  { id: 8, nom: 'GC/B' },
  { id: 9, nom: 'MSY/MA' },
  { id: 10, nom: 'GE/FC' },
];

interface UserInfo {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  filiere_id?: number;
  filiere?: string;
  telephone: string;
  role?: string;
  whatsapp?: string;
}

interface StageInfo {
  id?: number;
  etudiant_id?: number;
  nom_entreprise?: string;
  departement?: string;
  commune?: string;
  quartier?: string;
  date_debut?: string;
  date_fin?: string;
  theme_memoire?: string;
  nom_maitre_stage?: string;
  prenom_maitre_stage?: string;
  telephone_maitre_stage?: string;
  email_maitre_stage?: string;
  fonction_maitre_stage?: string;
  nom_maitre_memoire?: string;
  telephone_maitre_memoire?: string;
  email_maitre_memoire?: string;
  statut_maitre_memoire?: string;
}

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('infos');
  const [showStageForm, setShowStageForm] = useState(false);
  const [hasFoundInternship, setHasFoundInternship] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageInfo, setStageInfo] = useState<StageInfo | null>(null);
  const [loadingStage, setLoadingStage] = useState(false);
  const [studentInfo, setStudentInfo] = useState<UserInfo>({
    nom: '',
    prenom: '',
    email: '',
    matricule: '',
    filiere: '',
    telephone: '',
  });
  const navigate = useNavigate();

  // Chargement des informations utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Échec de récupération des informations utilisateur');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          const userData = data.data;
          
          // Trouver le nom de la filière basé sur l'ID
          let filiereName = '';
          if (userData.filiere_id) {
            const filiere = filieres.find(f => f.id === userData.filiere_id);
            if (filiere) {
              filiereName = filiere.nom;
            }
          }
          
          setStudentInfo({
            id: userData.id,
            nom: userData.nom || '',
            prenom: userData.prenom || '',
            email: userData.email || '',
            matricule: userData.matricule || '',
            filiere_id: userData.filiere_id,
            filiere: filiereName,
            telephone: userData.telephone || '',
            whatsapp: userData.whatsapp || '',
            role: userData.role || 'etudiant'
          });
          
          // Charger les informations de stage
          if (userData.id) {
            fetchStageData(userData.id, token);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données étudiant:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  // Récupérer les informations de stage
  const fetchStageData = async (userId: number, token: string) => {
    setLoadingStage(true);
    try {
      const response = await fetch(`/api/internships/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStageInfo(data.data);
          setHasFoundInternship(true);
        } else {
          setStageInfo(null);
        }
      } else {
        console.error('Erreur lors de la récupération des informations de stage');
        setStageInfo(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de stage:', error);
      setStageInfo(null);
    } finally {
      setLoadingStage(false);
    }
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
    // Supprimer le token d'authentification
    localStorage.removeItem('token');
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

  // Afficher un message de chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Afficher un message d'erreur si la récupération a échoué
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-4">Erreur</h2>
          <p className="mb-6">{error}</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => navigate('/login')}
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">IS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">ISI Stages</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <p className="text-sm font-medium">{studentInfo.prenom} {studentInfo.nom}</p>
                <p className="text-xs text-gray-500">{studentInfo.filiere || 'Étudiant'}</p>
              </div>
              
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{studentInfo.prenom?.[0] || ''}{studentInfo.nom?.[0] || ''}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                  <div className="py-2 px-4 border-b border-gray-100">
                    <p className="font-medium truncate">{studentInfo.prenom} {studentInfo.nom}</p>
                    <p className="text-sm text-gray-500 truncate">{studentInfo.matricule}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
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
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Mon profil étudiant</h2>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-2xl font-bold">
                          {studentInfo.prenom[0]}{studentInfo.nom[0]}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold">{studentInfo.prenom} {studentInfo.nom}</h3>
                        <p className="text-gray-600">{studentInfo.filiere}</p>
                        <p className="text-sm text-gray-500 mt-1">Matricule: {studentInfo.matricule}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Informations personnelles</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Nom complet</p>
                          <p className="font-medium">{studentInfo.prenom} {studentInfo.nom}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Filière</p>
                          <p className="font-medium">{studentInfo.filiere}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Matricule</p>
                          <p className="font-medium">{studentInfo.matricule}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Coordonnées</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{studentInfo.email || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium">{studentInfo.telephone}</p>
                        </div>
                        
                        {studentInfo.whatsapp && (
                          <div>
                            <p className="text-sm text-gray-500">WhatsApp</p>
                            <p className="font-medium">{studentInfo.whatsapp}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stage' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Informations de Stage</h2>
                  
                  {loadingStage ? (
                    <div className="py-4 flex justify-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                  ) : stageInfo ? (
                    <div className="space-y-8">
                      <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              Vous avez déjà soumis vos informations de stage. Vous pouvez les modifier à tout moment.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informations sur l'entreprise */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nom de l'entreprise</p>
                            <p className="font-medium">{stageInfo.nom_entreprise}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Département</p>
                            <p className="font-medium">{stageInfo.departement}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Commune</p>
                            <p className="font-medium">{stageInfo.commune}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quartier</p>
                            <p className="font-medium">{stageInfo.quartier}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date de début</p>
                            <p className="font-medium">{formatDate(stageInfo.date_debut)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date de fin</p>
                            <p className="font-medium">{formatDate(stageInfo.date_fin)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Informations sur le thème */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Thème de fin d'études</h3>
                        <p className="text-gray-800">{stageInfo.theme_memoire}</p>
                      </div>

                      {/* Informations sur le maître de stage */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Maître de stage</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="font-medium">{stageInfo.nom_maitre_stage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Prénom</p>
                            <p className="font-medium">{stageInfo.prenom_maitre_stage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium">{stageInfo.telephone_maitre_stage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{stageInfo.email_maitre_stage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fonction</p>
                            <p className="font-medium">{stageInfo.fonction_maitre_stage}</p>
                          </div>
                        </div>
                      </div>

                      {/* Informations sur le maître de mémoire */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Maître de mémoire</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="font-medium">{stageInfo.nom_maitre_memoire}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium">{stageInfo.telephone_maitre_memoire}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{stageInfo.email_maitre_memoire}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Statut</p>
                            <p className="font-medium">{stageInfo.statut_maitre_memoire}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                          onClick={handleStartFormClick}
                        >
                          Modifier les informations
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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