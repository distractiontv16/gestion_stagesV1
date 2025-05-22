import { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';

// Interfaces
interface Student {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  filiere: string;
  entreprise: string | null;
  statut: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function AdminStudentsTab() {
  // États pour les données et filtres
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [filieres, setFilieres] = useState<{id: number, nom: string}[]>([]);
  
  // États pour le tri
  const [sortField, setSortField] = useState<string>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fonction pour charger les étudiants
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Construction des paramètres de requête
      const params = new URLSearchParams();
      if (searchQuery) params.append('recherche', searchQuery);
      if (filterFiliere) params.append('filiere', filterFiliere);
      if (filterStatut) params.append('statut', filterStatut);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // Appel de l'API
      const response = await fetch(`/api/admin/etudiants?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des étudiants');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data.etudiants);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger la liste des étudiants');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour charger les filières
  const fetchFilieres = async () => {
    try {
      // Cette requête pourrait être implémentée dans un contrôleur dédié
      // Pour l'instant, nous utilisons les filières stockées dans les paramètres
      const response = await fetch('/api/admin/parametres/filiere', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des filières');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Extraire les informations des filières
        const filieresData = data.data.map((param: any) => ({
          id: param.filiere_id,
          nom: param.filiere_nom
        }));
        
        setFilieres(filieresData);
      } else {
        console.error('Format de données invalide:', data);
        throw new Error('Format de données invalide pour les filières');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des filières:', err);
      setError(`Impossible de charger les filières: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      console.log('Début du chargement des données de l\'onglet étudiants');
      try {
        await fetchFilieres();
        console.log('Filières chargées avec succès');
        await fetchStudents();
        console.log('Étudiants chargés avec succès');
      } catch (err) {
        console.error('Erreur lors du chargement initial des données:', err);
      }
    };
    
    loadData();
  }, []);

  // Récupérer les données lorsque les filtres changent
  useEffect(() => {
    if (pagination.page > 0 && filieres.length > 0) {
      fetchStudents();
    }
  }, [pagination.page, pagination.limit, filterFiliere, filterStatut]);

  // Fonction pour la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };
  
  // Fonction pour le changement de page
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Fonction pour l'export des données
  const handleExport = async () => {
    try {
      // Construction des paramètres de requête pour l'export
      const params = new URLSearchParams();
      if (searchQuery) params.append('recherche', searchQuery);
      if (filterFiliere) params.append('filiere', filterFiliere);
      if (filterStatut) params.append('statut', filterStatut);
      params.append('export', 'true'); // Indique au backend d'envoyer toutes les données
      
      // Notification de démarrage de l'export
      alert('Export des données en cours...');
      
      // Cette fonctionnalité devra être implémentée côté serveur pour générer un fichier CSV/Excel
      // Pour l'instant, cela affichera simplement une notification
      setTimeout(() => {
        alert('Fonctionnalité d\'export non implémentée dans cette version');
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      setError('Impossible d\'exporter les données');
    }
  };

  // Formater le statut du stage pour l'affichage
  const formatStatut = (statut: string) => {
    switch (statut) {
      case 'en_cours':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            En cours
          </span>
        );
      case 'termine':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Terminé
          </span>
        );
      case 'abandonne':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Abandonné
          </span>
        );
      case 'non_defini':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Non défini
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {statut}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Afficher les erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
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
              {filieres.map(filiere => (
                <option key={filiere.id} value={filiere.nom}>{filiere.nom}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="abandonne">Abandonné</option>
              <option value="non_defini">Non défini</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="spinner-border text-blue-600" role="status">
              <span className="sr-only">Chargement...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {students.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        setSortField('nom');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      Étudiant {sortField === 'nom' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        setSortField('matricule');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      Matricule {sortField === 'matricule' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        setSortField('filiere');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      Filière {sortField === 'filiere' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        setSortField('entreprise');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      Entreprise {sortField === 'entreprise' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        setSortField('statut');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      Statut {sortField === 'statut' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  {students.map((student) => (
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
                        <div className="text-sm text-gray-900">{student.entreprise || 'Non défini'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatut(student.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`#/etudiants/${student.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Voir
                        </a>
                        <a
                          href={`#/etudiants/${student.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Editer
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500">Aucun étudiant ne correspond à vos critères de recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{students.length}</span> étudiant(s) sur <span className="font-medium">{pagination.total}</span>
                {filterFiliere && <> dans la filière <span className="font-medium">{filterFiliere}</span></>}
                {filterStatut && <> avec le statut <span className="font-medium">{
                  filterStatut === 'en_cours' ? 'En cours' : 
                  filterStatut === 'termine' ? 'Terminé' : 
                  filterStatut === 'abandonne' ? 'Abandonné' : 'Non défini'
                }</span></>}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Calculer les pages à afficher autour de la page courante
                  const startPage = Math.max(1, pagination.page - 2);
                  const pageNumber = startPage + i;
                  if (pageNumber <= pagination.totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded ${
                          pagination.page === pageNumber 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                onClick={handleExport}
              >
                Exporter la liste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 