import db from '../config/db.js';
const { query } = db;

// Helper pour le logging (optionnel, mais peut être utile)
// const debug = (message, data = null) => console.log(`[ProjetsRealisesController] ${message}`, data || '');

/**
 * Récupère tous les projets réalisés (avec pagination optionnelle)
 */
export const getProjetsRealises = async (req, res) => {
  // debug('getProjetsRealises called', req.query);
  try {
    const { page = 1, limit = 10, filiere_id, annee, auteur, titre } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        pr.id,
        pr.titre,
        pr.description,
        pr.auteur,
        pr.annee,
        pr.filiere_id,
        f.nom as nom_filiere, -- Jointure pour obtenir le nom de la filière
        pr.technologies,
        pr.points_forts,
        pr.points_amelioration,
        pr.date_publication,
        pr.created_at,
        pr.updated_at
      FROM projets_realises pr
      LEFT JOIN filieres f ON pr.filiere_id = f.id
    `;
    let countQuery = `SELECT COUNT(pr.id) as total FROM projets_realises pr LEFT JOIN filieres f ON pr.filiere_id = f.id`;

    const whereClauses = [];
    const queryParams = [];
    let paramIndex = 1;

    if (filiere_id) {
      whereClauses.push(`pr.filiere_id = $${paramIndex++}`);
      queryParams.push(filiere_id);
    }
    if (annee) {
      whereClauses.push(`pr.annee = $${paramIndex++}`);
      queryParams.push(parseInt(annee, 10));
    }
    if (auteur) {
      whereClauses.push(`pr.auteur ILIKE $${paramIndex++}`);
      queryParams.push(`%${auteur}%`);
    }
    if (titre) {
      whereClauses.push(`pr.titre ILIKE $${paramIndex++}`);
      queryParams.push(`%${titre}%`);
    }

    if (whereClauses.length > 0) {
      const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
      baseQuery += whereString;
      countQuery += whereString;
    }

    baseQuery += ` ORDER BY pr.date_publication DESC, pr.annee DESC, pr.titre ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const mainQueryParams = [...queryParams, parseInt(limit, 10), parseInt(offset, 10)];
    
    const { rows: projets } = await query(baseQuery, mainQueryParams);
    const { rows: totalResult } = await query(countQuery, queryParams);
    const totalProjets = parseInt(totalResult[0]?.total || 0, 10);

    res.status(200).json({
      success: true,
      data: projets,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: totalProjets,
        totalPages: Math.ceil(totalProjets / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets réalisés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des projets réalisés.',
      error: error.message,
    });
  }
};

/**
 * Récupère un projet réalisé par son ID
 */
export const getProjetRealiseById = async (req, res) => {
  const { id } = req.params;
  // debug('getProjetRealiseById called', id);
  try {
    const { rows } = await query(
      `SELECT 
        pr.id, pr.titre, pr.description, pr.auteur, pr.annee, pr.filiere_id, 
        f.nom as nom_filiere, pr.technologies, pr.points_forts, 
        pr.points_amelioration, pr.date_publication, pr.created_at, pr.updated_at
      FROM projets_realises pr
      LEFT JOIN filieres f ON pr.filiere_id = f.id
      WHERE pr.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Projet réalisé non trouvé.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du projet réalisé.',
      error: error.message,
    });
  }
};

/**
 * Crée un nouveau projet réalisé
 */
export const createProjetRealise = async (req, res) => {
  const {
    titre, description, auteur, annee, filiere_id,
    technologies, points_forts, points_amelioration,
    date_publication // Optionnel, sinon CURRENT_TIMESTAMP
  } = req.body;
  // debug('createProjetRealise called', req.body);

  if (!titre || !auteur || !annee || !filiere_id) {
    return res.status(400).json({
      success: false,
      message: 'Les champs titre, auteur, année et filière sont requis.',
    });
  }

  try {
    const { rows } = await query(
      `INSERT INTO projets_realises 
        (titre, description, auteur, annee, filiere_id, technologies, points_forts, points_amelioration, date_publication)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        titre, description, auteur, parseInt(annee, 10), parseInt(filiere_id, 10),
        technologies || [], points_forts || [], points_amelioration || [],
        date_publication || new Date()
      ]
    );
    res.status(201).json({ success: true, message: 'Projet réalisé créé avec succès.', data: rows[0] });
  } catch (error) {
    console.error('Erreur lors de la création du projet réalisé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du projet réalisé.',
      error: error.message,
    });
  }
};

/**
 * Met à jour un projet réalisé existant
 */
export const updateProjetRealise = async (req, res) => {
  const { id } = req.params;
  const {
    titre, description, auteur, annee, filiere_id,
    technologies, points_forts, points_amelioration, date_publication
  } = req.body;
  // debug(`updateProjetRealise called for id ${id}`, req.body);

  if (!titre && !description && !auteur && !annee && !filiere_id && !technologies && !points_forts && !points_amelioration && !date_publication) {
    return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour fourni.' });
  }

  try {
    // Construction dynamique de la requête UPDATE
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (titre !== undefined) { fields.push(`titre = $${paramCount++}`); values.push(titre); }
    if (description !== undefined) { fields.push(`description = $${paramCount++}`); values.push(description); }
    if (auteur !== undefined) { fields.push(`auteur = $${paramCount++}`); values.push(auteur); }
    if (annee !== undefined) { fields.push(`annee = $${paramCount++}`); values.push(parseInt(annee, 10)); }
    if (filiere_id !== undefined) { fields.push(`filiere_id = $${paramCount++}`); values.push(parseInt(filiere_id, 10)); }
    if (technologies !== undefined) { fields.push(`technologies = $${paramCount++}`); values.push(technologies); }
    if (points_forts !== undefined) { fields.push(`points_forts = $${paramCount++}`); values.push(points_forts); }
    if (points_amelioration !== undefined) { fields.push(`points_amelioration = $${paramCount++}`); values.push(points_amelioration); }
    if (date_publication !== undefined) { fields.push(`date_publication = $${paramCount++}`); values.push(date_publication); }

    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'Aucun champ valide à mettre à jour fourni.' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`); // Toujours mettre à jour updated_at
    values.push(id);

    const updateQuery = `UPDATE projets_realises SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await query(updateQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Projet réalisé non trouvé pour la mise à jour.' });
    }
    res.status(200).json({ success: true, message: 'Projet réalisé mis à jour avec succès.', data: rows[0] });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du projet réalisé.',
      error: error.message,
    });
  }
};

/**
 * Supprime un projet réalisé
 */
export const deleteProjetRealise = async (req, res) => {
  const { id } = req.params;
  // debug(`deleteProjetRealise called for id ${id}`);
  try {
    const { rowCount } = await query('DELETE FROM projets_realises WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Projet réalisé non trouvé pour la suppression.' });
    }
    res.status(200).json({ success: true, message: 'Projet réalisé supprimé avec succès.' });
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du projet réalisé.',
      error: error.message,
    });
  }
}; 