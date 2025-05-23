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

interface FiliereStats {
  filiere: string;
  count: number;
  stagesFound: number;
  color: string;
}

export function AdminDashboardOverview() {
  // États pour stocker les données
  const [stageStats, setStageStats] = useState<StageStats[]>([]);
  const [filiereStats, setFiliereStats] = useState<FiliereStats[]>([]);
  const [entrepriseStats, setEntrepriseStats] = useState<EntrepriseStats[]>([]);
  const [activitesRecentes, setActivitesRecentes] = useState<Activite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour ajouter des logs de débogage
  const addDebugLog = (message: string) => {
    console.log(`[DEBUG] ${message}`);
  };

  // Couleurs pour le graphique
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  useEffect(() => {
    // Fonction pour charger les statistiques générales
    const fetchStatistiquesGenerales = async () => {
      try {
        setLoading(true);
        addDebugLog("Démarrage de la requête API: /api/admin/statistiques");
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
        
        const response = await fetch('/api/admin/statistiques', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
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
            count: parseInt(stat.count),
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
    
    // Fonction pour charger les paramètres par filière
    const fetchParametresFiliere = async () => {
      try {
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
          throw new Error(`Erreur API paramètres filière: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Préparer les données pour les graphiques de filière
          const stats = data.data.map((param: any, index: number) => ({
            filiere: param.filiere_nom,
            count: parseInt(param.nb_etudiants),
            stagesFound: Math.round(parseInt(param.nb_etudiants) * (parseFloat(param.pourcentage_reussite) / 100)),
            color: colors[index % colors.length]
          }));
          setFiliereStats(stats);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Erreur lors du chargement des paramètres par filière:', err);
        addDebugLog(`Erreur lors du chargement des paramètres par filière: ${errorMessage}`);
      }
    };
    
    // Fonction pour charger les statistiques par entreprise
    const fetchStatistiquesEntreprise = async () => {
      try {
        addDebugLog("Démarrage de la requête API: /api/admin/statistiques/entreprise");
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
        
        const response = await fetch('/api/admin/statistiques/entreprise', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        addDebugLog(`Réponse statistiques entreprise - Status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API entreprises: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        addDebugLog(`Données entreprises reçues: ${JSON.stringify(data, null, 2)}`);
        
        if (data.success) {
          if (data.data && data.data.length > 0) {
            addDebugLog(`${data.data.length} entreprises trouvées`);
            // Conversion des valeurs de string en number si nécessaire
            const formattedData = data.data.map((item: any) => ({
              entreprise: item.entreprise,
              nb_stages: typeof item.nb_stages === 'string' ? parseInt(item.nb_stages) : item.nb_stages
            }));
            setEntrepriseStats(formattedData);
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
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
        
        const response = await fetch('/api/admin/activites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
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
      await fetchParametresFiliere();
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Première rangée: statistiques principales - 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Statistiques des étudiants par filière */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Étudiants par filière</h3>
          <div className="h-64">
            {stageStats && stageStats.length > 0 ? (
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
                    nameKey="filiere"
                    label={({ filiere, count }) => `${filiere}: ${count}`}
                    labelLine={false}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {stageStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} étudiants`, 'Nombre']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
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
            {entrepriseStats && entrepriseStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={entrepriseStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 'dataMax + 1']} />
                  <YAxis dataKey="entreprise" type="category" width={110} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} stages`, 'Nombre']} />
                  <Bar 
                    dataKey="nb_stages" 
                    name="Nombre de stages" 
                    fill="#3B82F6" 
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée disponible pour les entreprises
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Deuxième rangée: graphiques des filières */}
      {filiereStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphique des étudiants par filière */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Étudiants par filière (détaillé)</h3>
            <div className="h-64">
              {filiereStats && filiereStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filiereStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="filiere"
                      label={({ filiere, count }) => `${filiere}: ${count}`}
                      labelLine={false}
                      isAnimationActive={true}
                    >
                      {filiereStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} étudiants`, props.payload.filiere]} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Aucune donnée détaillée disponible
                </div>
              )}
            </div>
          </div>
          
          {/* Graphique stages trouvés vs requis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Stages trouvés vs étudiants par filière</h3>
            <div className="h-64">
              {filiereStats && filiereStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filiereStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    barGap={0}
                    barCategoryGap="20%"
                  >
                    <XAxis 
                      dataKey="filiere" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} étudiants`, '']} />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />
                    <Bar 
                      dataKey="stagesFound" 
                      name="Stages trouvés" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Étudiants total" 
                      fill="#60A5FA" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* TroINSTIème rangée: activités récentes en format horizontal */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Activités récentes</h3>
        
        {activitesRecentes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {activitesRecentes.slice(0, 5).map(activite => (
              <div key={activite.id} className="bg-gray-50 p-3 rounded">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium">{activite.description}</p>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
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
                  <div className="mt-auto">
                    <p className="text-xs text-gray-500">
                      {new Date(activite.date_creation).toLocaleDateString()} par {activite.nom ? `${activite.prenom} ${activite.nom}` : 'Système'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune activité récente</p>
        )}
      </div>
    </div>
  );
} 