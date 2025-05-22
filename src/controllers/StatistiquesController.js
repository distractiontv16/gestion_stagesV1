import db from '../config/db.js';
const { query } = db;

// Fonction utilitaire pour le log de débogage
const debug = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG][${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

/**
 * Récupère les statistiques générales pour le dashboard admin
 */
export const getStatistiquesGenerales = async (req, res) => {
  debug('Appel API: getStatistiquesGenerales');
  try {
    // Récupération du nombre total d'étudiants
    debug('Exécution requête: total étudiants');
    let sqlQuery = "SELECT COUNT(*) as total FROM utilisateurs WHERE role = 'etudiant'";
    debug('Query SQL:', sqlQuery);
    
    const { rows: totalEtudiants } = await query(sqlQuery);
    debug('Résultat requête total étudiants:', totalEtudiants);

    // Récupération du nombre de stages par statut
    debug('Exécution requête: stages par statut');
    sqlQuery = `SELECT 
      COALESCE(s.statut, 'non_defini') as statut, 
      COUNT(*) as count 
    FROM utilisateurs u
    LEFT JOIN stages s ON s.etudiant_id = u.id
    WHERE u.role = 'etudiant'
    GROUP BY COALESCE(s.statut, 'non_defini')`;
    
    debug('Query SQL:', sqlQuery);
    const { rows: stageParStatut } = await query(sqlQuery);
    debug('Résultat requête stages par statut:', stageParStatut);

    // Récupération du nombre d'étudiants par filière
    debug('Exécution requête: étudiants par filière');
    sqlQuery = `SELECT 
      f.nom as filiere, 
      COUNT(u.id) as count,
      f.id as filiere_id 
    FROM utilisateurs u
    JOIN filieres f ON u.filiere_id = f.id
    WHERE u.role = 'etudiant'
    GROUP BY f.id, f.nom`;
    
    debug('Query SQL:', sqlQuery);
    const { rows: etudiantsParFiliere } = await query(sqlQuery);
    debug('Résultat requête étudiants par filière:', etudiantsParFiliere);

    // Récupération des statistiques globales depuis la table statistiques_stages
    debug('Exécution requête: statistiques globales');
    sqlQuery = `SELECT * FROM statistiques_stages ORDER BY periode DESC LIMIT 1`;
    
    debug('Query SQL:', sqlQuery);
    const { rows: statsGlobales } = await query(sqlQuery);
    debug('Résultat requête statistiques globales:', statsGlobales);

    const responseData = {
      totalEtudiants: totalEtudiants[0]?.total || 0,
      stageParStatut,
      etudiantsParFiliere,
      statsGlobales: statsGlobales[0] || {}
    };
    
    debug('Réponse API getStatistiquesGenerales:', responseData);

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    debug('ERREUR getStatistiquesGenerales:', error);
    console.error('Erreur lors de la récupération des statistiques générales:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques générales',
      error: error.message || 'Erreur inconnue'
    });
  }
};

/**
 * Récupère les statistiques par filière
 */
export const getStatistiquesParFiliere = async (req, res) => {
  debug('Appel API: getStatistiquesParFiliere');
  try {
    debug('Exécution requête: statistiques par filière');
    const sqlQuery = `SELECT 
      f.id,
      f.nom as filiere,
      COUNT(u.id) as nb_etudiants,
      SUM(CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END) as stages_trouves,
      pf.nb_stages_requis,
      COALESCE(pf.pourcentage_reussite, 0) as pourcentage_reussite
    FROM 
      filieres f
    LEFT JOIN 
      utilisateurs u ON u.filiere_id = f.id AND u.role = 'etudiant'
    LEFT JOIN 
      stages s ON s.etudiant_id = u.id
    LEFT JOIN 
      parametres_filieres pf ON pf.filiere_id = f.id
    GROUP BY 
      f.id, f.nom, pf.nb_stages_requis, pf.pourcentage_reussite`;
    
    debug('Query SQL:', sqlQuery);
    const { rows: stats } = await query(sqlQuery);
    debug('Résultat requête statistiques par filière:', stats);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    debug('ERREUR getStatistiquesParFiliere:', error);
    console.error('Erreur lors de la récupération des statistiques par filière:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par filière',
      error: error.message || 'Erreur inconnue'
    });
  }
};

/**
 * Récupère les statistiques par entreprise
 */
export const getStatistiquesParEntreprise = async (req, res) => {
  debug('Appel API: getStatistiquesParEntreprise');
  try {
    // Essayer d'abord avec la vue
    try {
      debug('Tentative d\'utilisation de la vue vue_stages_par_entreprise');
      const viewQuery = `SELECT * FROM vue_stages_par_entreprise`;
      debug('Query SQL (vue):', viewQuery);
      const { rows: viewStats } = await query(viewQuery);
      debug('Résultat de la vue vue_stages_par_entreprise:', viewStats);
      
      if (viewStats && viewStats.length > 0) {
        return res.status(200).json({
          success: true,
          data: viewStats
        });
      }
    } catch (viewError) {
      debug('Erreur en utilisant la vue, essayant la requête directe:', viewError);
    }
    
    // Requête directe pour les statistiques par entreprise
    debug('Exécution de la requête directe pour les stats par entreprise');
    const sqlQuery = `SELECT 
      e.nom as entreprise,
      COUNT(s.id) as nb_stages
    FROM 
      entreprises e
    JOIN 
      stages s ON s.entreprise_id = e.id
    GROUP BY 
      e.nom
    ORDER BY 
      nb_stages DESC
    LIMIT 10`;
    
    debug('Query SQL (directe):', sqlQuery);
    const { rows: stats } = await query(sqlQuery);
    debug('Résultat de la requête directe:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    debug('ERREUR getStatistiquesParEntreprise:', error);
    console.error('Erreur lors de la récupération des statistiques par entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par entreprise',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Récupère les activités récentes
 */
export const getActivitesRecentes = async (req, res) => {
  debug('Appel API: getActivitesRecentes');
  try {
    // Essayer d'abord avec la vue
    try {
      debug('Tentative d\'utilisation de la vue vue_activites_recentes');
      const viewQuery = `SELECT * FROM vue_activites_recentes ORDER BY date_activite DESC LIMIT 10`;
      debug('Query SQL (vue):', viewQuery);
      const { rows: viewActivites } = await query(viewQuery);
      debug('Résultat de la vue vue_activites_recentes:', viewActivites);
      
      if (viewActivites && viewActivites.length > 0) {
        return res.status(200).json({
          success: true,
          data: viewActivites
        });
      }
    } catch (viewError) {
      debug('Erreur en utilisant la vue, essayant la requête directe:', viewError);
    }
    
    // Version adaptée pour la structure de table existante
    debug('Exécution requête directe: activités récentes');
    const sqlQuery = `SELECT 
      ar.id,
      COALESCE(ar.type, ar.type_activite) as type,
      ar.description,
      COALESCE(ar.date_creation, ar.date_activite::timestamp) as date_creation,
      u.nom,
      u.prenom
    FROM 
      activites_recentes ar
    LEFT JOIN 
      utilisateurs u ON ar.user_id = u.id
    ORDER BY 
      COALESCE(ar.date_creation, ar.date_activite::timestamp) DESC
    LIMIT 10`;
    
    debug('Query SQL (directe):', sqlQuery);
    const { rows: activites } = await query(sqlQuery);
    debug('Résultat requête directe activités récentes:', activites);

    return res.status(200).json({
      success: true,
      data: activites
    });
  } catch (error) {
    debug('ERREUR getActivitesRecentes:', error);
    console.error('Erreur lors de la récupération des activités récentes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des activités récentes',
      error: error.message || 'Erreur inconnue'
    });
  }
}; 