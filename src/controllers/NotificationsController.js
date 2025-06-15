import db from '../config/db.js';
import { sendPushNotificationToUsers } from '../services/PushNotificationService.js';
const { query } = db;

// Fonction utilitaire pour le log de débogage
const debug = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG][NotificationsController][${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

/**
 * Récupère la liste des notifications pour l'utilisateur actuellement connecté.
 */
export const getNotificationsForUser = async (req, res) => {
  try {
    const utilisateurId = req.user?.id; // Supposant que req.user.id est disponible via le middleware d'auth

    if (!utilisateurId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const { rows: notifications } = await query(
      `SELECT
        id,
        titre, -- Ajout de la colonne titre
        message,
        lue,
        created_at,
        type,
        priority,
        target_url
      FROM
        notifications
      WHERE
        utilisateur_id = $1
      ORDER BY
        created_at DESC`,
      [utilisateurId]
    );

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications pour l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

/**
 * Récupère uniquement les notifications non lues pour l'utilisateur (pour le polling)
 */
export const getUnreadNotificationsForUser = async (req, res) => {
  try {
    const utilisateurId = req.user?.id;

    if (!utilisateurId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const { rows: notifications } = await query(
      `SELECT
        id,
        titre,
        message,
        lue,
        created_at,
        type,
        priority,
        target_url
      FROM
        notifications
      WHERE
        utilisateur_id = $1
        AND lue = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY
        created_at DESC`,
      [utilisateurId]
    );

    res.status(200).json({
      success: true,
      notifications: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications non lues:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications non lues'
    });
  }
};

/**
 * Crée (envoie) une nouvelle notification ou des notifications en masse.
 */
export const createNotification = async (req, res) => {
  const { destinataire, titre, message } = req.body;
  debug('Appel API: createNotification', { destinataire, titre, message });

  if (!destinataire || !destinataire.type || !message || !titre) {
    debug('Validation échouée: champs manquants', { destinataire, titre, message });
    return res.status(400).json({
      success: false,
      message: 'Le type de destinataire, le titre et le message sont requis.'
    });
  }

  const { type, id: destinataireId } = destinataire; // destinataireId peut être utilisateur_id ou filiere_id

  try {
    let userIdsToNotify = [];

    if (type === 'etudiant') {
      if (!destinataireId) {
        debug('Validation échouée: utilisateur_id manquant pour type etudiant');
        return res.status(400).json({ success: false, message: 'L\'utilisateur_id est requis pour le type "etudiant".' });
      }
      userIdsToNotify.push(destinataireId);
      debug('Notification pour étudiant spécifique', { userId: destinataireId });
    } else if (type === 'filiere') {
      if (!destinataireId) {
        debug('Validation échouée: filiere_id manquant pour type filiere');
        return res.status(400).json({ success: false, message: 'Le filiere_id est requis pour le type "filiere".' });
      }
      debug('Notification pour filière', { filiereId: destinataireId });
      const { rows: usersInFiliere } = await query(
        "SELECT id FROM utilisateurs WHERE role = 'etudiant' AND filiere_id = $1",
        [destinataireId]
      );
      userIdsToNotify = usersInFiliere.map(user => user.id);
      debug('Utilisateurs dans la filière', { userIdsToNotify });
      if (userIdsToNotify.length === 0) {
        debug('Aucun étudiant trouvé pour cette filière', { filiereId: destinataireId });
        return res.status(404).json({ success: false, message: 'Aucun étudiant trouvé pour cette filière.' });
      }
    } else if (type === 'tous') {
      debug('Notification pour tous les étudiants');
      const { rows: allEtudiants } = await query(
        "SELECT id FROM utilisateurs WHERE role = 'etudiant'"
      );
      userIdsToNotify = allEtudiants.map(user => user.id);
      debug('Tous les étudiants', { userIdsToNotify });
      if (userIdsToNotify.length === 0) {
        debug('Aucun étudiant trouvé');
        return res.status(404).json({ success: false, message: 'Aucun étudiant trouvé.' });
      }
    } else {
      debug('Validation échouée: type de destinataire invalide', { type });
      return res.status(400).json({ success: false, message: 'Type de destinataire invalide.' });
    }

    if (userIdsToNotify.length === 0) {
        debug('Aucun utilisateur à notifier après filtrage.');
        // Message déjà envoyé si la recherche ne donnait rien, mais pour être sûr.
        return res.status(404).json({ success: false, message: 'Aucun destinataire trouvé pour cette notification.' });
    }

    // Utilisation d'une transaction pour insérer toutes les notifications
    // Cela garantit que soit toutes les notifications sont créées, soit aucune ne l'est.
    const client = await db.pool.connect(); // Obtenir un client du pool
    try {
      await client.query('BEGIN');
      debug('Transaction commencée');

      const insertPromises = userIdsToNotify.map(userId => {
        return client.query(
          `INSERT INTO notifications (utilisateur_id, titre, message) 
           VALUES ($1, $2, $3)
           RETURNING id`, // On ne retourne que l'id pour ne pas surcharger la réponse en cas de masse
          [userId, titre, message]
        );
      });
      
      const results = await Promise.all(insertPromises);
      const createdCount = results.reduce((count, result) => count + result.rowCount, 0);

      await client.query('COMMIT');
      debug('Transaction commitée', { createdCount });

      // NOUVEAU : Envoyer les notifications push après création en base
      debug('Envoi des notifications push...', { userIdsToNotify, titre, message });
      try {
        const pushResult = await sendPushNotificationToUsers(userIdsToNotify, {
          title: titre,
          body: message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-urgent.png',
          tag: 'admin-notification',
          requireInteraction: true,
          data: {
            type: 'admin_notification',
            timestamp: new Date().toISOString(),
            url: '/student/notifications'
          }
        });

        debug('Résultat envoi push', {
          success: pushResult.success,
          sent: pushResult.sent,
          failed: pushResult.failed
        });

        if (pushResult.success) {
          debug(`✅ Notifications push envoyées: ${pushResult.sent}/${userIdsToNotify.length}`);
        } else {
          debug(`⚠️ Problème envoi push: ${pushResult.failed}/${userIdsToNotify.length} échecs`);
        }
      } catch (pushError) {
        debug('❌ Erreur lors de l\'envoi des notifications push', { error: pushError.message });
        console.error('Erreur push notifications:', pushError);
        // Ne pas faire échouer la requête si les push échouent
      }

      res.status(201).json({
        success: true,
        message: `${createdCount} notification(s) créée(s) avec succès.`,
        data: {
          count: createdCount,
          // On ne retourne pas toutes les notifications pour éviter une réponse trop volumineuse
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      debug('Transaction annulée (ROLLBACK)', { error: error.message });
      console.error('Erreur lors de la création de notifications en masse (transaction):', error);
      throw error; // Relance l'erreur pour être capturée par le catch externe
    } finally {
      client.release(); // Toujours libérer le client
      debug('Client de base de données libéré');
    }

  } catch (error) {
    debug('Erreur globale dans createNotification', { error: error.message, stack: error.stack });
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
};

/**
 * Marque une notification comme lue pour l'utilisateur connecté
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const utilisateurId = req.user?.id;
    const notificationId = req.params.id;

    if (!utilisateurId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    if (!notificationId) {
      return res.status(400).json({ success: false, message: 'ID de notification manquant' });
    }

    const { rowCount } = await query(
      'UPDATE notifications SET lue = TRUE WHERE id = $1 AND utilisateur_id = $2',
      [notificationId, utilisateurId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée ou non autorisée' });
    }

    res.status(200).json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Récupère toutes les notifications pour la vue admin (avec infos utilisateur)
 */
export const getAllNotificationsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query; // Ajout de pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const notificationsQuery = `
      SELECT 
        n.id,
        n.titre,
        n.message,
        n.lue,
        n.created_at,
        u.id AS utilisateur_id,
        u.nom AS utilisateur_nom,
        u.prenom AS utilisateur_prenom,
        u.matricule AS utilisateur_matricule
      FROM 
        notifications n
      JOIN 
        utilisateurs u ON n.utilisateur_id = u.id
      ORDER BY 
        n.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) FROM notifications;`;

    const { rows: notifications } = await query(notificationsQuery, [parseInt(limit), offset]);
    const { rows: totalResult } = await query(countQuery);
    const totalNotifications = parseInt(totalResult[0].count, 10);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalNotifications,
        totalPages: Math.ceil(totalNotifications / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les notifications pour l\'admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications pour l\'admin',
      error: error.message
    });
  }
};

// Optionnel: Marquer toutes les notifications comme lues pour l'utilisateur
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const utilisateurId = req.user?.id;
    if (!utilisateurId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    await query(
      'UPDATE notifications SET lue = TRUE WHERE utilisateur_id = $1 AND lue = FALSE',
      [utilisateurId]
    );
    res.status(200).json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de toutes les notifications:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Marque une notification comme affichée (pour le système simple de notifications)
 */
export const markNotificationAsDisplayed = async (req, res) => {
  try {
    const utilisateurId = req.user?.id;
    const notificationId = req.params.id;

    if (!utilisateurId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    if (!notificationId) {
      return res.status(400).json({ success: false, message: 'ID de notification manquant' });
    }

    // Marquer comme affichée (on peut ajouter une colonne displayed_at si nécessaire)
    const { rowCount } = await query(
      'UPDATE notifications SET push_delivered_at = NOW() WHERE id = $1 AND utilisateur_id = $2',
      [notificationId, utilisateurId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée ou non autorisée' });
    }

    res.status(200).json({ success: true, message: 'Notification marquée comme affichée' });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme affichée:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};