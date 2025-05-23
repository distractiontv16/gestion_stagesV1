import React, { useState, useEffect, useCallback } from 'react';
// import { ProjetRealise, Filiere } from '@/types'; // Commenté pour utiliser des définitions locales temporaires
// import { PropositionTheme } from '@/types'; // Supprimer cet import car PropositionTheme est défini localement
import { SearchBar } from './search-bar';
import { AdminProjetsForm } from './admin-projets-form';



// Définition locale de Filiere (si non exportée de @/types)
interface Filiere {
  filiere_id: number;
  filiere_nom: string;
}

// Définition locale de ProjetRealise pour correspondre à l'API
interface ProjetRealise { 
  id: number;
  titre: string;
  description?: string | null; // Rendre optionnel ou nullable si c'est le cas
  auteur?: string | null;
  annee?: number | null;
  filiere_id?: number | null;
  nom_filiere?: string | null;
  technologies?: string[] | null;
  points_forts?: string[] | null;
  points_amelioration?: string[] | null;
  date_publication?: string | null; // ou Date
  created_at?: string;
  updated_at?: string;
}

// Définition locale de PropositionTheme pour correspondre à l'API
interface PropositionTheme {
  id: number;
  titre: string;
  description?: string | null;
  auteur_nom?: string | null;
  auteur_type?: 'enseignant' | 'entreprise' | 'etudiant' | 'autre' | null;
  filiere_id?: number | null;
  nom_filiere?: string | null; // Ajouté par la jointure SQL
  entreprise_nom?: string | null;
  email_contact?: string | null;
  difficulte?: 'Facile' | 'Intermédiaire' | 'Difficile' | 'Non spécifiée' | null;
  technologies_suggerees?: string[] | null;
  objectifs_pedagogiques?: string | null;
  est_validee?: boolean | null;
  statut?: 'soumise' | 'approuvee' | 'rejetee' | 'archivee' | null;
  date_soumission?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AdminProjetsTabProps {
  // Props si nécessaire
}

export const AdminProjetsTab: React.FC<AdminProjetsTabProps> = () => {
  const [activeTab, setActiveTab] = useState<'realises' | 'propositions'>('realises');
  const [projets, setProjets] = useState<ProjetRealise[]>([]);
  const [propositions, setPropositions] = useState<PropositionTheme[]>([]); // Initialiser à vide
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  
  const [isLoading, setIsLoading] = useState(false); // Chargement principal pour l'onglet actif
  const [isLoadingFilieres, setIsLoadingFilieres] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFilieres, setErrorFilieres] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<ProjetRealise | PropositionTheme | null>(null);
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = '/api/admin'; // Ajuster si nécessaire

  const fetchProjetsRealises = useCallback(async (token: string | null) => {
    setIsLoading(true);
    setError(null);
    if (!token) { setError('Token authentification manquant'); setIsLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/projets-realises`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // Gestion de la réponse non JSON (ex: erreur HTML)
      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Réponse inattendue du serveur: ${response.status} - ${text}`);
      }
      const data = await response.json(); // Renommé de result à data pour clarté
      if (!response.ok) throw new Error(data.message || `HTTP error! ${response.status}`);
      // L'API projets-realises ne retourne pas de champ 'success', elle retourne directement les données ou une erreur
      setProjets(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Erreur fetchProjetsRealises:", errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Nouvelle fonction pour récupérer les propositions de thèmes
  const fetchPropositionsThemes = useCallback(async (token: string | null) => {
    setIsLoading(true);
    setError(null);
    if (!token) { setError('Token authentification manquant'); setIsLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/propositions-themes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Réponse inattendue du serveur: ${response.status} - ${text}`);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! ${response.status}`);
      setPropositions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Erreur fetchPropositionsThemes:", errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilieresForForm = useCallback(async (token: string | null) => {
    setIsLoadingFilieres(true);
    setErrorFilieres(null);
    if (!token) { setErrorFilieres('Token manquant'); setIsLoadingFilieres(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/parametres/filiere`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Réponse inattendue du serveur (filières): ${response.status} - ${text}`);
      }
      const result = await response.json();
      // L'API filieres retourne { success: boolean, data: [] } ou { success: false, message: string }
      if (result.success && Array.isArray(result.data)) {
        setFilieres(result.data.map((item: any) => ({ filiere_id: item.filiere_id, filiere_nom: item.filiere_nom })));
      } else if (!result.success) {
        throw new Error(result.message || 'Échec de la récupération des filières (success false)');
      } else {
         throw new Error('Format de données des filières inattendu.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setErrorFilieres(errorMessage);
      console.error("Erreur fetchFilieresForForm:", errorMessage, err);
    } finally {
      setIsLoadingFilieres(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
      // Optionnel: rediriger vers la page de login
      return;
    }
    if (activeTab === 'realises') {
      fetchProjetsRealises(token);
    } else if (activeTab === 'propositions') {
      fetchPropositionsThemes(token); // Appeler la nouvelle fonction
    }
    fetchFilieresForForm(token);
  }, [activeTab, fetchProjetsRealises, fetchPropositionsThemes, fetchFilieresForForm]);
  
  const filteredProjets = projets.filter(projet => 
    (projet.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (projet.auteur?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (projet.nom_filiere?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const filteredPropositions = propositions.filter(proposition => 
    (proposition.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (proposition.auteur_nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (proposition.nom_filiere?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };
  
  const handleEdit = (item: ProjetRealise | PropositionTheme) => {
    setEditingItem(item);
    setShowForm(true);
  };
  
  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) { alert('Non authentifié'); return; }

    const isProjet = activeTab === 'realises';
    const endpoint = isProjet ? `${API_BASE_URL}/projets-realises/${id}` : `${API_BASE_URL}/propositions-themes/${id}`;
    const itemName = isProjet ? 'projet réalisé' : 'proposition de thème';

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce ${itemName}?`)) {
      setIsLoading(true);
      try {
        const response = await fetch(endpoint, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        // Pas toujours de .json() sur un DELETE réussi, vérifier le statut
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Erreur lors de la suppression ${itemName}`}) );
          throw new Error(errorData.message || `Erreur HTTP ${response.status} lors de la suppression`);
        }
        // Un simple message peut suffire si le backend retourne 200 OK sans corps ou un message simple
        alert(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} supprimé avec succès!`);
        if (isProjet) {
          fetchProjetsRealises(token);
        } else {
          fetchPropositionsThemes(token);
        }
      } catch (err) { 
        const errorMessage = err instanceof Error ? err.message : String(err);
        alert(`Erreur: ${errorMessage}`);
        setError(errorMessage);
        console.error(`Erreur handleDelete ${itemName}:`, errorMessage, err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };
  
  const handleFormSubmit = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) { alert('Non authentifié'); return; }

    setIsLoading(true);
    const isProjet = activeTab === 'realises';
    let endpoint = isProjet ? `${API_BASE_URL}/projets-realises` : `${API_BASE_URL}/propositions-themes`;
    let method = 'POST';
    const itemName = isProjet ? 'projet réalisé' : 'proposition de thème';

    // Pour la mise à jour, l'ID est dans editingItem
    if (editingItem && editingItem.id) {
      endpoint = `${endpoint}/${editingItem.id}`;
      method = 'PUT';
    }

    // Nettoyer formData pour éviter d'envoyer des champs non attendus ou vides qui pourraient causer des erreurs SQL
    // Par exemple, si filiere_id est une string vide, la convertir en null.
    const dataToSubmit = { ...formData };
    if (dataToSubmit.filiere_id === '' || dataToSubmit.filiere_id === undefined) {
        dataToSubmit.filiere_id = null;
    }
    // Pour les champs spécifiques à proposition ou projet, s'assurer qu'ils sont bien envoyés ou null
    if (isProjet) {
        // S'assurer que les champs spécifiques à projet sont bien formatés si nécessaire
    } else {
        // S'assurer que les champs spécifiques à proposition sont bien formatés
        // exemple: technologies_suggerees doit être un array
        if (typeof dataToSubmit.technologies_suggerees === 'string') {
            dataToSubmit.technologies_suggerees = dataToSubmit.technologies_suggerees.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        } else if (!Array.isArray(dataToSubmit.technologies_suggerees)) {
            dataToSubmit.technologies_suggerees = [];
        }
    }

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSubmit),
      });

      // Gestion de la réponse non JSON
      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Réponse inattendue du serveur (${method} ${itemName}): ${response.status} - ${text}`);
      }

      const result = await response.json();
      // Les contrôleurs retournent directement les données (200 ou 201) ou un objet erreur ({message: ...}) avec un statut > 400
      if (!response.ok) throw new Error(result.message || `Erreur ${method === 'POST' ? 'création' : 'MàJ'} ${itemName}`);
      
      alert(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} ${method === 'POST' ? 'créé' : 'mis à jour'} avec succès!`);
      
      if (isProjet) {
        fetchProjetsRealises(token);
      } else {
        fetchPropositionsThemes(token);
      }
      closeForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Erreur: ${errorMessage}`);
      setError(errorMessage); // Afficher l'erreur principale pour l'onglet
      console.error(`Erreur handleFormSubmit ${itemName}:`, errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Gestion des Projets et Propositions</h2>
      
      {/* Navigation entre les onglets */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'realises'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('realises')}
        >
          Projets réalisés
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'propositions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('propositions')}
        >
          Propositions de thèmes
        </button>
      </div>
      
      {/* En-tête avec recherche et bouton d'ajout */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <SearchBar
          placeholder={`Rechercher un ${activeTab === 'realises' ? 'projet' : 'thème'}...`}
          onSearch={handleSearchChange}
          className="w-full md:w-80"
        />
        
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Ajouter {activeTab === 'realises' ? 'un projet' : 'une proposition'}
        </button>
      </div>
      
      {/* État de chargement */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : error && activeTab === 'realises' ? (
        <p className="text-center text-red-500 py-10">Erreur lors du chargement des projets: {error}</p>
      ) : (
        <>
          {/* Tableau des projets réalisés */}
          {activeTab === 'realises' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filière
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technologies
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun projet réalisé trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredProjets.map((projet) => (
                      <tr key={projet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {projet.titre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {projet.auteur}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {projet.annee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {projet.nom_filiere || `ID: ${projet.filiere_id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {(projet.technologies || []).slice(0, 2).map((tech, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {tech}
                              </span>
                            ))}
                            {(projet.technologies?.length || 0) > 2 && (
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                                +{(projet.technologies?.length || 0) - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(projet)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(projet.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Tableau des propositions de thèmes */}
          {activeTab === 'propositions' && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulté
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'ajout
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPropositions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune proposition trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredPropositions.map((proposition) => (
                      <tr key={proposition.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {proposition.titre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposition.auteur_nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposition.auteur_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            proposition.difficulte === 'Facile' ? 'bg-green-100 text-green-800' : 
                            proposition.difficulte === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {proposition.difficulte}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposition.date_soumission}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(proposition)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(proposition.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Modal du formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'realises' ? 'un projet' : 'une proposition'}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <AdminProjetsForm
                type={activeTab}
                item={editingItem as any}
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 