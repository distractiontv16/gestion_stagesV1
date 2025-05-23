import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as StatistiquesController from '../controllers/StatistiquesController.js';
import * as ParametresController from '../controllers/ParametresController.js';
import * as EtudiantsController from '../controllers/EtudiantsController.js';
import * as PropositionsController from '../controllers/PropositionsController.js';
import * as NotificationsController from '../controllers/NotificationsController.js';
import * as ProjetsRealisesController from '../controllers/ProjetsRealisesController.js';
import * as PropositionsThemesController from '../controllers/PropositionsThemesController.js';
import db from '../config/db.js';
const { query: pool } = db;

const router = express.Router();

// Middleware pour protéger toutes les routes admin
router.use(protect);
router.use(restrictTo('admin'));

// Routes pour les statistiques
router.get('/statistiques', StatistiquesController.getStatistiquesGenerales);
router.get('/statistiques/filiere', StatistiquesController.getStatistiquesParFiliere);
router.get('/statistiques/entreprise', StatistiquesController.getStatistiquesParEntreprise);
router.get('/activites', StatistiquesController.getActivitesRecentes);

// Routes pour les paramètres
router.get('/parametres/filiere', ParametresController.getParametresParFiliere);
router.put('/parametres/filiere/:id', ParametresController.updateParametresFiliere);
router.get('/parametres/systeme', ParametresController.getParametresSysteme);
router.put('/parametres/systeme/:nom', ParametresController.updateParametreSysteme);

// Routes pour les étudiants
router.get('/etudiants', EtudiantsController.getEtudiants);
router.get('/etudiants/:id', EtudiantsController.getEtudiantParId);
router.get('/etudiants/statistiques', EtudiantsController.getStatistiquesEtudiants);

// Routes pour les propositions de stage
router.get('/propositions', PropositionsController.getPropositions);
router.post('/propositions', PropositionsController.createProposition);
router.put('/propositions/:id', PropositionsController.updateProposition);
router.delete('/propositions/:id', PropositionsController.deleteProposition);

// Routes pour les notifications (ADMIN)
router.get('/notifications', NotificationsController.getNotifications);
router.post('/notifications', NotificationsController.createNotification);

// Routes pour les Projets Réalisés (ADMIN)
router.get('/projets-realises', ProjetsRealisesController.getProjetsRealises);
router.post('/projets-realises', ProjetsRealisesController.createProjetRealise);
router.get('/projets-realises/:id', ProjetsRealisesController.getProjetRealiseById);
router.put('/projets-realises/:id', ProjetsRealisesController.updateProjetRealise);
router.delete('/projets-realises/:id', ProjetsRealisesController.deleteProjetRealise);

// Routes pour les Propositions de Thèmes (ADMIN)
router.get('/propositions-themes', PropositionsThemesController.getPropositionsThemes);
router.post('/propositions-themes', PropositionsThemesController.createPropositionTheme);
router.get('/propositions-themes/:id', PropositionsThemesController.getPropositionThemeById);
router.put('/propositions-themes/:id', PropositionsThemesController.updatePropositionTheme);
router.delete('/propositions-themes/:id', PropositionsThemesController.deletePropositionTheme);

// Route de débogage SQL pour les administrateurs uniquement
router.post('/debug', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'La requête SQL est requise'
      });
    }
    
    // Vérifie que la requête est de type SELECT ou SHOW pour des raisons de sécurité
    const firstWord = query.trim().split(' ')[0].toUpperCase();
    if (!['SELECT', 'SHOW', 'DESCRIBE', 'DESC'].includes(firstWord)) {
      return res.status(403).json({
        success: false,
        message: 'Seules les requêtes SELECT, SHOW et DESCRIBE sont autorisées pour le débogage'
      });
    }
    
    console.log('Exécution de la requête de débogage SQL:', query);
    const { rows: results } = await pool.query(query);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête SQL de débogage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exécution de la requête SQL',
      error: error.message
    });
  }
});

export default router; 