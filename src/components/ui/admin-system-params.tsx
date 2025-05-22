import { useState, useEffect } from 'react';

// Interface pour les paramètres système
interface SystemParam {
  id: number;
  nom: string;
  valeur: string;
  description: string;
}

export function AdminSystemParams() {
  const [params, setParams] = useState<SystemParam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // État local pour l'édition des valeurs
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Charger les données
  useEffect(() => {
    const fetchSystemParams = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
        
        console.log('Tentative de récupération des paramètres système');
        const response = await fetch('/api/admin/parametres/systeme', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Réponse reçue - Status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        if (data.success && data.data) {
          setParams(data.data);
        } else {
          console.error('Réponse invalide:', data);
          setError('Format de réponse invalide ou données manquantes');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les paramètres système');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSystemParams();
  }, []);

  // Fonction pour commencer l'édition d'un paramètre
  const handleEditStart = (param: SystemParam) => {
    setEditingId(param.id);
    setEditValue(param.valeur);
  };
  
  // Fonction pour annuler l'édition
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };
  
  // Fonction pour sauvegarder les modifications
  const handleSave = async (nom: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification non trouvé');
      }
      
      const response = await fetch(`/api/admin/parametres/systeme/${nom}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valeur: editValue })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du paramètre');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour les données locales
        setParams(params.map(param => 
          param.id === editingId 
            ? { ...param, valeur: editValue } 
            : param
        ));
        
        setSuccess('Paramètre système mis à jour avec succès');
        setTimeout(() => setSuccess(null), 3000);
        setEditingId(null);
        setEditValue('');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la mise à jour du paramètre');
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
        <h2 className="text-xl font-semibold text-gray-800">Paramètres Système</h2>
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

      {/* Tableau des paramètres système */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {params.map(param => (
              <tr key={param.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{param.nom}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === param.id ? (
                    <input
                      type="text"
                      className="text-sm text-gray-900 border border-gray-300 rounded p-1 w-full"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{param.valeur}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{param.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === param.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(param.nom)}
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