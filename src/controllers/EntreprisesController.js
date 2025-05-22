import db from '../config/db.js';
const { query } = db;

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
      query += ` AND nom LIKE $1`;
      queryParams.push(`%${nom}%`);
    }
    
    if (secteur) {
      query += ` AND secteur LIKE $2`;
      queryParams.push(`%${secteur}%`);
    }
    
    if (ville) {
      query += ` AND ville LIKE $3`;
      queryParams.push(`%${ville}%`);
    }
    
    // Ajout de l'ordre et de la pagination
    query += ` ORDER BY nom ASC LIMIT $4 OFFSET $5`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Exécution de la requête
    const { rows: entreprises } = await query(query, queryParams);
    
    // Récupération du nombre total d'entreprises (pour la pagination)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM entreprises
      WHERE 1=1
    `;
    
    const countParams = [];
    
    // Ajout des mêmes filtres pour le comptage
    if (nom) {
      countQuery += ` AND nom LIKE $6`;
      countParams.push(`%${nom}%`);
    }
    
    if (secteur) {
      countQuery += ` AND secteur LIKE $7`;
      countParams.push(`%${secteur}%`);
    }
    
    if (ville) {
      countQuery += ` AND ville LIKE $8`;
      countParams.push(`%${ville}%`);
    }
    
    // Exécution de la requête de comptage
    const { rows: countResult } = await query(countQuery, countParams);
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
    const { rows: entreprise } = await query(
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
        id = $1`,
      [id]
    );
    
    if (entreprise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    // Récupération des propositions de stage liées à l'entreprise
    const { rows: propositions } = await query(
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
        company = $1`,
      [entreprise[0].nom]
    );
    
    // Récupération des statistiques de l'entreprise
    const { rows: statsResults } = await query(
      `SELECT
        e.nom,
        COUNT(DISTINCT s.id) as nombre_stages,
        COUNT(DISTINCT s.etudiant_id) as nombre_etudiants
      FROM
        entreprises e
      LEFT JOIN
        stages s ON e.nom = s.entreprise_nom
      WHERE
        e.id = $1`,
      [id]
    );
    
    const stats = statsResults.length > 0 ? statsResults[0] : { nombre_stages: 0, nombre_etudiants: 0 };
    
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
    const { rows: existingEntreprise } = await query(
      'SELECT * FROM entreprises WHERE nom = $1',
      [nom]
    );
    
    if (existingEntreprise.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Une entreprise avec ce nom existe déjà'
      });
    }
    
    // Insérer la nouvelle entreprise
    const { rows: result } = await query(
      `INSERT INTO entreprises (
        nom, 
        secteur, 
        adresse, 
        ville, 
        pays, 
        telephone, 
        email, 
        site_web
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [nom, secteur, adresse || null, ville, pays || null, telephone || null, email || null, site_web || null]
    );
    
    // Enregistrement de l'activité récente
    await query(
      `INSERT INTO activites_recentes (
        type_activite,
        type,
        description,
        valeur,
        date_activite,
        date_creation,
        user_id
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE, NOW(), $5)`,
      ['entreprises', 'entreprise', `Nouvelle entreprise ajoutée: "${nom}"`, 1, null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès',
      data: {
        id: result.rows[0].id
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
    const { rows: existingEntreprise } = await query(
      'SELECT * FROM entreprises WHERE id = $1',
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
      const { rows: existingByName } = await query(
        'SELECT * FROM entreprises WHERE nom = $1 AND id != $2',
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
      updateFields.push('nom = $1');
      queryParams.push(nom);
    }
    
    if (secteur) {
      updateFields.push('secteur = $2');
      queryParams.push(secteur);
    }
    
    if (adresse !== undefined) {
      updateFields.push('adresse = $3');
      queryParams.push(adresse);
    }
    
    if (ville) {
      updateFields.push('ville = $4');
      queryParams.push(ville);
    }
    
    if (pays !== undefined) {
      updateFields.push('pays = $5');
      queryParams.push(pays);
    }
    
    if (telephone !== undefined) {
      updateFields.push('telephone = $6');
      queryParams.push(telephone);
    }
    
    if (email !== undefined) {
      updateFields.push('email = $7');
      queryParams.push(email);
    }
    
    if (site_web !== undefined) {
      updateFields.push('site_web = $8');
      queryParams.push(site_web);
    }
    
    // Ajout de l'ID à la fin des paramètres
    queryParams.push(id);
    
    // Exécution de la mise à jour
    await query(
      `UPDATE entreprises
      SET ${updateFields.join(', ')}
      WHERE id = $9`,
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
    const { rows: existingEntreprise } = await query(
      'SELECT * FROM entreprises WHERE id = $1',
      [id]
    );
    
    if (existingEntreprise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    // Vérifier si l'entreprise a des stages ou des propositions associées
    const { rows: stagesCount } = await query(
      'SELECT COUNT(*) as count FROM stages WHERE entreprise_nom = $1',
      [existingEntreprise[0].nom]
    );
    
    const { rows: propositionsCount } = await query(
      'SELECT COUNT(*) as count FROM propositions_stages WHERE company = $1',
      [existingEntreprise[0].nom]
    );
    
    if (stagesCount[0].count > 0 || propositionsCount[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer l\'entreprise car elle a des stages ou des propositions associées'
      });
    }
    
    // Supprimer l'entreprise
    await query(
      'DELETE FROM entreprises WHERE id = $1',
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
    const { rows: entrepriseStats } = await query(
      `SELECT
        COUNT(*) as total_entreprises,
        COUNT(DISTINCT e.secteur) as total_secteurs,
        (SELECT COUNT(DISTINCT s.entreprise_nom) FROM stages s) as entreprises_avec_stages
      FROM
        entreprises e`
    );
    
    // Récupération du top 5 des entreprises par nombre de stages
    const { rows: topEntreprises } = await query(
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
    const { rows: entreprisesBySecteur } = await query(
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