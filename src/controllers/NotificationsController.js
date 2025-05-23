import db from '../config/db.js';
const { query } = db;

/**
 * Récupère la liste des notifications pour l'administrateur
 * Potentiellement toutes les notifications ou celles envoyées par l'admin,
 * ou à destination d'utilisateurs spécifiques.
 * Pour l'instant, récupère toutes les notifications.
 */
export const getNotifications = async (req, res) => {
  try {
    // TODO: Ajouter la pagination si nécessaire
    const { rows: notifications } = await query(
      `SELECT 
        n.id,
        n.utilisateur_id,
        u.email as utilisateur_email, // Ou u.nom, selon votre table utilisateurs
        n.message,
        n.lue,
        n.created_at
      FROM 
        notifications n
      LEFT JOIN
        utilisateurs u ON n.utilisateur_id = u.id
      ORDER BY 
        n.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

/**
 * Crée (envoie) une nouvelle notification
 */
export const createNotification = async (req, res) => {
  const { utilisateur_id, message } = req.body;
  
  if (!utilisateur_id || !message) {
    return res.status(400).json({
      success: false,
      message: 'L\'utilisateur_id et le message sont requis'
    });
  }
  
  try {
    const { rows: result } = await query(
      `INSERT INTO notifications (utilisateur_id, message) 
       VALUES ($1, $2)
       RETURNING id, created_at`,
      [utilisateur_id, message]
    );
    
    const newNotification = result[0];

    // TODO: Potentiellement, enregistrer une activité récente pour l'envoi de notification
    // await query(
    //   `INSERT INTO activites_recentes (type_activite, type, description, valeur, date_activite, user_id) 
    //    VALUES ($1, $2, $3, $4, NOW(), $5)`,
    //   ['notification_envoyee', 'creation', \`Notification envoyée à l'utilisateur ID ${utilisateur_id}\`, newNotification.id, req.user?.id || null]
    // );
    
    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: newNotification
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
}; 