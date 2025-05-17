import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clef_secrete_très_longue_et_complexe';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Register Endpoint
router.post('/register', [
  // Validation
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis'),
  body('telephone').notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Email invalide'),
  body('matricule').notEmpty().withMessage('Le matricule est requis'),
  body('filiere_id').isInt().withMessage('La filière est requise'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe doit contenir au moins 6 caractères'),
  body('whatsapp').optional(),
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nom, prenom, telephone, email, matricule, filiere_id, mot_de_passe, whatsapp } = req.body;

    // Check if user already exists with matricule
    const [existingUsers] = await pool.query(
      'SELECT * FROM utilisateurs WHERE matricule = ?', 
      [matricule]
    );
    
    // Vérifie l'email seulement si il est fourni
    if (email && email.trim() !== '') {
      const [existingEmails] = await pool.query(
        'SELECT * FROM utilisateurs WHERE email = ?', 
        [email]
      );
      
      if (existingEmails.length > 0) {
        return res.status(400).json({ 
          message: 'Un utilisateur avec cet email existe déjà' 
        });
      }
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec ce matricule existe déjà' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom, prenom, telephone, email, matricule, filiere_id, mot_de_passe, whatsapp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, telephone, email || null, matricule, filiere_id, hashedPassword, whatsapp || null]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: result.insertId, role: 'etudiant' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Return success
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
});

// Login Endpoint
router.post('/login', [
  body('matricule').notEmpty().withMessage('Le matricule est requis').trim(),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erreurs de validation:', errors.array());
    return res.status(400).json({ 
      success: false,
      message: 'Validation échouée',
      errors: errors.array() 
    });
  }

  try {
    const { matricule, password } = req.body;
    // Nettoyer également le matricule côté serveur (double sécurité)
    const cleanMatricule = matricule.trim();
    
    console.log('Tentative de connexion pour:', { matricule: cleanMatricule, password: '***' });

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE matricule = ?', 
      [cleanMatricule]
    );

    if (users.length === 0) {
      console.log('Utilisateur non trouvé avec matricule:', cleanMatricule);
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    const user = users[0];
    console.log('Utilisateur trouvé:', { id: user.id, matricule: user.matricule });

    // Check password
    const isMatch = await bcrypt.compare(password, user.mot_de_passe);
    console.log('Résultat de la comparaison de mot de passe:', isMatch);
    
    if (!isMatch) {
      console.log('Mot de passe incorrect pour l\'utilisateur:', cleanMatricule);
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Return success with user data (excluding password)
    const userData = {...user};
    delete userData.mot_de_passe;
    
    console.log('Connexion réussie pour l\'utilisateur:', cleanMatricule);
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion' 
    });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token manquant'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user info
      const [users] = await pool.query(
        'SELECT id, nom, prenom, telephone, email, matricule, filiere_id, role, whatsapp FROM utilisateurs WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      res.status(200).json({
        success: true,
        data: users[0]
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token invalide'
      });
    }
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router; 