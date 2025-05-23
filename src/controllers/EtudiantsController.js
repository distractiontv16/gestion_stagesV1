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
    const {
      recherche, filiere, statut, page = 1, limit = 10,
      entreprise_nom, // Nouveau filtre
      maitre_stage_nom, // Rétabli
      maitre_memoire_nom, // Rétabli
      sortField = 'u.nom', // Champ de tri par défaut
      sortOrder = 'asc' // Ordre de tri par défaut
    } = req.query;
    const offset = (page - 1) * limit;
    
    debug('Paramètres de filtrage:', { recherche, filiere, statut, entreprise_nom, maitre_stage_nom, maitre_memoire_nom, page, limit, offset, sortField, sortOrder });
    
    // Construction de la requête avec filtres dynamiques
    let sqlQuery = `
      SELECT 
        u.id, 
        u.matricule, 
        u.nom, 
        u.prenom, 
        u.email, 
        u.telephone, 
        f.nom as filiere,
        s.theme_memoire as stage_sujet,
        s.date_debut as stage_date_debut,
        s.date_fin as stage_date_fin,
        COALESCE(s.statut, 'non_defini') as statut,
        e.nom as entreprise_nom,
        e.adresse as entreprise_adresse,
        e.telephone as entreprise_telephone,
        e.email as entreprise_email,
        e.departement as entreprise_departement,
        e.commune as entreprise_commune,
        e.quartier as entreprise_quartier,
        ms.nom as maitre_stage_nom,
        ms.prenom as maitre_stage_prenom,
        ms.email as maitre_stage_email,
        ms.telephone as maitre_stage_telephone,
        mm.nom as maitre_memoire_nom, 
        mm.prenom as maitre_memoire_prenom,
        mm.email as maitre_memoire_email,
        mm.telephone as maitre_memoire_telephone
      FROM 
        utilisateurs u
      LEFT JOIN 
        filieres f ON u.filiere_id = f.id
      LEFT JOIN 
        stages s ON s.etudiant_id = u.id
      LEFT JOIN 
        entreprises e ON s.entreprise_id = e.id
      LEFT JOIN 
        maitres_stage ms ON s.maitre_stage_id = ms.id
      LEFT JOIN 
        maitres_memoire mm ON s.maitre_memoire_id = mm.id
      WHERE 
        u.role = 'etudiant'
    `;
    
    let countQuery = `
      SELECT 
        COUNT(DISTINCT u.id) as total
      FROM 
        utilisateurs u
      LEFT JOIN 
        filieres f ON u.filiere_id = f.id
      LEFT JOIN 
        stages s ON s.etudiant_id = u.id
      LEFT JOIN 
        entreprises e ON s.entreprise_id = e.id
      LEFT JOIN 
        maitres_stage ms ON s.maitre_stage_id = ms.id
      LEFT JOIN 
        maitres_memoire mm ON s.maitre_memoire_id = mm.id
      WHERE 
        u.role = 'etudiant'
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Ajout des conditions de filtrage
    if (recherche) {
      const searchTerm = `%${recherche}%`;
      // Recherche étendue pour inclure plus de champs si nécessaire
      sqlQuery += ` AND (u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex+1} OR u.matricule ILIKE $${paramIndex+2} OR e.nom ILIKE $${paramIndex+3} OR f.nom ILIKE $${paramIndex+4})`;
      countQuery += ` AND (u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex+1} OR u.matricule ILIKE $${paramIndex+2} OR e.nom ILIKE $${paramIndex+3} OR f.nom ILIKE $${paramIndex+4})`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 5;
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

    if (entreprise_nom) {
      sqlQuery += ` AND e.nom ILIKE $${paramIndex}`;
      countQuery += ` AND e.nom ILIKE $${paramIndex}`;
      queryParams.push(`%${entreprise_nom}%`);
      paramIndex += 1;
    }

    if (maitre_stage_nom) {
      sqlQuery += ` AND (ms.nom ILIKE $${paramIndex} OR ms.prenom ILIKE $${paramIndex+1})`;
      countQuery += ` AND (ms.nom ILIKE $${paramIndex} OR ms.prenom ILIKE $${paramIndex+1})`;
      queryParams.push(`%${maitre_stage_nom}%`, `%${maitre_stage_nom}%`);
      paramIndex += 2;
    }

    if (maitre_memoire_nom) {
      sqlQuery += ` AND (mm.nom ILIKE $${paramIndex} OR mm.prenom ILIKE $${paramIndex+1})`;
      countQuery += ` AND (mm.nom ILIKE $${paramIndex} OR mm.prenom ILIKE $${paramIndex+1})`;
      queryParams.push(`%${maitre_memoire_nom}%`, `%${maitre_memoire_nom}%`);
      paramIndex += 2;
    }
    
    // Ajout du tri
    const allowedSortFields = {
      'nom': 'u.nom',
      'matricule': 'u.matricule',
      'filiere': 'f.nom',
      'entreprise_nom': 'e.nom',
      'stage_date_fin': 's.date_fin',
      'statut': 's.statut'
    };
    const orderByField = allowedSortFields[sortField] || 'u.nom'; // Tri par défaut
    const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
    sqlQuery += ` ORDER BY ${orderByField} ${orderDirection}, u.nom ${orderDirection}, u.prenom ${orderDirection}`;

    // Ajout de la pagination à la requête principale
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
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

/**
 * Recherche des étudiants par nom, prénom ou matricule
 */
export const searchEtudiants = async (req, res) => {
  const { term } = req.query;
  debug('Appel API: searchEtudiants avec le terme:', term);

  if (!term || term.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Le terme de recherche ne peut pas être vide.'
    });
  }

  try {
    const searchTerm = `%${term}%`;
    const sqlQuery = `
      SELECT 
        u.id, 
        u.matricule, 
        u.nom, 
        u.prenom,
        f.nom as filiere
      FROM 
        utilisateurs u
      LEFT JOIN 
        filieres f ON u.filiere_id = f.id
      WHERE 
        u.role = 'etudiant' AND 
        (u.nom ILIKE $1 OR u.prenom ILIKE $1 OR u.matricule ILIKE $1)
      ORDER BY u.nom, u.prenom
      LIMIT 10; // Limiter les résultats pour la recherche rapide
    `;
    
    debug('Query SQL (searchEtudiants):', sqlQuery, [searchTerm]);
    const { rows: etudiants } = await query(sqlQuery, [searchTerm]);
    debug('Résultat requête searchEtudiants:', etudiants);

    return res.status(200).json({
      success: true,
      data: etudiants
    });
  } catch (error) {
    debug('ERREUR searchEtudiants:', error);
    console.error('Erreur lors de la recherche des étudiants:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des étudiants',
      error: error.message || 'Erreur inconnue'
    });
  }
}; 