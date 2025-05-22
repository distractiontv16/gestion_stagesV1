import React, { useState } from 'react';
import { ProjetRealise } from '@/types';
import { SearchBar } from './search-bar';

interface ProjetsRealisesProps {
  projets: ProjetRealise[];
}

export const ProjetsRealises: React.FC<ProjetsRealisesProps> = ({ projets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjet, setSelectedProjet] = useState<ProjetRealise | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Filtrer les projets en fonction du terme de recherche
  const filteredProjets = projets.filter(projet => {
    const matchesSearch = 
      projet.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));

    // Si un filtre est actif, l'appliquer également
    if (activeFilter) {
      return matchesSearch && projet.filiere === activeFilter;
    }
    
    return matchesSearch;
  });

  // Obtenir les filières uniques pour les filtres
  const filieres = [...new Set(projets.map(projet => projet.filiere))];

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterClick = (filiere: string) => {
    if (activeFilter === filiere) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filiere);
    }
  };

  const handleProjetClick = (projet: ProjetRealise) => {
    setSelectedProjet(projet);
  };

  const closeModal = () => {
    setSelectedProjet(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <SearchBar
          placeholder="Rechercher un projet par titre, description, auteur ou technologie..."
          onSearch={handleSearchChange}
        />
        
        <div className="flex flex-wrap gap-2">
          {filieres.map(filiere => (
            <button
              key={filiere}
              onClick={() => handleFilterClick(filiere)}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                activeFilter === filiere
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filiere}
            </button>
          ))}
        </div>
      </div>

      {filteredProjets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun projet correspondant trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjets.map((projet) => (
            <div
              key={projet.id}
              className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => handleProjetClick(projet)}
            >
              <h3 className="font-bold text-lg mb-1">{projet.titre}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {projet.auteur} • {projet.annee} • {projet.filiere}
              </p>
              <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                {projet.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {projet.technologies.slice(0, 3).map((tech, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {projet.technologies.length > 3 && (
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                    +{projet.technologies.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détaillé pour le projet sélectionné */}
      {selectedProjet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProjet.titre}</h2>
                  <p className="text-gray-600">
                    {selectedProjet.auteur} • {selectedProjet.annee} • {selectedProjet.filiere}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-semibold mb-1">Description</h3>
                  <p className="text-gray-700">{selectedProjet.description}</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-1">Technologies utilisées</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProjet.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-1">Points forts du projet</h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {selectedProjet.points_forts.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-1">Points d'amélioration possibles</h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {selectedProjet.points_amelioration.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </section>

                <div className="text-xs text-gray-500">
                  Ajouté le {selectedProjet.date_ajout || 'date inconnue'}
                  {selectedProjet.ajoute_par ? ` par ${selectedProjet.ajoute_par}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 