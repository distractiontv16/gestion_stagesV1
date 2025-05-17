import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clef_secrete_très_longue_et_complexe';

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const [users] = await pool.query(
        'SELECT id, nom, prenom, email, matricule, filiere_id, role FROM utilisateurs WHERE id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }
      
      // Set user in request
      req.user = users[0];
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé, token invalide' 
      });
    }
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Non autorisé, aucun token' 
    });
  }
};

// Middleware for admin routes
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès refusé. Réservé aux administrateurs'
    });
  }
};

export default { protect, adminOnly }; 