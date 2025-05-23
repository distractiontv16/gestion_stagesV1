import { useState, useEffect } from 'react';

// Interface pour les paramètres
interface Parametre {
  id: number;
  filiere_id: number;
  filiere_nom: string;
  nb_etudiants: number;
  nb_stages_requis: number;
  // pourcentage_reussite: number;
}

export function AdminParametresTab() {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // État local pour l'édition des valeurs
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Parametre>>({});
  
  // Mode sombre (préparation pour fonctionnalité future)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  // Rappels (préparation pour fonctionnalité future)
  const [reminders, setReminders] = useState<boolean>(true);
  
  // Charger les données
  useEffect(() => {
    const fetchParametresFiliere = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
        
        const response = await fetch('/api/admin/parametres/filiere', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des paramètres');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setParametres(data.data);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les paramètres');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParametresFiliere();
  }, []);

  // Fonction pour commencer l'édition d'un paramètre
  const handleEditStart = (parametre: Parametre) => {
    setEditingId(parametre.id);
    setEditValues({
      nb_etudiants: parametre.nb_etudiants,
      nb_stages_requis: parametre.nb_etudiants,
      // pourcentage_reussite: parametre.pourcentage_reussite
    });
  };
  
  // Fonction pour annuler l'édition
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({});
  };
  
  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (field: string, value: string) => {
    setEditValues({
      ...editValues,
      [field]: Number(value)
    });
  };
  
  // Fonction pour sauvegarder les modifications
  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/parametres/filiere/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editValues)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des paramètres');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour les données locales
        setParametres(parametres.map(param => 
          param.id === id 
            ? { ...param, ...editValues } 
            : param
        ));
        
        setSuccess('Paramètres mis à jour avec succès');
        setTimeout(() => setSuccess(null), 3000);
        setEditingId(null);
        setEditValues({});
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la mise à jour des paramètres');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-blue-600" role="status">
          <span className="sr-only">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Paramètres Administratifs</h2>
      </div>

      {/* Messages de notification */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Paramètres système */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-base font-medium text-gray-700 mb-4">Paramètres d'affichage</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Mode sombre</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Activer les rappels</span>
              <button
                onClick={() => setReminders(!reminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${reminders ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${reminders ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Résumé des statistiques */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-base font-medium text-gray-700 mb-4">Statistiques globales</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-500">Total des étudiants</p>
              <p className="text-xl font-bold text-blue-700">
                {parametres.reduce((sum, param) => sum + param.nb_etudiants, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <p className="text-sm text-gray-500">Total des stages requis</p>
              <p className="text-xl font-bold text-green-700">
                {parametres.reduce((sum, param) => sum + param.nb_stages_requis, 0)}
              </p>
            </div>
            {/* La statistique "Stages réussis" n'a plus de sens si on supprime la colonne pourcentage_reussite
            <div className="p-3 bg-yellow-50 rounded">
              <p className="text-sm text-gray-500">Total des stages réussis</p>
              <p className="text-xl font-bold text-yellow-700">
                {parametres.reduce((sum, param) => sum + Math.round(param.nb_etudiants * (param.pourcentage_reussite / 100)), 0)}
              </p>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Tableau des paramètres */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-base font-medium text-gray-700">Configuration des filières</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filière</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre d'étudiants</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stages requis (auto)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parametres.map((param) => (
              <tr key={param.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{param.filiere_nom}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {editingId === param.id ? (
                    <input 
                      type="number"
                      value={editValues.nb_etudiants || ''}
                      onChange={(e) => handleInputChange('nb_etudiants', e.target.value)}
                      className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    param.nb_etudiants
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {editingId === param.id ? (
                    <input 
                      type="number" 
                      value={editValues.nb_stages_requis || ''} 
                      onChange={(e) => {
                        handleInputChange('nb_stages_requis', e.target.value)
                      }}
                      className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      readOnly
                    />
                  ) : (
                    param.nb_etudiants
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  {editingId === param.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(param.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditStart(param)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Éditer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 