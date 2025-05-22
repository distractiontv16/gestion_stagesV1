import db from '../config/db.js';
const { query } = db;

/**
 * Récupère la liste des propositions de stage
 */
export const getPropositions = async (req, res) => {
  try {
    // Récupération des paramètres de pagination
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Récupération des propositions avec pagination
    const { rows: propositions } = await query(
      `SELECT 
        p.id,
        p.titre,
        p.description,
        p.entreprise_id,
        p.entreprise_nom,
        p.date_publication,
        p.location as localisation,
        p.duration as duree
      FROM 
        propositions_stages p
      ORDER BY 
        p.date_publication DESC
      LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    
    // Récupération du nombre total de propositions
    const { rows: countResult } = await query('SELECT COUNT(*) as total FROM propositions_stages');
    const totalPropositions = countResult[0].total;
    
    // Calcul de la pagination
    const totalPages = Math.ceil(totalPropositions / limit);
    
    res.status(200).json({
      success: true,
      data: {
        propositions,
        pagination: {
          total: totalPropositions,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des propositions de stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des propositions de stage',
      error: error.message
    });
  }
};

/**
 * Crée une nouvelle proposition de stage
 */
export const createProposition = async (req, res) => {
  const { titre, description, entreprise_nom, location, duration, filiere_id } = req.body;
  
  // Validation des données
  if (!titre || !description || !entreprise_nom) {
    return res.status(400).json({
      success: false,
      message: 'Le titre, la description et l\'entreprise sont requis'
    });
  }
  
  try {
    // Insertion de la proposition
    const { rows: result } = await query(
      `INSERT INTO propositions_stages (
        titre, 
        description, 
        company,
        position,
        location,
        duration,
        filiere_id
      ) VALUES ($3, $4, $5, $6, $7, $8, $9)`,
      [titre, description, entreprise_nom, titre, location, duration, filiere_id]
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
      ) VALUES ($10, $11, $12, $13, CURDATE(), NOW(), $14)`,
      ['propositions_stages', 'proposition_stage', `Nouvelle proposition de stage: "${titre}"`, 1, null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Proposition de stage créée avec succès',
      data: {
        id: result.rows[0].id
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la proposition de stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la proposition de stage',
      error: error.message
    });
  }
};

/**
 * Met à jour une proposition de stage existante
 */
export const updateProposition = async (req, res) => {
  const { id } = req.params;
  const { titre, description, location, duration, filiere_id } = req.body;
  
  // Validation des données
  if (!titre && !description && !location && !duration && !filiere_id) {
    return res.status(400).json({
      success: false,
      message: 'Aucune donnée à mettre à jour'
    });
  }
  
  try {
    // Vérification que la proposition existe
    const { rows: existingProposition } = await query(
      'SELECT * FROM propositions_stages WHERE id = $15',
      [id]
    );
    
    if (existingProposition.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposition de stage non trouvée'
      });
    }
    
    // Construction de la requête de mise à jour
    const updateFields = [];
    const queryParams = [];
    
    if (titre) {
      updateFields.push('titre = $16');
      updateFields.push('position = $17');
      queryParams.push(titre);
      queryParams.push(titre);
    }
    
    if (description) {
      updateFields.push('description = $18');
      queryParams.push(description);
    }
    
    if (location) {
      updateFields.push('location = $19');
      queryParams.push(location);
    }
    
    if (duration) {
      updateFields.push('duration = $20');
      queryParams.push(duration);
    }
    
    if (filiere_id) {
      updateFields.push('filiere_id = $21');
      queryParams.push(filiere_id);
    }
    
    // Ajout de l'ID à la fin des paramètres
    queryParams.push(id);
    
    // Exécution de la mise à jour
    await query(
      `UPDATE propositions_stages
      SET ${updateFields.join(', ')}
      WHERE id = $22`,
      queryParams
    );
    
    res.status(200).json({
      success: true,
      message: 'Proposition de stage mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la proposition de stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la proposition de stage',
      error: error.message
    });
  }
};

/**
 * Supprime une proposition de stage
 */
export const deleteProposition = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérification que la proposition existe
    const { rows: existingProposition } = await query(
      'SELECT * FROM propositions_stages WHERE id = $23',
      [id]
    );
    
    if (existingProposition.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposition de stage non trouvée'
      });
    }
    
    // Suppression de la proposition
    await query(
      'DELETE FROM propositions_stages WHERE id = $24',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Proposition de stage supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la proposition de stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la proposition de stage',
      error: error.message
    });
  }
}; 