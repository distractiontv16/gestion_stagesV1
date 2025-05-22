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
 * Récupère la liste des étudiants avec filtres optionnels
 */
export const getEtudiants = async (req, res) => {
  debug('Appel API: getEtudiants avec query params:', req.query);
  try {
    // Récupération des paramètres de filtrage et pagination
    const { recherche, filiere, statut, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    debug('Paramètres de filtrage:', { recherche, filiere, statut, page, limit, offset });
    
    // Construction de la requête avec filtres dynamiques
    let sqlQuery = `
      SELECT 
        u.id, 
        u.matricule, 
        u.nom, 
        u.prenom, 
        f.nom as filiere,
        e.nom as entreprise,
        COALESCE(s.statut, 'non_defini') as statut
      FROM 
        utilisateurs u
      LEFT JOIN 
        filieres f ON u.filiere_id = f.id
      LEFT JOIN 
        stages s ON s.etudiant_id = u.id
      LEFT JOIN 
        entreprises e ON s.entreprise_id = e.id
      WHERE 
        u.role = 'etudiant'
    `;
    
    let countQuery = `
      SELECT 
        COUNT(*) as total
      FROM 
        utilisateurs u
      LEFT JOIN 
        filieres f ON u.filiere_id = f.id
      LEFT JOIN 
        stages s ON s.etudiant_id = u.id
      LEFT JOIN 
        entreprises e ON s.entreprise_id = e.id
      WHERE 
        u.role = 'etudiant'
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Ajout des conditions de filtrage
    if (recherche) {
      const searchTerm = `%${recherche}%`;
      sqlQuery += ` AND (u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex+1} OR u.matricule ILIKE $${paramIndex+2} OR e.nom ILIKE $${paramIndex+3})`;
      countQuery += ` AND (u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex+1} OR u.matricule ILIKE $${paramIndex+2} OR e.nom ILIKE $${paramIndex+3})`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 4;
    }
    
    if (filiere) {
      sqlQuery += ` AND f.nom = $${paramIndex}`;
      countQuery += ` AND f.nom = $${paramIndex}`;
      queryParams.push(filiere);
      paramIndex += 1;
    }
    
    if (statut) {
      sqlQuery += ` AND COALESCE(s.statut, 'non_defini') = $${paramIndex}`;
      countQuery += ` AND COALESCE(s.statut, 'non_defini') = $${paramIndex}`;
      queryParams.push(statut);
      paramIndex += 1;
    }
    
    // Ajout de la pagination à la requête principale
    sqlQuery += ` ORDER BY u.nom, u.prenom LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
    const paginationParams = [...queryParams, parseInt(limit), parseInt(offset)];
    
    debug('Query SQL (liste):', sqlQuery);
    debug('Query params:', paginationParams);
    
    debug('Query SQL (count):', countQuery);
    debug('Count params:', queryParams);
    
    // Exécution des requêtes
    const { rows: etudiants } = await query(sqlQuery, paginationParams);
    debug('Résultat requête étudiants:', etudiants.length);
    
    const { rows: countResult } = await query(countQuery, queryParams);
    const totalEtudiants = countResult[0]?.total || 0;
    debug('Total étudiants:', totalEtudiants);
    
    // Calcul de la pagination
    const totalPages = Math.ceil(totalEtudiants / limit);
    
    const responseData = {
      etudiants,
      pagination: {
        total: totalEtudiants,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    };
    
    debug('Réponse API getEtudiants:', {
      success: true,
      data: {
        pagination: responseData.pagination,
        etudiants: `${etudiants.length} étudiants retournés`
      }
    });
    
    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    debug('ERREUR getEtudiants:', error);
    console.error('Erreur lors de la récupération des étudiants:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des étudiants',
      error: error.message || 'Erreur inconnue'
    });
  }
};

/**
 * Récupère les détails d'un étudiant spécifique
 */
export const getEtudiantParId = async (req, res) => {
  const { id } = req.params;
  debug('Appel API: getEtudiantParId pour id:', id);
  
  try {
    const sqlQuery = `SELECT 
      u.id,
      u.matricule,
      u.nom,
      u.prenom,
      u.email,
      u.telephone,
      f.id as filiere_id,
      f.nom as filiere,
      s.id as stage_id,
      s.theme_memoire as stage_titre,
      NULL as stage_description,
      s.date_debut,
      s.date_fin,
      s.statut,
      e.id as entreprise_id,
      e.nom as entreprise_nom,
      e.adresse as entreprise_adresse,
      e.email as entreprise_email,
      e.telephone as entreprise_telephone
    FROM 
      utilisateurs u
    LEFT JOIN 
      filieres f ON u.filiere_id = f.id
    LEFT JOIN 
      stages s ON s.etudiant_id = u.id
    LEFT JOIN 
      entreprises e ON s.entreprise_id = e.id
    WHERE 
      u.id = $1 AND u.role = 'etudiant'`;
    
    debug('Query SQL:', sqlQuery, [id]);
    const { rows: etudiant } = await query(sqlQuery, [id]);
    debug('Résultat de la requête:', etudiant.length > 0 ? 'Étudiant trouvé' : 'Étudiant non trouvé');
    
    if (etudiant.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: etudiant[0]
    });
  } catch (error) {
    debug('ERREUR getEtudiantParId:', error);
    console.error('Erreur lors de la récupération des détails de l\'étudiant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de l\'étudiant',
      error: error.message || 'Erreur inconnue'
    });
  }
};

/**
 * Récupère les statistiques des étudiants par statut
 */
export const getStatistiquesEtudiants = async (req, res) => {
  debug('Appel API: getStatistiquesEtudiants');
  try {
    // Essayer d'abord avec la vue
    try {
      debug('Tentative d\'utilisation de la vue vue_stats_par_statut');
      const viewQuery = 'SELECT * FROM vue_stats_par_statut';
      debug('Query SQL (vue):', viewQuery);
      const { rows: viewStats } = await query(viewQuery);
      debug('Résultat de la vue vue_stats_par_statut:', viewStats);
      
      if (viewStats && viewStats.length > 0) {
        return res.status(200).json({
          success: true,
          data: viewStats
        });
      }
    } catch (viewError) {
      debug('Erreur en utilisant la vue, essayant la requête directe:', viewError);
    }
    
    // Requête directe pour statistiques par statut
    const sqlQuery = `SELECT 
      COALESCE(s.statut, 'non_defini') as statut,
      COUNT(u.id) as count
    FROM 
      utilisateurs u
    LEFT JOIN 
      stages s ON s.etudiant_id = u.id
    WHERE 
      u.role = 'etudiant'
    GROUP BY 
      COALESCE(s.statut, 'non_defini')`;
    
    debug('Query SQL (directe):', sqlQuery);
    const { rows: stats } = await query(sqlQuery);
    debug('Résultat requête directe:', stats);
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    debug('ERREUR getStatistiquesEtudiants:', error);
    console.error('Erreur lors de la récupération des statistiques des étudiants:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des étudiants',
      error: error.message || 'Erreur inconnue'
    });
  }
}; 