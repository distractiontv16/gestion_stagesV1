import { useState, useEffect } from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Interfaces pour le typage des données
interface StageStats {
  filiere: string;
  count: number;
  color: string;
  stagesFound?: number;
}

interface EntrepriseStats {
  entreprise: string;
  nb_stages: number;
}

interface Activite {
  id: number;
  type: string;
  description: string;
  date_creation: string;
  nom: string | null;
  prenom: string | null;
}

export function AdminDashboardOverview() {
  // États pour stocker les données
  const [stageStats, setStageStats] = useState<StageStats[]>([]);
  const [entrepriseStats, setEntrepriseStats] = useState<EntrepriseStats[]>([]);
  const [activitesRecentes, setActivitesRecentes] = useState<Activite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Fonction pour ajouter des logs de débogage
  const addDebugLog = (message: string) => {
    console.log(`[DEBUG] ${message}`);
    setDebugLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
  };

  // Couleurs pour le graphique
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  useEffect(() => {
    // Fonction pour charger les statistiques générales
    const fetchStatistiquesGenerales = async () => {
      try {
        setLoading(true);
        addDebugLog("Démarrage de la requête API: /api/admin/statistiques");
        const response = await fetch('/api/admin/statistiques');
        
        addDebugLog(`Réponse reçue - Status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        addDebugLog(`Données reçues: ${JSON.stringify(data, null, 2)}`);
        
        // Transformation des données pour le graphique
        if (data.success && data.data.etudiantsParFiliere) {
          addDebugLog(`Statistiques par filière: ${data.data.etudiantsParFiliere.length} filières trouvées`);
          const statsWithColors = data.data.etudiantsParFiliere.map((stat: any, index: number) => ({
            filiere: stat.filiere,
            count: stat.count,
            color: colors[index % colors.length]
          }));
          setStageStats(statsWithColors);
        } else {
          addDebugLog(`Données invalides ou manquantes: ${JSON.stringify(data)}`);
          if (!data.success) {
            setError(`Erreur serveur: ${data.message || 'Pas de message d\'erreur'}`);
          } else if (!data.data.etudiantsParFiliere) {
            setError('Données des étudiants par filière manquantes');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Erreur:', err);
        addDebugLog(`Erreur lors du chargement des statistiques: ${errorMessage}`);
        setError(`Impossible de charger les statistiques générales: ${errorMessage}`);
      }
    };
    
    // Fonction pour charger les statistiques par entreprise
    const fetchStatistiquesEntreprise = async () => {
      try {
        addDebugLog("Démarrage de la requête API: /api/admin/statistiques/entreprise");
        const response = await fetch('/api/admin/statistiques/entreprise');
        
        addDebugLog(`Réponse statistiques entreprise - Status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API entreprises: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        addDebugLog(`Données entreprises reçues: ${JSON.stringify(data, null, 2)}`);
        
        if (data.success) {
          if (data.data && data.data.length > 0) {
            addDebugLog(`${data.data.length} entreprises trouvées`);
            setEntrepriseStats(data.data);
          } else {
            addDebugLog('Aucune statistique par entreprise trouvée');
          }
        } else {
          addDebugLog(`API entreprises: Erreur dans la réponse: ${data.message || 'Pas de message d\'erreur'}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Erreur:', err);
        addDebugLog(`Erreur lors du chargement des statistiques par entreprise: ${errorMessage}`);
      }
    };
    
    // Fonction pour charger les activités récentes
    const fetchActivitesRecentes = async () => {
      try {
        addDebugLog("Démarrage de la requête API: /api/admin/activites");
        const response = await fetch('/api/admin/activites');
        
        addDebugLog(`Réponse activités - Status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API activités: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        addDebugLog(`Données activités reçues: ${JSON.stringify(data, null, 2)}`);
        
        if (data.success) {
          if (data.data && data.data.length > 0) {
            addDebugLog(`${data.data.length} activités trouvées`);
            setActivitesRecentes(data.data);
          } else {
            addDebugLog('Aucune activité récente trouvée');
          }
        } else {
          addDebugLog(`API activités: Erreur dans la réponse: ${data.message || 'Pas de message d\'erreur'}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Erreur:', err);
        addDebugLog(`Erreur lors du chargement des activités récentes: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Exécution de toutes les fonctions de chargement
    const loadAllData = async () => {
      addDebugLog('Début du chargement des données du dashboard admin');
      await fetchStatistiquesGenerales();
      await fetchStatistiquesEntreprise();
      await fetchActivitesRecentes();
      addDebugLog('Fin du chargement des données');
    };
    
    loadAllData();
  }, []);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="spinner-border text-blue-600 mb-4" role="status">
          <span className="sr-only">Chargement...</span>
        </div>
        <div className="text-sm text-gray-600">Chargement des données du tableau de bord...</div>
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur:</strong>
        <span className="block sm:inline"> {error}</span>
        
        <div className="mt-4">
          <h3 className="font-semibold">Logs de débogage:</h3>
          <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
            {debugLogs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logs de débogage pour l'utilisateur */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4 overflow-hidden">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Debug logs ({debugLogs.length})</h3>
        <div className="bg-white p-3 rounded text-xs overflow-auto max-h-40 border border-gray-200">
          {debugLogs.map((log, index) => (
            <div key={index} className="mb-1 font-mono">{log}</div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Statistiques des étudiants par filière */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Étudiants par filière</h3>
          <div className="h-64">
            {stageStats.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée disponible pour les filières
              </div>
            )}
          </div>
        </div>

        {/* Statistiques des stages par entreprise */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Stages par entreprise</h3>
          <div className="h-64">
            {entrepriseStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={entrepriseStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="entreprise" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="nb_stages" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée disponible pour les entreprises
              </div>
            )}
          </div>
        </div>
        
        {/* Résumé des activités récentes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Résumé des activités récentes</h3>
          
          <div className="space-y-4">
            {activitesRecentes.length > 0 ? (
              activitesRecentes.slice(0, 5).map(activite => (
                <div key={activite.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{activite.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activite.date_creation).toLocaleDateString()} par {activite.nom ? `${activite.prenom} ${activite.nom}` : 'Système'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activite.type === 'proposition_stage' ? 'bg-blue-100 text-blue-800' :
                    activite.type === 'inscription' ? 'bg-green-100 text-green-800' :
                    activite.type === 'convention' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activite.type === 'proposition_stage' ? 'Stage' :
                     activite.type === 'inscription' ? 'Inscription' :
                     activite.type === 'convention' ? 'Convention' : 'Action'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 