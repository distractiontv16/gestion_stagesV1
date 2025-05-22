import React, { useState, useEffect } from 'react';
import { ProjetRealise, PropositionTheme } from '@/types';

interface AdminProjetsFormProps {
  type: 'realises' | 'propositions';
  item?: ProjetRealise | PropositionTheme;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AdminProjetsForm: React.FC<AdminProjetsFormProps> = ({
  type,
  item,
  onSubmit,
  onCancel
}) => {
  // Initialisation des états selon le type
  const [formData, setFormData] = useState<any>(() => {
    if (type === 'realises') {
      return item ? { ...item } : {
        titre: '',
        description: '',
        auteur: '',
        annee: new Date().getFullYear().toString(),
        filiere: '',
        technologies: [],
        points_forts: [''],
        points_amelioration: [''],
      };
    } else {
      return item ? { ...item } : {
        titre: '',
        description: '',
        fonctionnalites: [''],
        auteur: {
          nom: '',
          type: 'Enseignant' as const,
        },
        difficulte: 'Intermédiaire' as const,
        technologies_suggerees: [],
      };
    }
  });
  
  // Gestion des champs de base (titre, description)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Gestion du champ technologies (séparés par des virgules)
  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const techs = value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
    
    if (type === 'realises') {
      setFormData({ ...formData, technologies: techs });
    } else {
      setFormData({ ...formData, technologies_suggerees: techs });
    }
  };
  
  // Gestion des champs auteur pour les propositions
  const handleAuteurChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      auteur: { 
        ...formData.auteur, 
        [name === 'auteurNom' ? 'nom' : name === 'auteurType' ? 'type' : name]: value 
      } 
    });
  };
  
  // Gestion des listes dynamiques (points forts, améliorations, fonctionnalités)
  const handleListChange = (index: number, value: string, field: 'points_forts' | 'points_amelioration' | 'fonctionnalites') => {
    const updatedList = [...formData[field]];
    updatedList[index] = value;
    setFormData({ ...formData, [field]: updatedList });
  };
  
  const addListItem = (field: 'points_forts' | 'points_amelioration' | 'fonctionnalites') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };
  
  const removeListItem = (index: number, field: 'points_forts' | 'points_amelioration' | 'fonctionnalites') => {
    if (formData[field].length <= 1) return;
    const updatedList = [...formData[field]];
    updatedList.splice(index, 1);
    setFormData({ ...formData, [field]: updatedList });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ajout de la date d'ajout si nouvelle entrée
    if (!item) {
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      formData.date_ajout = formattedDate;
    }
    
    // Filtrer les éléments vides des listes
    if (type === 'realises') {
      formData.points_forts = formData.points_forts.filter((point: string) => point.trim() !== '');
      formData.points_amelioration = formData.points_amelioration.filter((point: string) => point.trim() !== '');
    } else {
      formData.fonctionnalites = formData.fonctionnalites.filter((fonc: string) => fonc.trim() !== '');
    }
    
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre et Description (communs aux deux types) */}
      <div className="space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            id="titre"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>
      </div>
      
      {/* Champs spécifiques aux projets réalisés */}
      {type === 'realises' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="auteur" className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
              <input
                type="text"
                id="auteur"
                name="auteur"
                value={formData.auteur}
                onChange={handleChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <input
                type="text"
                id="annee"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                pattern="[0-9]{4}"
                title="Entrez une année à 4 chiffres"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
              <input
                type="text"
                id="filiere"
                name="filiere"
                value={formData.filiere}
                onChange={handleChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-1">Technologies (séparées par des virgules)</label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                value={formData.technologies.join(', ')}
                onChange={handleTechnologiesChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Points forts */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Points forts</label>
              <button 
                type="button" 
                onClick={() => addListItem('points_forts')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Ajouter
              </button>
            </div>
            
            {formData.points_forts.map((point: string, index: number) => (
              <div key={`point-fort-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleListChange(index, e.target.value, 'points_forts')}
                  className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Point fort"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index, 'points_forts')}
                  className="ml-2 text-red-600 hover:text-red-800"
                  disabled={formData.points_forts.length <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Points d'amélioration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Points d'amélioration</label>
              <button 
                type="button" 
                onClick={() => addListItem('points_amelioration')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Ajouter
              </button>
            </div>
            
            {formData.points_amelioration.map((point: string, index: number) => (
              <div key={`point-amelioration-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleListChange(index, e.target.value, 'points_amelioration')}
                  className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Point d'amélioration"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index, 'points_amelioration')}
                  className="ml-2 text-red-600 hover:text-red-800"
                  disabled={formData.points_amelioration.length <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Champs spécifiques aux propositions de thèmes */}
      {type === 'propositions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="auteurNom" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'auteur</label>
              <input
                type="text"
                id="auteurNom"
                name="auteurNom"
                value={formData.auteur.nom}
                onChange={handleAuteurChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="auteurType" className="block text-sm font-medium text-gray-700 mb-1">Type d'auteur</label>
              <select
                id="auteurType"
                name="auteurType"
                value={formData.auteur.type}
                onChange={handleAuteurChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Enseignant">Enseignant</option>
                <option value="Étudiant">Étudiant</option>
                <option value="Entreprise">Entreprise</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulte" className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
              <select
                id="difficulte"
                name="difficulte"
                value={formData.difficulte}
                onChange={handleChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Facile">Facile</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="technologies_suggerees" className="block text-sm font-medium text-gray-700 mb-1">Technologies suggérées (séparées par des virgules)</label>
              <input
                type="text"
                id="technologies_suggerees"
                name="technologies_suggerees"
                value={formData.technologies_suggerees.join(', ')}
                onChange={handleTechnologiesChange}
                className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Fonctionnalités */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Fonctionnalités</label>
              <button 
                type="button" 
                onClick={() => addListItem('fonctionnalites')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Ajouter
              </button>
            </div>
            
            {formData.fonctionnalites.map((fonctionnalite: string, index: number) => (
              <div key={`fonctionnalite-${index}`} className="flex mb-2">
                <input
                  type="text"
                  value={fonctionnalite}
                  onChange={(e) => handleListChange(index, e.target.value, 'fonctionnalites')}
                  className="px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fonctionnalité"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeListItem(index, 'fonctionnalites')}
                  className="ml-2 text-red-600 hover:text-red-800"
                  disabled={formData.fonctionnalites.length <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Boutons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          {item ? 'Enregistrer les modifications' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}; 