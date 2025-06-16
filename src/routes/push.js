import express from 'express';
import { protect } from '../middleware/auth.js';
import PushNotificationService from '../services/PushNotificationService.js';
import db from '../config/db.js';

const router = express.Router();

/**
 * POST /api/push/subscribe
 * Enregistrer un abonnement push pour l'utilisateur connecté
 */
router.post('/subscribe', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = req.body;

    // Validation de l'abonnement
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Données d\'abonnement invalides'
      });
    }

    const result = await PushNotificationService.subscribe(userId, subscription);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: { userId, endpoint: subscription.endpoint }
    });

  } catch (error) {
    console.error('Erreur abonnement push:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'abonnement aux notifications push',
      error: error.message
    });
  }
});

/**
 * DELETE /api/push/unsubscribe
 * Désabonner l'utilisateur des notifications push
 */
router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    const result = await PushNotificationService.unsubscribe(userId, endpoint);
    
    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Erreur désabonnement push:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du désabonnement',
      error: error.message
    });
  }
});

/**
 * POST /api/push/clean-subscriptions
 * Nettoyer les anciens abonnements push de l'utilisateur connecté
 */
router.post('/clean-subscriptions', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Supprimer tous les abonnements de l'utilisateur
    const { rowCount } = await db.query(
      'DELETE FROM push_subscriptions WHERE utilisateur_id = $1',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: `${rowCount} abonnements supprimés`,
      data: { userId, deletedCount: rowCount }
    });

  } catch (error) {
    console.error('Erreur nettoyage abonnements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage des abonnements',
      error: error.message
    });
  }
});

/**
 * POST /api/push/test
 * Envoyer une notification push de test à l'utilisateur connecté
 */
router.post('/test', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await PushNotificationService.sendTestNotification(userId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Notification de test envoyée avec succès',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Impossible d\'envoyer la notification de test'
      });
    }

  } catch (error) {
    console.error('Erreur test push:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification de test',
      error: error.message
    });
  }
});

/**
 * GET /api/push/subscriptions
 * Récupérer les abonnements push de l'utilisateur connecté
 */
router.get('/subscriptions', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: subscriptions } = await db.query(
      `SELECT id, endpoint, created_at, updated_at, is_active 
       FROM push_subscriptions 
       WHERE utilisateur_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    console.error('Erreur récupération abonnements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des abonnements',
      error: error.message
    });
  }
});

/**
 * GET /api/push/stats
 * Récupérer les statistiques des notifications push pour l'utilisateur
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await PushNotificationService.getStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur stats push:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

/**
 * POST /api/push/resubscribe
 * Réabonner après un changement d'abonnement (appelé par le service worker)
 */
router.post('/resubscribe', async (req, res) => {
  try {
    const subscription = req.body;
    
    // Cette route est appelée par le service worker, donc pas d'authentification utilisateur
    // On peut identifier l'utilisateur par l'endpoint ou d'autres moyens
    
    console.log('Réabonnement push reçu:', subscription);
    
    res.status(200).json({
      success: true,
      message: 'Réabonnement traité'
    });

  } catch (error) {
    console.error('Erreur réabonnement push:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du réabonnement',
      error: error.message
    });
  }
});

// Routes pour le tracking des notifications (appelées par le service worker)

/**
 * POST /api/push/mark-delivered
 * Marquer une notification comme délivrée
 */
router.post('/mark-delivered', async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    if (notificationId && notificationId !== 'undefined') {
      await PushNotificationService.markAsDelivered(notificationId);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur marquage livraison:', error);
    res.status(200).json({ success: false }); // Toujours retourner 200 pour le SW
  }
});

/**
 * POST /api/push/mark-opened
 * Marquer une notification comme ouverte
 */
router.post('/mark-opened', async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    if (notificationId && notificationId !== 'undefined') {
      await PushNotificationService.markAsOpened(notificationId);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur marquage ouverture:', error);
    res.status(200).json({ success: false }); // Toujours retourner 200 pour le SW
  }
});

/**
 * POST /api/push/snooze
 * Reporter une notification (snooze)
 */
router.post('/snooze', async (req, res) => {
  try {
    const { notificationId, snoozeMinutes = 60 } = req.body;
    
    // TODO: Implémenter la logique de snooze
    // Programmer une nouvelle notification après le délai spécifié
    
    console.log(`Notification ${notificationId} reportée de ${snoozeMinutes} minutes`);
    
    res.status(200).json({ 
      success: true,
      message: `Notification reportée de ${snoozeMinutes} minutes`
    });
  } catch (error) {
    console.error('Erreur snooze:', error);
    res.status(200).json({ success: false });
  }
});

export default router;
