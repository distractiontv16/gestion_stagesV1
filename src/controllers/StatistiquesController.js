import pool from '../config/db.js';

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
    const [totalEtudiants] = await pool.query(
      'SELECT COUNT(*) as total FROM utilisateurs WHERE role = "etudiant"'
    );
    debug('Résultat requête total étudiants:', totalEtudiants);

    // Récupération du nombre de stages par statut
    debug('Exécution requête: stages par statut');
    const [stageParStatut] = await pool.query(
      `SELECT 
        IFNULL(s.statut, 'non_defini') as statut, 
        COUNT(*) as count 
      FROM utilisateurs u
      LEFT JOIN stages s ON s.etudiant_id = u.id
      WHERE u.role = "etudiant"
      GROUP BY IFNULL(s.statut, 'non_defini')`
    );
    debug('Résultat requête stages par statut:', stageParStatut);

    // Récupération du nombre d'étudiants par filière
    debug('Exécution requête: étudiants par filière');
    const [etudiantsParFiliere] = await pool.query(
      `SELECT 
        f.nom as filiere, 
        COUNT(u.id) as count,
        f.id as filiere_id 
      FROM utilisateurs u
      JOIN filieres f ON u.filiere_id = f.id
      WHERE u.role = "etudiant"
      GROUP BY f.id`
    );
    debug('Résultat requête étudiants par filière:', etudiantsParFiliere);

    // Récupération des statistiques globales depuis la table statistiques_stages
    debug('Exécution requête: statistiques globales');
    const [statsGlobales] = await pool.query(
      `SELECT * FROM statistiques_stages ORDER BY periode DESC LIMIT 1`
    );
    debug('Résultat requête statistiques globales:', statsGlobales);

    const responseData = {
      totalEtudiants: totalEtudiants[0].total,
      stageParStatut,
      etudiantsParFiliere,
      statsGlobales: statsGlobales[0] || {}
    };
    
    debug('Réponse API getStatistiquesGenerales:', responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    debug('ERREUR getStatistiquesGenerales:', error);
    console.error('Erreur lors de la récupération des statistiques générales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques générales',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    const [stats] = await pool.query(
      `SELECT 
        f.id,
        f.nom as filiere,
        COUNT(u.id) as nb_etudiants,
        SUM(CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END) as stages_trouves,
        pf.nb_stages_requis,
        IFNULL(pf.pourcentage_reussite, 0) as pourcentage_reussite
      FROM 
        filieres f
      LEFT JOIN 
        utilisateurs u ON u.filiere_id = f.id AND u.role = "etudiant"
      LEFT JOIN 
        stages s ON s.etudiant_id = u.id
      LEFT JOIN 
        parametres_filieres pf ON pf.filiere_id = f.id
      GROUP BY 
        f.id`
    );
    debug('Résultat requête statistiques par filière:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    debug('ERREUR getStatistiquesParFiliere:', error);
    console.error('Erreur lors de la récupération des statistiques par filière:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par filière',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Récupère les statistiques par entreprise
 */
export const getStatistiquesParEntreprise = async (req, res) => {
  debug('Appel API: getStatistiquesParEntreprise');
  try {
    // Utiliser la vue existante si elle existe
    try {
      debug('Tentative d\'utilisation de la vue vue_stages_par_entreprise');
      const [stats] = await pool.query('SELECT * FROM vue_stages_par_entreprise');
      debug('Résultat de la vue vue_stages_par_entreprise:', stats);
      
      // Vérifier si nous avons des résultats
      if (stats && stats.length > 0) {
        debug('Réponse API via vue:', stats);
        return res.status(200).json({
          success: true,
          data: stats
        });
      } else {
        debug('La vue n\'a pas retourné de résultats, utilisation de la requête directe');
      }
    } catch (e) {
      // Si la vue n'existe pas, nous continuons avec la requête directe
      debug('Vue vue_stages_par_entreprise non disponible, erreur:', e);
      debug('Utilisation de la requête directe');
    }
    
    // Requête directe si la vue n'existe pas ou ne retourne pas de résultats
    debug('Exécution de la requête directe pour les stats par entreprise');
    const [stats] = await pool.query(
      `SELECT 
        e.nom as entreprise,
        COUNT(s.id) as nb_stages
      FROM 
        entreprises e
      JOIN 
        stages s ON s.entreprise_id = e.id
      GROUP BY 
        e.id
      ORDER BY 
        nb_stages DESC
      LIMIT 10`
    );
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
    // Version adaptée pour la structure de table existante
    debug('Exécution requête: activités récentes');
    const [activites] = await pool.query(
      `SELECT 
        ar.id,
        COALESCE(ar.type, ar.type_activite) as type,
        ar.description,
        COALESCE(ar.date_creation, ar.date_activite) as date_creation,
        u.nom,
        u.prenom
      FROM 
        activites_recentes ar
      LEFT JOIN 
        utilisateurs u ON ar.user_id = u.id
      ORDER BY 
        COALESCE(ar.date_creation, ar.date_activite) DESC
      LIMIT 10`
    );
    debug('Résultat requête activités récentes:', activites);

    res.status(200).json({
      success: true,
      data: activites
    });
  } catch (error) {
    debug('ERREUR getActivitesRecentes:', error);
    console.error('Erreur lors de la récupération des activités récentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des activités récentes',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 