import express from 'express';
import { getProjetsRealises } from '../controllers/ProjetsRealisesController.js';
import { getPropositionsThemes } from '../controllers/PropositionsThemesController.js';
import { getPropositionsStages } from '../controllers/PropositionsStagesController.js';

const router = express.Router();

// Route pour récupérer tous les projets réalisés (pour la vue publique/étudiant)
// GET /api/projets-realises
router.get('/projets-realises', getProjetsRealises);

// Route pour récupérer toutes les propositions de thèmes (pour la vue publique/étudiant)
// GET /api/propositions-themes
router.get('/propositions-themes', getPropositionsThemes);

// Route pour récupérer toutes les propositions de stages (pour la vue publique/étudiant)
// GET /api/propositions-stages
router.get('/propositions-stages', getPropositionsStages);

export default router; 