import pool from '../config/db.js';

/**
 * Récupère tous les paramètres par filière
 */
export const getParametresParFiliere = async (req, res) => {
  try {
    const [parametres] = await pool.query(
      `SELECT 
        pf.id,
        pf.filiere_id,
        f.nom as filiere_nom,
        pf.nb_etudiants,
        pf.nb_stages_requis,
        pf.pourcentage_reussite
      FROM 
        parametres_filieres pf
      JOIN 
        filieres f ON pf.filiere_id = f.id
      ORDER BY 
        f.nom`
    );

    res.status(200).json({
      success: true,
      data: parametres
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres par filière:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres par filière',
      error: error.message
    });
  }
};

/**
 * Met à jour les paramètres d'une filière
 */
export const updateParametresFiliere = async (req, res) => {
  const { id } = req.params;
  const { nb_etudiants, nb_stages_requis, pourcentage_reussite } = req.body;

  // Vérification des données
  if (!nb_etudiants || !nb_stages_requis || pourcentage_reussite === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir toutes les informations nécessaires (nb_etudiants, nb_stages_requis, pourcentage_reussite)'
    });
  }

  try {
    // Vérifier si le paramètre existe
    const [existingParams] = await pool.query(
      'SELECT * FROM parametres_filieres WHERE id = ?',
      [id]
    );

    if (existingParams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre non trouvé'
      });
    }

    // Mise à jour des paramètres
    await pool.query(
      `UPDATE parametres_filieres 
      SET 
        nb_etudiants = ?,
        nb_stages_requis = ?,
        pourcentage_reussite = ?
      WHERE 
        id = ?`,
      [nb_etudiants, nb_stages_requis, pourcentage_reussite, id]
    );

    // Enregistrer l'activité
    await pool.query(
      `INSERT INTO activites_recentes 
        (type_activite, type, description, valeur, date_activite, date_creation, user_id) 
      VALUES 
        ('parametres_update', 'configuration', 'Mise à jour des paramètres de filière', ?, CURDATE(), NOW(), NULL)`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Paramètres de la filière mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de filière:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres de filière',
      error: error.message
    });
  }
};

/**
 * Récupère les paramètres système
 */
export const getParametresSysteme = async (req, res) => {
  try {
    const [parametres] = await pool.query(
      `SELECT 
        id, nom, valeur, description
      FROM 
        parametres_systeme
      ORDER BY 
        nom`
    );

    res.status(200).json({
      success: true,
      data: parametres
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres système:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres système',
      error: error.message
    });
  }
};

/**
 * Met à jour un paramètre système
 */
export const updateParametreSysteme = async (req, res) => {
  const { nom } = req.params;
  const { valeur } = req.body;

  if (valeur === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir une valeur pour le paramètre'
    });
  }

  try {
    // Vérifier si le paramètre existe
    const [existingParam] = await pool.query(
      'SELECT * FROM parametres_systeme WHERE nom = ?',
      [nom]
    );

    if (existingParam.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre système non trouvé'
      });
    }

    // Mise à jour du paramètre
    await pool.query(
      'UPDATE parametres_systeme SET valeur = ? WHERE nom = ?',
      [valeur, nom]
    );

    // Enregistrer l'activité
    await pool.query(
      `INSERT INTO activites_recentes 
        (type_activite, type, description, valeur, date_activite, date_creation, user_id) 
      VALUES 
        ('parametres_systeme_update', 'configuration', 'Mise à jour du paramètre système', 0, CURDATE(), NOW(), NULL)`,
      []
    );

    res.status(200).json({
      success: true,
      message: 'Paramètre système mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre système:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du paramètre système',
      error: error.message
    });
  }
}; 