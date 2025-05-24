import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js';
const { query } = db;

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
      console.log('Token décodé:', decoded);
      
      // Check if admin or regular user
      if (decoded.role === 'admin') {
        console.log('Utilisateur admin détecté dans le token');
        
        // Vérification spéciale pour admin avec matricule (cas spécial dans le système)
        if (decoded.matricule) {
          console.log('Cas spécial: Admin avec matricule', decoded.matricule);
          // Configuration directe de l'utilisateur comme admin
          req.user = {
            id: decoded.id,
            matricule: decoded.matricule,
            role: 'admin'
          };
          console.log('Utilisateur admin configuré avec success:', req.user);
          return next();
        }
        
        // Get admin from database (cas standard)
        const { rows: admins } = await query(
          'SELECT id, matricule FROM public.administrateurs WHERE id = $1',
          [decoded.id]
        );
        
        console.log('Recherche admin dans la BD:', { count: admins.length });
        
        if (admins.length === 0) {
          // Essayer de chercher l'admin dans la table utilisateurs
          const { rows: users } = await query(
            'SELECT id, nom, prenom, email, matricule, role FROM public.utilisateurs WHERE id = $1 AND role = $2',
            [decoded.id, 'admin']
          );
          
          console.log('Recherche admin dans table utilisateurs:', { count: users.length });
          
          if (users.length === 0) {
            console.log('Admin non trouvé dans aucune table');
            return res.status(401).json({ 
              success: false, 
              message: 'Administrateur non trouvé' 
            });
          }
          
          // Admin trouvé dans la table utilisateurs
          req.user = {
            id: users[0].id,
            matricule: users[0].matricule,
            nom: users[0].nom,
            prenom: users[0].prenom,
            email: users[0].email,
            role: 'admin'
          };
          
          console.log('Admin trouvé dans table utilisateurs:', req.user);
        } else {
          // Set admin in request
          req.user = {
            id: admins[0].id,
            matricule: admins[0].matricule,
            role: 'admin'
          };
          console.log('Admin trouvé dans table administrateurs:', req.user);
        }
      } else {
        // Get user from database
        const { rows: users } = await query(
          'SELECT id, nom, prenom, email, matricule, filiere_id, role FROM public.utilisateurs WHERE id = $1',
          [decoded.id]
        );
        
        if (users.length === 0) {
          console.log('Utilisateur non trouvé dans la BD:', decoded.id);
          return res.status(401).json({ 
            success: false, 
            message: 'Utilisateur non trouvé' 
          });
        }
        
        // Set user in request
        req.user = users[0];
        console.log('Utilisateur standard configuré:', { id: req.user.id, role: req.user.role });
      }
      
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

/**
 * Middleware pour restreindre l'accès aux routes selon le rôle
 * @param {string} role - Le rôle requis pour accéder à la route
 */
export const restrictTo = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Réservé aux utilisateurs avec le rôle ${role}`
      });
    }
    
    next();
  };
};

export default { protect, adminOnly, restrictTo }; 