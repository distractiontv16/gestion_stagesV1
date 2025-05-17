import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route pour récupérer les informations de stage d'un étudiant
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Vérifier si l'utilisateur est autorisé à accéder à ces informations
    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à ces informations'
      });
    }

    // Récupérer les informations de stage
    const [stages] = await pool.query(`
      SELECT s.*, e.nom as nom_entreprise, e.departement, e.commune, e.quartier,
             ms.nom as nom_maitre_stage, ms.prenom as prenom_maitre_stage, 
             ms.telephone as telephone_maitre_stage, ms.email as email_maitre_stage, 
             ms.fonction as fonction_maitre_stage,
             mm.nom as nom_maitre_memoire, mm.telephone as telephone_maitre_memoire, 
             mm.email as email_maitre_memoire, mm.statut as statut_maitre_memoire
      FROM stages s
      LEFT JOIN entreprises e ON s.entreprise_id = e.id
      LEFT JOIN maitres_stage ms ON s.maitre_stage_id = ms.id
      LEFT JOIN maitres_memoire mm ON s.maitre_memoire_id = mm.id
      WHERE s.etudiant_id = ?
    `, [userId]);

    res.status(200).json({
      success: true,
      data: stages.length > 0 ? stages[0] : null
    });
  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations de stage'
    });
  }
});

// Route pour créer ou mettre à jour un stage
router.post('/submit', protect, [
  // Validation des données
  body('departement').notEmpty().withMessage('Le département est requis'),
  body('commune').notEmpty().withMessage('La commune est requise'),
  body('quartier').notEmpty().withMessage('Le quartier est requis'),
  body('nomEntreprise').notEmpty().withMessage("Le nom de l'entreprise est requis"),
  body('dateDebutStage').notEmpty().withMessage('La date de début est requise'),
  // Date de fin optionnelle
  
  // Informations sur l'étudiant
  body('themeMemoire').notEmpty().withMessage("Le thème de mémoire est requis"),
  
  // Informations sur le maître de stage
  body('nomMaitreStage').notEmpty().withMessage('Le nom du maître de stage est requis'),
  body('prenomMaitreStage').notEmpty().withMessage('Le prénom du maître de stage est requis'),
  body('telephoneMaitreStage').notEmpty().withMessage('Le téléphone du maître de stage est requis'),
  body('emailMaitreStage').isEmail().withMessage("L'email du maître de stage doit être valide"),
  body('fonctionMaitreStage').notEmpty().withMessage('La fonction du maître de stage est requise'),
  
  // Informations sur le maître de mémoire
  body('nomMaitreMemoire').notEmpty().withMessage('Le nom du maître de mémoire est requis'),
  body('telephoneMaitreMemoire').notEmpty().withMessage('Le téléphone du maître de mémoire est requis'),
  body('emailMaitreMemoire').isEmail().withMessage("L'email du maître de mémoire doit être valide"),
  body('statutMaitreMemoire').notEmpty().withMessage('Le statut du maître de mémoire est requis'),
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const {
      departement,
      commune,
      quartier,
      nomEntreprise,
      dateDebutStage,
      dateFinStage,
      themeMemoire,
      nomMaitreStage,
      prenomMaitreStage,
      telephoneMaitreStage,
      emailMaitreStage,
      fonctionMaitreStage,
      nomMaitreMemoire,
      telephoneMaitreMemoire,
      emailMaitreMemoire,
      statutMaitreMemoire
    } = req.body;

    // Début d'une transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Vérifier si l'entreprise existe déjà
      let [existingEnterprise] = await connection.query(
        'SELECT id FROM entreprises WHERE nom = ? AND departement = ? AND commune = ? AND quartier = ?',
        [nomEntreprise, departement, commune, quartier]
      );

      let entrepriseId;
      
      // Si l'entreprise n'existe pas, l'ajouter
      if (existingEnterprise.length === 0) {
        const [newEnterprise] = await connection.query(
          'INSERT INTO entreprises (nom, departement, commune, quartier) VALUES (?, ?, ?, ?)',
          [nomEntreprise, departement, commune, quartier]
        );
        entrepriseId = newEnterprise.insertId;
      } else {
        entrepriseId = existingEnterprise[0].id;
      }

      // 2. Vérifier si le maître de stage existe déjà
      let [existingMaitreStage] = await connection.query(
        'SELECT id FROM maitres_stage WHERE nom = ? AND prenom = ? AND email = ?',
        [nomMaitreStage, prenomMaitreStage, emailMaitreStage]
      );

      let maitreStageId;
      
      // Si le maître de stage n'existe pas, l'ajouter
      if (existingMaitreStage.length === 0) {
        const [newMaitreStage] = await connection.query(
          'INSERT INTO maitres_stage (nom, prenom, telephone, email, fonction, entreprise_id) VALUES (?, ?, ?, ?, ?, ?)',
          [nomMaitreStage, prenomMaitreStage, telephoneMaitreStage, emailMaitreStage, fonctionMaitreStage, entrepriseId]
        );
        maitreStageId = newMaitreStage.insertId;
      } else {
        maitreStageId = existingMaitreStage[0].id;
        // Mettre à jour les informations du maître de stage
        await connection.query(
          'UPDATE maitres_stage SET telephone = ?, fonction = ?, entreprise_id = ? WHERE id = ?',
          [telephoneMaitreStage, fonctionMaitreStage, entrepriseId, maitreStageId]
        );
      }

      // 3. Vérifier si le maître de mémoire existe déjà
      let [existingMaitreMemoire] = await connection.query(
        'SELECT id FROM maitres_memoire WHERE nom = ? AND email = ?',
        [nomMaitreMemoire, emailMaitreMemoire]
      );

      let maitreMemoireId;
      
      // Si le maître de mémoire n'existe pas, l'ajouter
      if (existingMaitreMemoire.length === 0) {
        const [newMaitreMemoire] = await connection.query(
          'INSERT INTO maitres_memoire (nom, telephone, email, statut) VALUES (?, ?, ?, ?)',
          [nomMaitreMemoire, telephoneMaitreMemoire, emailMaitreMemoire, statutMaitreMemoire]
        );
        maitreMemoireId = newMaitreMemoire.insertId;
      } else {
        maitreMemoireId = existingMaitreMemoire[0].id;
        // Mettre à jour les informations du maître de mémoire
        await connection.query(
          'UPDATE maitres_memoire SET telephone = ?, statut = ? WHERE id = ?',
          [telephoneMaitreMemoire, statutMaitreMemoire, maitreMemoireId]
        );
      }

      // 4. Vérifier si un stage existe déjà pour cet étudiant
      const [existingStage] = await connection.query(
        'SELECT id FROM stages WHERE etudiant_id = ?',
        [req.user.id]
      );

      let stageId;
      
      // Si le stage n'existe pas, l'ajouter
      if (existingStage.length === 0) {
        const [newStage] = await connection.query(
          'INSERT INTO stages (etudiant_id, entreprise_id, maitre_stage_id, maitre_memoire_id, date_debut, date_fin, theme_memoire) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.user.id, entrepriseId, maitreStageId, maitreMemoireId, dateDebutStage, dateFinStage || null, themeMemoire]
        );
        stageId = newStage.insertId;
      } else {
        stageId = existingStage[0].id;
        // Mettre à jour les informations du stage
        await connection.query(
          'UPDATE stages SET entreprise_id = ?, maitre_stage_id = ?, maitre_memoire_id = ?, date_debut = ?, date_fin = ?, theme_memoire = ? WHERE id = ?',
          [entrepriseId, maitreStageId, maitreMemoireId, dateDebutStage, dateFinStage || null, themeMemoire, stageId]
        );
      }

      // Commit de la transaction
      await connection.commit();
      
      res.status(200).json({
        success: true,
        message: 'Informations de stage enregistrées avec succès',
        stageId: stageId
      });
    } catch (error) {
      // Rollback en cas d'erreur
      await connection.rollback();
      throw error;
    } finally {
      // Libération de la connexion
      connection.release();
    }
    
  } catch (error) {
    console.error('Submit internship error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement des informations de stage'
    });
  }
});

export default router; 