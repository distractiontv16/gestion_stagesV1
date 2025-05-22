import pool from '../config/db.js';

/**
 * Récupère la liste des entreprises avec pagination et filtrage
 */
export const getEntreprises = async (req, res) => {
  try {
    // Récupération des paramètres de pagination et filtrage
    const { page = 1, limit = 10, nom, secteur, ville } = req.query;
    const offset = (page - 1) * limit;
    
    // Construction de la requête avec filtrage dynamique
    let query = `
      SELECT 
        id,
        nom,
        secteur, 
        adresse,
        ville,
        pays,
        telephone,
        email,
        site_web
      FROM 
        entreprises
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Ajout des filtres si spécifiés
    if (nom) {
      query += ` AND nom LIKE ?`;
      queryParams.push(`%${nom}%`);
    }
    
    if (secteur) {
      query += ` AND secteur LIKE ?`;
      queryParams.push(`%${secteur}%`);
    }
    
    if (ville) {
      query += ` AND ville LIKE ?`;
      queryParams.push(`%${ville}%`);
    }
    
    // Ajout de l'ordre et de la pagination
    query += ` ORDER BY nom ASC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Exécution de la requête
    const [entreprises] = await pool.query(query, queryParams);
    
    // Récupération du nombre total d'entreprises (pour la pagination)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM entreprises
      WHERE 1=1
    `;
    
    const countParams = [];
    
    // Ajout des mêmes filtres pour le comptage
    if (nom) {
      countQuery += ` AND nom LIKE ?`;
      countParams.push(`%${nom}%`);
    }
    
    if (secteur) {
      countQuery += ` AND secteur LIKE ?`;
      countParams.push(`%${secteur}%`);
    }
    
    if (ville) {
      countQuery += ` AND ville LIKE ?`;
      countParams.push(`%${ville}%`);
    }
    
    // Exécution de la requête de comptage
    const [countResult] = await pool.query(countQuery, countParams);
    const totalEntreprises = countResult[0].total;
    
    // Calcul du nombre total de pages
    const totalPages = Math.ceil(totalEntreprises / limit);
    
    res.status(200).json({
      success: true,
      data: {
        entreprises,
        pagination: {
          total: totalEntreprises,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      error: error.message
    });
  }
};

/**
 * Récupère les détails d'une entreprise par son ID
 */
export const getEntrepriseById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Récupération de l'entreprise
    const [entreprise] = await pool.query(
      `SELECT 
        id,
        nom,
        secteur,
        adresse,
        ville,
        pays,
        telephone,
        email,
        site_web
      FROM 
        entreprises
      WHERE 
        id = ?`,
      [id]
    );
    
    if (entreprise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    // Récupération des propositions de stage liées à l'entreprise
    const [propositions] = await pool.query(
      `SELECT 
        id, 
        titre, 
        description, 
        location,
        position,
        duration
      FROM 
        propositions_stages
      WHERE 
        company = ?
      ORDER BY 
        date_publication DESC`,
      [entreprise[0].nom]
    );
    
    // Récupération des statistiques de l'entreprise
    const [statsData] = await pool.query(
      `SELECT
        e.nom,
        COUNT(DISTINCT s.id) as nombre_stages,
        COUNT(DISTINCT s.etudiant_id) as nombre_etudiants
      FROM
        entreprises e
      LEFT JOIN
        stages s ON e.nom = s.entreprise_nom
      WHERE
        e.id = ?
      GROUP BY
        e.id`,
      [id]
    );
    
    const stats = statsData.length > 0 ? statsData[0] : { nombre_stages: 0, nombre_etudiants: 0 };
    
    res.status(200).json({
      success: true,
      data: {
        ...entreprise[0],
        propositions,
        stats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails de l\'entreprise',
      error: error.message
    });
  }
};

/**
 * Crée une nouvelle entreprise
 */
export const createEntreprise = async (req, res) => {
  const { nom, secteur, adresse, ville, pays, telephone, email, site_web } = req.body;
  
  // Validation des données
  if (!nom || !secteur || !ville) {
    return res.status(400).json({
      success: false,
      message: 'Le nom, le secteur et la ville sont requis'
    });
  }
  
  try {
    // Vérifier si l'entreprise existe déjà
    const [existingEntreprise] = await pool.query(
      'SELECT * FROM entreprises WHERE nom = ?',
      [nom]
    );
    
    if (existingEntreprise.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Une entreprise avec ce nom existe déjà'
      });
    }
    
    // Insérer la nouvelle entreprise
    const [result] = await pool.query(
      `INSERT INTO entreprises (
        nom, 
        secteur, 
        adresse, 
        ville, 
        pays, 
        telephone, 
        email, 
        site_web
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, secteur, adresse || null, ville, pays || null, telephone || null, email || null, site_web || null]
    );
    
    // Enregistrement de l'activité récente
    await pool.query(
      `INSERT INTO activites_recentes (
        type_activite,
        type,
        description,
        valeur,
        date_activite,
        date_creation,
        user_id
      ) VALUES (?, ?, ?, ?, CURDATE(), NOW(), ?)`,
      ['entreprises', 'entreprise', `Nouvelle entreprise ajoutée: "${nom}"`, 1, null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'entreprise',
      error: error.message
    });
  }
};

/**
 * Met à jour une entreprise existante
 */
export const updateEntreprise = async (req, res) => {
  const { id } = req.params;
  const { nom, secteur, adresse, ville, pays, telephone, email, site_web } = req.body;
  
  // Validation des données
  if (!nom && !secteur && !adresse && !ville && !pays && !telephone && !email && !site_web) {
    return res.status(400).json({
      success: false,
      message: 'Aucune donnée à mettre à jour'
    });
  }
  
  try {
    // Vérifier si l'entreprise existe
    const [existingEntreprise] = await pool.query(
      'SELECT * FROM entreprises WHERE id = ?',
      [id]
    );
    
    if (existingEntreprise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (nom && nom !== existingEntreprise[0].nom) {
      const [existingByName] = await pool.query(
        'SELECT * FROM entreprises WHERE nom = ? AND id != ?',
        [nom, id]
      );
      
      if (existingByName.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Une autre entreprise avec ce nom existe déjà'
        });
      }
    }
    
    // Construction de la requête de mise à jour
    const updateFields = [];
    const queryParams = [];
    
    if (nom) {
      updateFields.push('nom = ?');
      queryParams.push(nom);
    }
    
    if (secteur) {
      updateFields.push('secteur = ?');
      queryParams.push(secteur);
    }
    
    if (adresse !== undefined) {
      updateFields.push('adresse = ?');
      queryParams.push(adresse);
    }
    
    if (ville) {
      updateFields.push('ville = ?');
      queryParams.push(ville);
    }
    
    if (pays !== undefined) {
      updateFields.push('pays = ?');
      queryParams.push(pays);
    }
    
    if (telephone !== undefined) {
      updateFields.push('telephone = ?');
      queryParams.push(telephone);
    }
    
    if (email !== undefined) {
      updateFields.push('email = ?');
      queryParams.push(email);
    }
    
    if (site_web !== undefined) {
      updateFields.push('site_web = ?');
      queryParams.push(site_web);
    }
    
    // Ajout de l'ID à la fin des paramètres
    queryParams.push(id);
    
    // Exécution de la mise à jour
    await pool.query(
      `UPDATE entreprises
      SET ${updateFields.join(', ')}
      WHERE id = ?`,
      queryParams
    );
    
    res.status(200).json({
      success: true,
      message: 'Entreprise mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'entreprise',
      error: error.message
    });
  }
};

/**
 * Supprime une entreprise
 */
export const deleteEntreprise = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si l'entreprise existe
    const [existingEntreprise] = await pool.query(
      'SELECT * FROM entreprises WHERE id = ?',
      [id]
    );
    
    if (existingEntreprise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    // Vérifier si l'entreprise a des stages ou des propositions associées
    const [stagesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM stages WHERE entreprise_nom = ?',
      [existingEntreprise[0].nom]
    );
    
    const [propositionsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM propositions_stages WHERE company = ?',
      [existingEntreprise[0].nom]
    );
    
    if (stagesCount[0].count > 0 || propositionsCount[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer l\'entreprise car elle a des stages ou des propositions associées'
      });
    }
    
    // Supprimer l'entreprise
    await pool.query(
      'DELETE FROM entreprises WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Entreprise supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'entreprise',
      error: error.message
    });
  }
};

/**
 * Récupère les stats des entreprises pour le dashboard
 */
export const getEntrepriseStats = async (req, res) => {
  try {
    // Récupération des statistiques des entreprises
    const [entrepriseStats] = await pool.query(
      `SELECT
        COUNT(*) as total_entreprises,
        COUNT(DISTINCT e.secteur) as total_secteurs,
        (SELECT COUNT(DISTINCT s.entreprise_nom) FROM stages s) as entreprises_avec_stages
      FROM
        entreprises e`
    );
    
    // Récupération du top 5 des entreprises par nombre de stages
    const [topEntreprises] = await pool.query(
      `SELECT
        e.nom,
        COUNT(s.id) as nombre_stages
      FROM
        entreprises e
      LEFT JOIN
        stages s ON e.nom = s.entreprise_nom
      GROUP BY
        e.id
      ORDER BY
        nombre_stages DESC
      LIMIT 5`
    );
    
    // Récupération des entreprises par secteur
    const [entreprisesBySecteur] = await pool.query(
      `SELECT
        secteur,
        COUNT(*) as nombre
      FROM
        entreprises
      GROUP BY
        secteur
      ORDER BY
        nombre DESC
      LIMIT 5`
    );
    
    res.status(200).json({
      success: true,
      data: {
        stats: entrepriseStats[0],
        topEntreprises,
        entreprisesBySecteur
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des entreprises',
      error: error.message
    });
  }
}; 