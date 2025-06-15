import express from 'express';
import {
  getNotificationsForUser,
  getUnreadNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationAsDisplayed
} from '../controllers/NotificationsController.js';
import { protect } from '../middleware/auth.js'; // Assurez-vous que ce middleware expose req.user.id

const router = express.Router();

// Récupérer les notifications pour l'utilisateur connecté
router.get('/', protect, getNotificationsForUser);

// Récupérer uniquement les notifications non lues (pour le polling)
router.get('/unread', protect, getUnreadNotificationsForUser);

// Marquer une notification spécifique comme lue
router.put('/:id/read', protect, markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.put('/read-all', protect, markAllNotificationsAsRead);

// Marquer une notification comme affichée (pour le système simple)
router.post('/:id/displayed', protect, markNotificationAsDisplayed);

export default router; 