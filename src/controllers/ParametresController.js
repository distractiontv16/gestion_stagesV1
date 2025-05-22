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
 * Récupère tous les paramètres par filière
 */
export const getParametresParFiliere = async (req, res) => {
  debug('Appel API: getParametresParFiliere');
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      debug('Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    debug('Utilisateur authentifié:', req.user);
    
    const sqlQuery = `SELECT 
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
      f.nom`;
    
    debug('Query SQL:', sqlQuery);
    const { rows: parametres } = await query(sqlQuery);
    debug('Résultat de la requête:', parametres);
    
    if (!parametres || parametres.length === 0) {
      debug('Aucun paramètre trouvé');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      data: parametres
    });
  } catch (error) {
    debug('ERREUR getParametresParFiliere:', error);
    console.error('Erreur lors de la récupération des paramètres par filière:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres par filière',
      error: error.message || 'Erreur inconnue'
    });
  }
};

/**
 * Met à jour les paramètres d'une filière
 */
export const updateParametresFiliere = async (req, res) => {
  const { id } = req.params;
  const { nb_etudiants, nb_stages_requis, pourcentage_reussite } = req.body;

  debug('Appel API: updateParametresFiliere pour id:', id);
  debug('Données reçues:', { nb_etudiants, nb_stages_requis, pourcentage_reussite });

  // Vérification des données
  if (!nb_etudiants || !nb_stages_requis || pourcentage_reussite === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir toutes les informations nécessaires (nb_etudiants, nb_stages_requis, pourcentage_reussite)'
    });
  }

  try {
    // Vérifier si le paramètre existe
    const checkQuery = 'SELECT * FROM parametres_filieres WHERE id = $1';
    debug('Query SQL (check):', checkQuery, [id]);
    const { rows: existingParams } = await query(checkQuery, [id]);
    debug('Résultat de la vérification:', existingParams);

    if (existingParams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre non trouvé'
      });
    }

    // Mise à jour des paramètres
    const updateQuery = `UPDATE parametres_filieres 
      SET 
        nb_etudiants = $1,
        nb_stages_requis = $2,
        pourcentage_reussite = $3
      WHERE 
        id = $4`;
    
    const updateParams = [nb_etudiants, nb_stages_requis, pourcentage_reussite, id];
    debug('Query SQL (update):', updateQuery, updateParams);
    await query(updateQuery, updateParams);
    debug('Mise à jour réussie');

    // Enregistrer l'activité
    const activityQuery = `INSERT INTO activites_recentes 
      (type_activite, type, description, valeur, date_activite, date_creation, user_id) 
    VALUES 
      ('parametres_update', 'configuration', 'Mise à jour des paramètres de filière', $1, CURRENT_DATE, NOW(), NULL)`;
    
    debug('Query SQL (activité):', activityQuery, [id]);
    await query(activityQuery, [id]);
    debug('Activité enregistrée');

    res.status(200).json({
      success: true,
      message: 'Paramètres de la filière mis à jour avec succès'
    });
  } catch (error) {
    debug('ERREUR updateParametresFiliere:', error);
    console.error('Erreur lors de la mise à jour des paramètres de filière:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres de filière',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Récupère les paramètres système
 */
export const getParametresSysteme = async (req, res) => {
  debug('Appel API: getParametresSysteme');
  try {
    const sqlQuery = `SELECT 
      id, nom, valeur, description
    FROM 
      parametres_systeme
    ORDER BY 
      nom`;
    
    debug('Query SQL:', sqlQuery);
    const { rows: parametres } = await query(sqlQuery);
    debug('Résultat de la requête:', parametres);

    return res.status(200).json({
      success: true,
      data: parametres
    });
  } catch (error) {
    debug('ERREUR getParametresSysteme:', error);
    console.error('Erreur lors de la récupération des paramètres système:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres système',
      error: error.message || 'Erreur inconnue'
    });
  }
};

/**
 * Met à jour un paramètre système
 */
export const updateParametreSysteme = async (req, res) => {
  const { nom } = req.params;
  const { valeur } = req.body;

  debug('Appel API: updateParametreSysteme pour nom:', nom);
  debug('Valeur reçue:', valeur);

  if (valeur === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir une valeur pour le paramètre'
    });
  }

  try {
    // Vérifier si le paramètre existe
    const checkQuery = 'SELECT * FROM parametres_systeme WHERE nom = $1';
    debug('Query SQL (check):', checkQuery, [nom]);
    const { rows: existingParam } = await query(checkQuery, [nom]);
    debug('Résultat de la vérification:', existingParam);

    if (existingParam.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre système non trouvé'
      });
    }

    // Mise à jour du paramètre
    const updateQuery = 'UPDATE parametres_systeme SET valeur = $1 WHERE nom = $2';
    const updateParams = [valeur, nom];
    debug('Query SQL (update):', updateQuery, updateParams);
    await query(updateQuery, updateParams);
    debug('Mise à jour réussie');

    // Enregistrer l'activité
    const activityQuery = `INSERT INTO activites_recentes 
      (type_activite, type, description, valeur, date_activite, date_creation, user_id) 
    VALUES 
      ('parametres_systeme_update', 'configuration', 'Mise à jour du paramètre système', 0, CURRENT_DATE, NOW(), NULL)`;
    
    debug('Query SQL (activité):', activityQuery);
    await query(activityQuery);
    debug('Activité enregistrée');

    res.status(200).json({
      success: true,
      message: 'Paramètre système mis à jour avec succès'
    });
  } catch (error) {
    debug('ERREUR updateParametreSysteme:', error);
    console.error('Erreur lors de la mise à jour du paramètre système:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du paramètre système',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 