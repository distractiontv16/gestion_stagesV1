/**
 * Routes API pour le système SMS
 * Endpoints pour tester, monitorer et gérer les SMS
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import TextBeeService from '../services/TextBeeService.js';
import NotificationService from '../services/NotificationService.js';
import SMSScheduler from '../schedulers/SMSScheduler.js';

const router = express.Router();

/**
 * POST /api/sms/test
 * Tester l'envoi d'un SMS
 */
router.post('/test', protect, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et message requis'
      });
    }

    console.log(`📱 Test SMS demandé par utilisateur ${req.user.id}`);

    const result = await TextBeeService.sendSMS(phoneNumber, message);

    res.status(200).json({
      success: result.success,
      message: result.success ? 'SMS de test envoyé avec succès' : 'Échec envoi SMS',
      data: result
    });

  } catch (error) {
    console.error('❌ Erreur test SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test SMS',
      error: error.message
    });
  }
});

/**
 * POST /api/sms/test-stage
 * Tester un SMS de notification de stage
 */
router.post('/test-stage', protect, async (req, res) => {
  try {
    const { phoneNumber, prenom, titre, message } = req.body;

    if (!phoneNumber || !prenom) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone et prénom requis'
      });
    }

    const smsMessage = TextBeeService.formatStageNotificationSMS(
      prenom,
      titre || 'Test de notification',
      message || 'Ceci est un test de notification de stage'
    );

    const result = await TextBeeService.sendSMS(phoneNumber, smsMessage);

    res.status(200).json({
      success: result.success,
      message: result.success ? 'SMS de test stage envoyé' : 'Échec envoi SMS',
      data: result,
      formattedMessage: smsMessage
    });

  } catch (error) {
    console.error('❌ Erreur test SMS stage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test SMS stage',
      error: error.message
    });
  }
});

/**
 * GET /api/sms/config
 * Vérifier la configuration TextBee
 */
router.get('/config', protect, async (req, res) => {
  try {
    const configTest = await TextBeeService.testConfiguration();
    const usageStats = TextBeeService.getUsageStats();

    res.status(200).json({
      success: true,
      data: {
        configuration: configTest,
        usage: usageStats
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification config:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de configuration',
      error: error.message
    });
  }
});

/**
 * GET /api/sms/scheduler/status
 * Obtenir le statut du scheduler SMS
 */
router.get('/scheduler/status', protect, async (req, res) => {
  try {
    const status = SMSScheduler.getStatus();

    res.status(200).json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('❌ Erreur statut scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut',
      error: error.message
    });
  }
});

/**
 * POST /api/sms/scheduler/force-check
 * Forcer une vérification immédiate du scheduler
 */
router.post('/scheduler/force-check', protect, async (req, res) => {
  try {
    console.log(`🔄 Vérification forcée demandée par utilisateur ${req.user.id}`);
    
    await SMSScheduler.forceCheck();

    res.status(200).json({
      success: true,
      message: 'Vérification forcée exécutée'
    });

  } catch (error) {
    console.error('❌ Erreur vérification forcée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification forcée',
      error: error.message
    });
  }
});

/**
 * GET /api/sms/stats
 * Obtenir les statistiques des SMS
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const notificationStats = await NotificationService.getStats();
    const schedulerStats = SMSScheduler.getStats();
    const usageStats = TextBeeService.getUsageStats();

    res.status(200).json({
      success: true,
      data: {
        notifications: notificationStats,
        scheduler: schedulerStats,
        usage: usageStats
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

/**
 * GET /api/sms/pending
 * Obtenir les SMS en attente d'envoi
 */
router.get('/pending', protect, async (req, res) => {
  try {
    const pendingNotifications = await NotificationService.checkUnreadNotifications();

    res.status(200).json({
      success: true,
      data: {
        count: pendingNotifications.length,
        notifications: pendingNotifications.map(notif => ({
          id: notif.id,
          prenom: notif.prenom,
          telephone: notif.telephone,
          titre: notif.titre,
          scheduled_sms_at: notif.scheduled_sms_at,
          created_at: notif.created_at
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération SMS en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des SMS en attente',
      error: error.message
    });
  }
});

/**
 * POST /api/sms/send-immediate
 * Envoyer immédiatement un SMS à un utilisateur spécifique
 */
router.post('/send-immediate', protect, async (req, res) => {
  try {
    const { userId, titre, message, targetUrl } = req.body;

    if (!userId || !titre || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, titre et message requis'
      });
    }

    // Créer la notification
    const notification = await NotificationService.createNotification(
      userId, 
      titre, 
      message, 
      'both', // Push + SMS
      targetUrl
    );

    // Envoyer immédiatement le push
    await NotificationService.sendPushNotification(notification);

    res.status(200).json({
      success: true,
      message: 'Notification créée et push envoyé, SMS programmé pour dans 12h',
      data: {
        notificationId: notification.id,
        scheduledSmsAt: notification.scheduled_sms_at
      }
    });

  } catch (error) {
    console.error('❌ Erreur envoi immédiat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi immédiat',
      error: error.message
    });
  }
});

export default router;
