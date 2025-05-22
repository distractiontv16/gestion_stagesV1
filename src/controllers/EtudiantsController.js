import pool from '../config/db.js';

/**
 * Récupère la liste des étudiants avec filtres optionnels
 */
export const getEtudiants = async (req, res) => {
  try {
    // Récupération des paramètres de filtrage et pagination
    const { recherche, filiere, statut, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Construction de la requête avec filtres dynamiques
    let query = `
      SELECT 
        u.id, 
        u.matricule, 
        u.nom, 
        u.prenom, 
        f.nom as filiere,
        e.nom as entreprise,
        IFNULL(s.statut, 'non_defini') as statut
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
    
    // Ajout des conditions de filtrage
    if (recherche) {
      const searchTerm = `%${recherche}%`;
      query += ` AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.matricule LIKE ? OR e.nom LIKE ?)`;
      countQuery += ` AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.matricule LIKE ? OR e.nom LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (filiere) {
      query += ` AND f.nom = ?`;
      countQuery += ` AND f.nom = ?`;
      queryParams.push(filiere);
    }
    
    if (statut) {
      query += ` AND IFNULL(s.statut, 'non_defini') = ?`;
      countQuery += ` AND IFNULL(s.statut, 'non_defini') = ?`;
      queryParams.push(statut);
    }
    
    // Ajout de la pagination à la requête principale
    query += ` ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?`;
    const paginationParams = [...queryParams, parseInt(limit), parseInt(offset)];
    
    // Exécution des requêtes
    const [etudiants] = await pool.query(query, paginationParams);
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalEtudiants = countResult[0].total;
    
    // Calcul de la pagination
    const totalPages = Math.ceil(totalEtudiants / limit);
    
    res.status(200).json({
      success: true,
      data: {
        etudiants,
        pagination: {
          total: totalEtudiants,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des étudiants',
      error: error.message
    });
  }
};

/**
 * Récupère les détails d'un étudiant spécifique
 */
export const getEtudiantParId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [etudiant] = await pool.query(
      `SELECT 
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
        u.id = ? AND u.role = 'etudiant'`,
      [id]
    );
    
    if (etudiant.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: etudiant[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de l\'étudiant',
      error: error.message
    });
  }
};

/**
 * Récupère les statistiques des étudiants par statut
 */
export const getStatistiquesEtudiants = async (req, res) => {
  try {
    // Essayer d'utiliser la vue si elle existe
    try {
      const [stats] = await pool.query('SELECT * FROM vue_stats_par_statut');
      
      if (stats && stats.length > 0) {
        return res.status(200).json({
          success: true,
          data: stats
        });
      }
    } catch (e) {
      console.warn('Vue vue_stats_par_statut non disponible, utilisation de la requête directe:', e);
    }
    
    const [stats] = await pool.query(
      `SELECT 
        IFNULL(s.statut, 'non_defini') as statut,
        COUNT(u.id) as count
      FROM 
        utilisateurs u
      LEFT JOIN 
        stages s ON s.etudiant_id = u.id
      WHERE 
        u.role = 'etudiant'
      GROUP BY 
        IFNULL(s.statut, 'non_defini')`
    );
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des étudiants',
      error: error.message
    });
  }
}; 