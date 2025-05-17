import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clef_secrete_très_longue_et_complexe';

export const protect = async (req, res, next) => {
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
        'SELECT id, nom, prenom, email, matricule, role FROM utilisateurs WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Add user to request object
      req.user = users[0];
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token invalide'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Middleware for admin-only routes
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès refusé. Cette action nécessite des droits d\'administrateur'
    });
  }
};

export default { protect, adminOnly }; 