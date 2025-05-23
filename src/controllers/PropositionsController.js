import db from '../config/db.js';
const { query } = db;

/**
 * Récupère la liste des propositions de stage
 */
export const getPropositions = async (req, res) => {
  try {
    // Récupération des paramètres de pagination
    const { page = 1, limit = 10, statut, filiere_id, entreprise_id } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let queryParams = [];
    let paramIndex = 1;

    if (statut) {
      whereClauses.push(`p.statut = $${paramIndex++}`);
      queryParams.push(statut);
    }
    if (filiere_id) {
      whereClauses.push(`p.filiere_id = $${paramIndex++}`);
      queryParams.push(filiere_id);
    }
    if (entreprise_id) {
      whereClauses.push(`p.entreprise_id = $${paramIndex++}`);
      queryParams.push(entreprise_id);
    }

    const whereCondition = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Récupération des propositions avec pagination et filtres
    const propositionsQuery = `
      SELECT 
        p.id,
        p.titre,
        p.description,
        p.requirements,
        p.entreprise_nom, 
        p.location, 
        p.duration,
        p.filiere_id,
        p.statut,
        p.date_publication,
        p.updated_at,
        f.nom_filiere, -- Supposant que vous avez une table filieres avec nom_filiere
        e.nom as nom_entreprise_table -- Nom de l'entreprise depuis la table entreprises
      FROM 
        propositions_stages p
      LEFT JOIN 
        filieres f ON p.filiere_id = f.id
      LEFT JOIN
        entreprises e ON p.entreprise_id = e.id
      ${whereCondition}
      ORDER BY 
        p.date_publication DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const { rows: propositions } = await query(propositionsQuery, queryParams);
    
    // Récupération du nombre total de propositions avec les mêmes filtres
    const countQuery = `SELECT COUNT(*) as total FROM propositions_stages p ${whereCondition}`;
    // Attention: les paramètres pour countQuery doivent correspondre à ceux de whereCondition
    const countQueryParams = queryParams.slice(0, whereClauses.length);
    const { rows: countResult } = await query(countQuery, countQueryParams);
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
  const { 
    titre, 
    description, 
    requirements,
    entreprise_nom, // Nom de l'entreprise (peut être utilisé si entreprise_id non fourni)
    entreprise_id,  // ID de l'entreprise (préféré)
    location, 
    duration, 
    filiere_id,
    statut = 'active' // Valeur par défaut pour statut
  } = req.body;
  
  // Validation des données
  if (!titre || !description || !entreprise_nom) { // entreprise_nom gardé pour validation simple, mais entreprise_id est mieux
    return res.status(400).json({
      success: false,
      message: 'Le titre, la description et le nom de l\'entreprise sont requis'
    });
  }
  
  try {
    // Gestion de l'entreprise: Si entreprise_id n'est pas fourni,
    // vous pourriez vouloir chercher/créer une entreprise basée sur entreprise_nom ici.
    // Pour l'instant, nous supposons que entreprise_id est fourni ou que entreprise_nom est suffisant.

    const { rows: result } = await query(
      `INSERT INTO propositions_stages (
        titre, 
        description, 
        requirements,
        entreprise_nom,
        entreprise_id,
        location, 
        duration, 
        filiere_id,
        statut,
        date_publication 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING id`,
      [titre, description, requirements, entreprise_nom, entreprise_id, location, duration, filiere_id, statut]
    );
    
    const newPropositionId = result[0].id;

    // Enregistrement de l'activité récente (si la table activites_recentes existe)
    // try {
    //   await query(
    //     `INSERT INTO activites_recentes (type_activite, type, description, valeur, date_activite, user_id) 
    //      VALUES ($1, $2, $3, $4, NOW(), $5)`,
    //     ['proposition_stage_creee', 'creation', \`Nouvelle proposition: ${titre}\`, newPropositionId, req.user?.id || null]
    //   );
    // } catch (activiteError) {
    //   console.warn("Avertissement: Échec de l'enregistrement de l'activité récente pour la création de proposition", activiteError);
    // }
    
    res.status(201).json({
      success: true,
      message: 'Proposition de stage créée avec succès',
      data: {
        id: newPropositionId
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
  const { 
    titre, 
    description, 
    requirements,
    entreprise_nom,
    entreprise_id,
    location, 
    duration, 
    filiere_id,
    statut 
  } = req.body;
  
  // Validation simple: au moins un champ doit être fourni
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucune donnée à mettre à jour fournie.'
    });
  }
  
  try {
    const { rows: existingProposition } = await query(
      'SELECT * FROM propositions_stages WHERE id = $1',
      [id]
    );
    
    if (existingProposition.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposition de stage non trouvée'
      });
    }
    
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    if (titre !== undefined) {
      updateFields.push(`titre = $${paramIndex++}`);
      queryParams.push(titre);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      queryParams.push(description);
    }
    if (requirements !== undefined) {
      updateFields.push(`requirements = $${paramIndex++}`);
      queryParams.push(requirements);
    }
    if (entreprise_nom !== undefined) { // Si vous permettez de maj le nom directement
      updateFields.push(`entreprise_nom = $${paramIndex++}`);
      queryParams.push(entreprise_nom);
    }
    if (entreprise_id !== undefined) {
      updateFields.push(`entreprise_id = $${paramIndex++}`);
      queryParams.push(entreprise_id);
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramIndex++}`);
      queryParams.push(location);
    }
    if (duration !== undefined) {
      updateFields.push(`duration = $${paramIndex++}`);
      queryParams.push(duration);
    }
    if (filiere_id !== undefined) {
      updateFields.push(`filiere_id = $${paramIndex++}`);
      queryParams.push(filiere_id);
    }
    if (statut !== undefined) {
      updateFields.push(`statut = $${paramIndex++}`);
      queryParams.push(statut);
    }

    if (updateFields.length === 0) {
       return res.status(400).json({
        success: false,
        message: 'Aucun champ valide à mettre à jour fourni.'
      });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(id); // ID pour la clause WHERE
    
    await query(
      `UPDATE propositions_stages
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}`,
      queryParams
    );

    // Enregistrement de l'activité récente (si la table activites_recentes existe)
    // try {
    //   await query(
    //     `INSERT INTO activites_recentes (type_activite, type, description, valeur, date_activite, user_id) 
    //      VALUES ($1, $2, $3, $4, NOW(), $5)`,
    //     ['proposition_stage_modifiee', 'modification', \`Proposition ID ${id} modifiée\`, id, req.user?.id || null]
    //   );
    // } catch (activiteError) {
    //    console.warn("Avertissement: Échec de l'enregistrement de l'activité récente pour la modification de proposition", activiteError);
    // }
    
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
    const { rows: existingProposition } = await query(
      'SELECT * FROM propositions_stages WHERE id = $1',
      [id]
    );
    
    if (existingProposition.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposition de stage non trouvée'
      });
    }
    
    await query(
      'DELETE FROM propositions_stages WHERE id = $1',
      [id]
    );

    // Enregistrement de l'activité récente (si la table activites_recentes existe)
    // try {
    //   await query(
    //     `INSERT INTO activites_recentes (type_activite, type, description, valeur, date_activite, user_id) 
    //      VALUES ($1, $2, $3, $4, NOW(), $5)`,
    //     ['proposition_stage_supprimee', 'suppression', \`Proposition ID ${id} supprimée\`, id, req.user?.id || null]
    //   );
    // } catch (activiteError) {
    //   console.warn("Avertissement: Échec de l'enregistrement de l'activité récente pour la suppression de proposition", activiteError);
    // }
    
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