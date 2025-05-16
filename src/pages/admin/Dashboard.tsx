import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { UsersIcon, ClipboardListIcon, BellIcon, SearchIcon, BriefcaseIcon } from 'lucide-react';

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
  
  const handleLogout = () => {
    // Dans un cas réel, vous effaceriez ici les tokens d'authentification
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barre latérale */}
      <aside className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">ISI Stages</h1>
          <p className="text-gray-400 text-sm">Portail Administrateur</p>
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
              {activeTab === 'notifications' && 'Notifications'}
            </h1>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Contenu de page */}
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Cartes de statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-500">Étudiants</h3>
                  <p className="text-2xl font-bold mt-1">72</p>
                  <p className="text-xs text-green-500 mt-2">+5% cette semaine</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-500">Stages en cours</h3>
                  <p className="text-2xl font-bold mt-1">54</p>
                  <p className="text-xs text-yellow-500 mt-2">75% des étudiants</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-500">Stages terminés</h3>
                  <p className="text-2xl font-bold mt-1">12</p>
                  <p className="text-xs text-green-500 mt-2">17% des étudiants</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-500">Stages abandonnés</h3>
                  <p className="text-2xl font-bold mt-1">6</p>
                  <p className="text-xs text-red-500 mt-2">8% des étudiants</p>
                </div>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Répartition par filière</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stageStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          label={({ filiere, count }) => `${filiere}: ${count}`}
                        >
                          {stageStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Stages par entreprise</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stageByEntrepriseData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="entreprise" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Nombre d'étudiants" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Barre de recherche et filtres */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Rechercher un étudiant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="w-full md:w-48">
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filterFiliere}
                      onChange={(e) => setFilterFiliere(e.target.value)}
                    >
                      <option value="">Toutes les filières</option>
                      <option value="GEI/EE">GEI/EE</option>
                      <option value="GEI/IT">GEI/IT</option>
                      <option value="GE/ER">GE/ER</option>
                      <option value="GMP">GMP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Liste des étudiants */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Étudiant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Matricule
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Filière
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Entreprise
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Statut
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.prenom} {student.nom}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.matricule}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.filiere}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.entreprise}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.statut === 'en_cours'
                                ? 'bg-yellow-100 text-yellow-800'
                                : student.statut === 'termine'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.statut === 'en_cours'
                              ? 'En cours'
                              : student.statut === 'termine'
                              ? 'Terminé'
                              : 'Abandonné'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            Voir
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            Évaluer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Gestion des Évaluations</h2>
              <p className="text-gray-600 mb-6">
                Cette section vous permet d'évaluer les stages des étudiants et d'ajouter des observations.
              </p>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-center text-gray-500">
                  Sélectionnez un étudiant dans la section "Étudiants" pour l'évaluer.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter une proposition de stage</h2>
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={newProposal.company}
                        onChange={handleProposalChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Poste
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={newProposal.position}
                        onChange={handleProposalChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Lieu
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={newProposal.location}
                        onChange={handleProposalChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={newProposal.duration}
                        onChange={handleProposalChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ex: 6 mois"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-1">
                        Filière cible
                      </label>
                      <select
                        id="filiere"
                        name="filiere"
                        value={newProposal.filiere}
                        onChange={handleProposalChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Sélectionnez une filière</option>
                        <option value="GEI/IT">GEI/IT</option>
                        <option value="GEI/EE">GEI/EE</option>
                        <option value="GE/ER">GE/ER</option>
                        <option value="GMP">GMP</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={newProposal.description}
                      onChange={handleProposalChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                      Compétences requises
                    </label>
                    <input
                      type="text"
                      id="requirements"
                      name="requirements"
                      value={newProposal.requirements}
                      onChange={handleProposalChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ex: React, Node.js, MongoDB"
                      required
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ajouter la proposition
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Liste des propositions de stage</h2>
                </div>
                <div className="p-4">
                  {internshipProposals.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune proposition de stage n'a été ajoutée.</p>
                  ) : (
                    <div className="space-y-4">
                      {internshipProposals.map(proposal => (
                        <div key={proposal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{proposal.position}</h3>
                              <p className="text-blue-600 font-medium">{proposal.company}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">{proposal.location}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                <span className="text-sm text-gray-600">{proposal.duration}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{proposal.filiere}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteProposal(proposal.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="mt-2 text-gray-700">{proposal.description}</p>
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700">Compétences requises:</span>
                            <p className="text-sm text-gray-600">{proposal.requirements}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Gestion des Notifications</h2>
              <p className="text-gray-600 mb-4">
                Envoyez des notifications aux étudiants concernant leurs stages.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="notification-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de notification
                  </label>
                  <select
                    id="notification-type"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option>Rappel</option>
                    <option>Information</option>
                    <option>Urgence</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Saisissez votre message..."
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                    Destinataires
                  </label>
                  <select
                    id="recipients"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option>Tous les étudiants</option>
                    <option>GEI/EE</option>
                    <option>GEI/IT</option>
                    <option>GE/ER</option>
                    <option>GMP</option>
                  </select>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Envoyer la notification
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 