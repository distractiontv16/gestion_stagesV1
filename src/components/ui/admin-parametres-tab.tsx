import { useState, useEffect } from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Liste des filières
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

// Interface pour les paramètres
interface Parametre {
  id: number;
  filiere_id: number;
  filiere_nom: string;
  nb_etudiants: number;
  nb_stages_requis: number;
  pourcentage_reussite: number;
}

// Interface pour les statistiques
interface StageStats {
  filiere: string;
  count: number;
  color: string;
  stagesFound: number;
}

export function AdminParametresTab() {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [stageStats, setStageStats] = useState<StageStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // État local pour l'édition des valeurs
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Parametre>>({});
  
  // Couleurs pour le graphique
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  // Charger les données
  useEffect(() => {
    const fetchParametresFiliere = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/parametres/filiere');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des paramètres');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setParametres(data.data);
          
          // Préparer les données pour les graphiques
          const statsData = data.data.map((param: Parametre, index: number) => ({
            filiere: param.filiere_nom,
            count: param.nb_etudiants,
            stagesFound: Math.round(param.nb_etudiants * (param.pourcentage_reussite / 100)),
            color: colors[index % colors.length]
          }));
          setStageStats(statsData);
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
      nb_stages_requis: parametre.nb_stages_requis,
      pourcentage_reussite: parametre.pourcentage_reussite
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
        
        // Mettre à jour les statistiques
        setStageStats(stageStats.map(stat => {
          const updatedParam = parametres.find(p => p.filiere_nom === stat.filiere && p.id === id);
          if (updatedParam) {
            return {
              ...stat,
              count: editValues.nb_etudiants || stat.count,
              stagesFound: editValues.nb_etudiants 
                ? Math.round((editValues.nb_etudiants || 0) * ((editValues.pourcentage_reussite || 0) / 100)) 
                : stat.stagesFound
            };
          }
          return stat;
        }));
        
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

      {/* Statistiques des stages par filière */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Étudiants par filière</h3>
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Stages trouvés vs requis par filière</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="filiere" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stagesFound" name="Stages trouvés" fill="#3B82F6" />
                <Bar dataKey="count" name="Étudiants total" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableau des paramètres */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filière
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre d'étudiants
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stages requis
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pourcentage de réussite
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parametres.map(parametre => (
              <tr key={parametre.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{parametre.filiere_nom}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === parametre.id ? (
                    <input
                      type="number"
                      className="text-sm text-gray-900 border border-gray-300 rounded p-1 w-20"
                      value={editValues.nb_etudiants}
                      onChange={(e) => handleInputChange('nb_etudiants', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{parametre.nb_etudiants}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === parametre.id ? (
                    <input
                      type="number"
                      className="text-sm text-gray-900 border border-gray-300 rounded p-1 w-20"
                      value={editValues.nb_stages_requis}
                      onChange={(e) => handleInputChange('nb_stages_requis', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{parametre.nb_stages_requis}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === parametre.id ? (
                    <input
                      type="number"
                      className="text-sm text-gray-900 border border-gray-300 rounded p-1 w-20"
                      value={editValues.pourcentage_reussite}
                      onChange={(e) => handleInputChange('pourcentage_reussite', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{parametre.pourcentage_reussite}%</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === parametre.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(parametre.id)}
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
                      onClick={() => handleEditStart(parametre)}
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

      {/* Résumé des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total des étudiants</h3>
          <p className="text-2xl font-bold mt-1">
            {parametres.reduce((sum, param) => sum + param.nb_etudiants, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total des stages requis</h3>
          <p className="text-2xl font-bold mt-1">
            {parametres.reduce((sum, param) => sum + param.nb_stages_requis, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Pourcentage moyen de réussite</h3>
          <p className="text-2xl font-bold mt-1">
            {(parametres.reduce((sum, param) => sum + param.pourcentage_reussite, 0) / parametres.length).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
} 