import express from 'express';
import { getNotificationsForUser, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/NotificationsController.js';
import { protect } from '../middleware/auth.js'; // Assurez-vous que ce middleware expose req.user.id

const router = express.Router();

// Récupérer les notifications pour l'utilisateur connecté
router.get('/', protect, getNotificationsForUser);

// Marquer une notification spécifique comme lue
router.put('/:id/read', protect, markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.put('/read-all', protect, markAllNotificationsAsRead);

export default router; 