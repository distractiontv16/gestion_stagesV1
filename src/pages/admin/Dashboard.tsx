import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { UsersIcon, ClipboardListIcon, BellIcon, SearchIcon, BriefcaseIcon, BookOpenIcon, SettingsIcon } from 'lucide-react';
import { AdminProjetsTab } from '@/components/ui/admin-projets-tab';
import { AdminDashboardOverview } from '@/components/ui/admin-dashboard-overview';
import { AdminStudentsTab } from '@/components/ui/admin-students-tab';
import { AdminParametresTab } from '@/components/ui/admin-parametres-tab';
import { AdminSystemParams } from '@/components/ui/admin-system-params';

// Interface pour les informations d'utilisateur
interface UserInfo {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  matricule: string;
  role?: string;
}

// Données fictives pour la démo
const stageStats = [
  { filiere: 'GEI/EE', count: 15, color: '#3B82F6' },
  { filiere: 'GEI/IT', count: 24, color: '#60A5FA' },
  { filiere: 'GE/ER', count: 18, color: '#93C5FD' },
  { filiere: 'GMP', count: 12, color: '#2563EB' },
];

const stageByEntrepriseData = [
  { entreprise: 'SONATEL', count: 8 },
  { entreprise: 'FREE', count: 6 },
  { entreprise: 'SGBS', count: 5 },
  { entreprise: 'EXPRESSO', count: 4 },
  { entreprise: 'GCE', count: 4 },
];

// Liste fictive d'étudiants
const students = [
  { id: 1, nom: 'Diallo', prenom: 'Mamadou', matricule: 'ETU1234', filiere: 'GEI/IT', entreprise: 'SONATEL', statut: 'en_cours' },
  { id: 2, nom: 'Sow', prenom: 'Fatou', matricule: 'ETU2345', filiere: 'GEI/EE', entreprise: 'FREE', statut: 'en_cours' },
  { id: 3, nom: 'Ndiaye', prenom: 'Abdou', matricule: 'ETU3456', filiere: 'GMP', entreprise: 'GCE', statut: 'termine' },
  { id: 4, nom: 'Ba', prenom: 'Aminata', matricule: 'ETU4567', filiere: 'GEI/IT', entreprise: 'SGBS', statut: 'en_cours' },
  { id: 5, nom: 'Diop', prenom: 'Cheikh', matricule: 'ETU5678', filiere: 'GE/ER', entreprise: 'EXPRESSO', statut: 'abandonne' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<UserInfo>({
    nom: '',
    prenom: '',
    matricule: '',
  });
  
  // Données fictives pour les propositions de stages
  const [internshipProposals, setInternshipProposals] = useState([
    {
      id: 1,
      company: 'SONATEL',
      position: 'Développeur Full Stack',
      location: 'Dakar, Sénégal',
      description: 'Stage de fin d\'études pour le développement d\'applications web modernes.',
      requirements: 'React, Node.js, MongoDB',
      duration: '6 mois',
      filiere: 'GEI/IT'
    },
    {
      id: 2,
      company: 'FREE',
      position: 'Ingénieur Réseau',
      location: 'Dakar, Sénégal',
      description: 'Stage dans le domaine des réseaux et télécommunications.',
      requirements: 'Cisco, Réseaux IP, Administration système',
      duration: '4 mois',
      filiere: 'GEI/EE'
    },
    {
      id: 3,
      company: 'SGBS',
      position: 'Analyste de données',
      location: 'Dakar, Sénégal',
      description: 'Stage d\'analyse de données financières et création de tableaux de bord.',
      requirements: 'Excel, Power BI, SQL',
      duration: '5 mois',
      filiere: 'GE/ER'
    }
  ]);
  
  // État pour le formulaire d'ajout de proposition de stage
  const [newProposal, setNewProposal] = useState({
    company: '',
    position: '',
    location: '',
    description: '',
    requirements: '',
    duration: '',
    filiere: ''
  });
  
  // Filtrage des étudiants
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      searchQuery === '' || 
      student.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.entreprise.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFiliere = filterFiliere === '' || student.filiere === filterFiliere;
    
    return matchesSearch && matchesFiliere;
  });
  
  // Chargement des informations administrateur
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        console.log('Token récupéré:', token.substring(0, 20) + '...');
        
        // Utiliser l'URL relative pour profiter du proxy configuré dans vite.config.js
        let apiUrl = 'http://localhost:3000/api/auth/me';
        console.log('Tentative avec URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Réponse API /auth/me - Status:', response.status);
        
        if (!response.ok) {
          throw new Error('Échec de récupération des informations utilisateur');
        }
        
        const data = await response.json();
        console.log('Structure de la réponse API /auth/me:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data) {
          // Vérifier si l'utilisateur est bien un administrateur
          console.log('Rôle détecté:', data.data.role);
          if (data.data.role !== 'admin') {
            navigate('/student/dashboard');
            return;
          }
          
          // Formatage des données utilisateur
          setAdminInfo({
            id: data.data.id,
            nom: data.data.nom || '',
            prenom: data.data.prenom || '',
            email: data.data.email || '',
            matricule: data.data.matricule || '',
            role: data.data.role
          });
        } else {
          console.error('Données invalides reçues:', data);
          setError('Impossible de charger les informations administrateur');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données administrateur:', err);
        setError('Erreur lors du chargement des données administrateur');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [navigate]);
  
  const handleLogout = () => {
    // Supprimer le token d'authentification
    localStorage.removeItem('token');
    console.log("Déconnexion de l'administrateur");
    // Redirection vers la page de login
    navigate('/login');
  };
  
  // Gestion du formulaire d'ajout de proposition
  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProposal(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = internshipProposals.length + 1;
    setInternshipProposals(prev => [...prev, { ...newProposal, id }]);
    setNewProposal({
      company: '',
      position: '',
      location: '',
      description: '',
      requirements: '',
      duration: '',
      filiere: ''
    });
    alert('Proposition de stage ajoutée avec succès!');
  };
  
  const handleDeleteProposal = (id: number) => {
    setInternshipProposals(prev => prev.filter(proposal => proposal.id !== id));
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barre latérale */}
      <aside className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">ISI Stages</h1>
          <p className="text-gray-400 text-sm">Portail Administrateur</p>
          <p className="text-white font-medium mt-2">{adminInfo.prenom} {adminInfo.nom}</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Tableau de bord</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('students')}
              >
                <UsersIcon className="w-5 h-5" />
                <span>Étudiants</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'evaluations' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('evaluations')}
              >
                <ClipboardListIcon className="w-5 h-5" />
                <span>Évaluations</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'proposals' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('proposals')}
              >
                <BriefcaseIcon className="w-5 h-5" />
                <span>Propositions de stages</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'projets' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('projets')}
              >
                <BookOpenIcon className="w-5 h-5" />
                <span>Projets</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'parametres' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('parametres')}
              >
                <SettingsIcon className="w-5 h-5" />
                <span>Paramètres</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                onClick={() => setActiveTab('notifications')}
              >
                <BellIcon className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {activeTab === 'dashboard' && 'Tableau de Bord'}
              {activeTab === 'students' && 'Gestion des Étudiants'}
              {activeTab === 'evaluations' && 'Évaluations'}
              {activeTab === 'proposals' && 'Propositions de Stages'}
              {activeTab === 'projets' && 'Gestion des Projets'}
              {activeTab === 'parametres' && 'Paramètres du système'}
              {activeTab === 'notifications' && 'Notifications'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:inline">{adminInfo.matricule}</span>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Contenu de page */}
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'dashboard' && (
            <AdminDashboardOverview />
          )}

          {activeTab === 'students' && (
            <AdminStudentsTab />
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Évaluations</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <p>Module d'évaluation des stages - En cours de développement</p>
              </div>
            </div>
          )}
          
          {activeTab === 'parametres' && (
            <div className="space-y-10">
              <AdminParametresTab />
              <AdminSystemParams />
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Propositions de Stages</h2>
              
              {/* Formulaire d'ajout de proposition */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Ajouter une proposition</h3>
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">Entreprise</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={newProposal.company}
                        onChange={handleProposalChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">Poste</label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={newProposal.position}
                        onChange={handleProposalChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lieu</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={newProposal.location}
                        onChange={handleProposalChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durée</label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={newProposal.duration}
                        onChange={handleProposalChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">Compétences requises</label>
                      <input
                        type="text"
                        id="requirements"
                        name="requirements"
                        value={newProposal.requirements}
                        onChange={handleProposalChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="filiere" className="block text-sm font-medium text-gray-700">Filière cible</label>
                      <select
                        id="filiere"
                        name="filiere"
                        value={newProposal.filiere}
                        onChange={handleProposalChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Sélectionner une filière</option>
                        <option value="GEI/EE">GEI/EE</option>
                        <option value="GEI/IT">GEI/IT</option>
                        <option value="GE/ER">GE/ER</option>
                        <option value="GMP">GMP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newProposal.description}
                      onChange={handleProposalChange}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ajouter la proposition
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Liste des propositions existantes */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Propositions existantes</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                      {internshipProposals.map(proposal => (
                    <li key={proposal.id} className="p-4">
                          <div className="flex justify-between">
                            <div>
                          <h4 className="font-bold">{proposal.position}</h4>
                          <p className="text-blue-600">{proposal.company}</p>
                          <p className="text-sm text-gray-600">{proposal.location} • {proposal.duration}</p>
                          <p className="mt-1">{proposal.description}</p>
                          <div className="mt-1">
                            <span className="text-sm font-medium">Compétences:</span>
                            <span className="text-sm text-gray-600 ml-1">{proposal.requirements}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-sm font-medium">Filière cible:</span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-1">{proposal.filiere}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette proposition?')) {
                              // Simulation de suppression
                              alert(`Proposition ${proposal.id} supprimée`);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'projets' && <AdminProjetsTab />}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Envoyer une notification</h3>
              <form className="space-y-4">
                <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Destinataire</label>
                  <select
                      id="recipient"
                      name="recipient"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="all">Tous les étudiants</option>
                      <option value="GEI/EE">Filière GEI/EE</option>
                      <option value="GEI/IT">Filière GEI/IT</option>
                      <option value="GE/ER">Filière GE/ER</option>
                      <option value="GMP">Filière GMP</option>
                  </select>
                </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Titre de la notification"
                    />
                  </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    id="message"
                      name="message"
                    rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Contenu de la notification"
                  ></textarea>
                </div>
                  <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                      Envoyer
                  </button>
                </div>
              </form>
              </div>
              
              {/* Historique des notifications */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Historique des notifications</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium">Rappel des dossiers de fin de stage</p>
                    <p className="text-sm text-gray-600">Envoyé à tous les étudiants - Il y a 2 jours</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-medium">Nouvelle offre de stage disponible</p>
                    <p className="text-sm text-gray-600">Envoyé à la filière GEI/IT - Il y a 1 semaine</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 