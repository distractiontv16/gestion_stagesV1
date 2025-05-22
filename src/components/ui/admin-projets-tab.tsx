import React, { useState, useEffect } from 'react';
import { ProjetRealise, PropositionTheme } from '@/types';
import { SearchBar } from './search-bar';
import { AdminProjetsForm } from './admin-projets-form';

// Importer les données fictives depuis le composant précédent
import { projetsFictifs, propositionsFictives } from './projets-tab';

interface AdminProjetsTabProps {
  // Props si nécessaire
}

export const AdminProjetsTab: React.FC<AdminProjetsTabProps> = () => {
  const [activeTab, setActiveTab] = useState<'realises' | 'propositions'>('realises');
  const [projets, setProjets] = useState<ProjetRealise[]>([]);
  const [propositions, setPropositions] = useState<PropositionTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<ProjetRealise | PropositionTheme | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Charger les données (fictives pour l'instant)
  useEffect(() => {
    setLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setProjets(projetsFictifs);
      setPropositions(propositionsFictives);
      setLoading(false);
    }, 500);
  }, []);
  
  // Filtrer les éléments en fonction du terme de recherche
  const filteredProjets = projets.filter(projet => 
    projet.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projet.auteur.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPropositions = propositions.filter(proposition => 
    proposition.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposition.auteur.nom.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  const handleDelete = (id: number) => {
    if (activeTab === 'realises') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        setProjets(projets.filter(projet => projet.id !== id));
      }
    } else {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette proposition?')) {
        setPropositions(propositions.filter(proposition => proposition.id !== id));
      }
    }
  };
  
  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };
  
  const handleFormSubmit = (data: ProjetRealise | PropositionTheme) => {
    if (activeTab === 'realises') {
      const isEditing = editingItem !== null;
      
      if (isEditing) {
        // Mise à jour d'un projet existant
        setProjets(projets.map(projet => 
          projet.id === (editingItem as ProjetRealise).id ? { ...data, id: projet.id } as ProjetRealise : projet
        ));
      } else {
        // Ajout d'un nouveau projet
        const maxId = projets.reduce((max, projet) => Math.max(max, projet.id), 0);
        setProjets([...projets, { ...data, id: maxId + 1 } as ProjetRealise]);
      }
    } else {
      const isEditing = editingItem !== null;
      
      if (isEditing) {
        // Mise à jour d'une proposition existante
        setPropositions(propositions.map(proposition => 
          proposition.id === (editingItem as PropositionTheme).id ? { ...data, id: proposition.id } as PropositionTheme : proposition
        ));
      } else {
        // Ajout d'une nouvelle proposition
        const maxId = propositions.reduce((max, proposition) => Math.max(max, proposition.id), 0);
        setPropositions([...propositions, { ...data, id: maxId + 1 } as PropositionTheme]);
      }
    }
    
    closeForm();
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
      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
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
                        Aucun projet trouvé
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
                          {projet.filiere}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {projet.technologies.slice(0, 2).map((tech, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {tech}
                              </span>
                            ))}
                            {projet.technologies.length > 2 && (
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                                +{projet.technologies.length - 2}
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
                          {proposition.auteur.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposition.auteur.type}
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
                          {proposition.date_ajout}
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