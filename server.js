import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();

// Configuration CORS plus détaillée
const corsOptions = {
  origin: '*',  // Permet toutes les origines en développement
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware pour gérer les erreurs de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Erreur de parsing JSON:', err);
    return res.status(400).json({ 
      success: false, 
      message: 'JSON invalide' 
    });
  }
  next(err);
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Fonction pour lister toutes les routes enregistrées
const listRoutes = () => {
  console.log('\n=== ROUTES ENREGISTRÉES ===');
  app._router?.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly
      console.log(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          console.log(`${method} ${middleware.regexp} + ${handler.route.path}`);
        }
      });
    }
  });
  console.log('=========================\n');
};

// Import routes dynamically
const setupRoutes = async () => {
  try {
    console.log('Chargement des routes...');
    
    // Routes for auth
    console.log('Chargement des routes auth...');
    const authRoutes = await import('./src/routes/auth.js');
    app.use('/api/auth', authRoutes.default);
    console.log('Routes auth chargées avec succès');
    
    // Routes for internships
    console.log('Chargement des routes internships...');
    const internshipsRoutes = await import('./src/routes/internships.js');
    app.use('/api/internships', internshipsRoutes.default);
    console.log('Routes internships chargées avec succès');
    
    // Routes for admin
    console.log('Chargement des routes admin...');
    const adminRoutes = await import('./src/routes/admin.js');
    console.log('Type de adminRoutes:', typeof adminRoutes);
    console.log('Type de adminRoutes.default:', typeof adminRoutes.default);
    
    if (adminRoutes.default && typeof adminRoutes.default === 'function') {
      app.use('/api/admin', adminRoutes.default);
      console.log('Routes admin chargées avec succès');
    } else {
      console.error('Erreur: adminRoutes.default n\'est pas un routeur valide');
    }
    
    // Routes for public projects and propositions
    console.log('Chargement des routes projetsPublics...');
    const projetsPublicsRoutes = await import('./src/routes/projetsPublics.js');
    app.use('/api', projetsPublicsRoutes.default);
    console.log('Routes projetsPublics chargées avec succès');

    // Routes for notifications
    console.log('Chargement des routes notifications...');
    const notificationsRoutes = await import('./src/routes/notifications.js');
    app.use('/api/notifications', notificationsRoutes.default);
    console.log('Routes notifications chargées avec succès');
    
    // Import the auth middleware
    console.log('Chargement du middleware auth...');
    const authMiddleware = await import('./src/middleware/auth.js');
    
    // Example of protected routes
    const testProtectedRoute = express.Router();
    testProtectedRoute.get('/test', authMiddleware.protect, (req, res) => {
      res.json({ success: true, message: 'Route protégée accessible', user: req.user });
    });
    
    app.use('/api', testProtectedRoute);
    
    console.log('Routes loaded successfully');
    
    // List all registered routes
    listRoutes();
  } catch (error) {
    console.error('Error loading routes:', error);
  }
  
  // Servir les fichiers statiques du frontend React (après le build)
  // Assurez-vous que __dirname est correctement défini si vous utilisez ES Modules
  // import path from 'path';
  // import { fileURLToPath } from 'url';
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);
  
  if (process.env.NODE_ENV === 'production') { 
    app.use(express.static(path.join(__dirname, 'dist')));
  
    app.get('/*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: err.message || 'Erreur inconnue'
    });
  });
  
  // 404 handler
  app.use((req, res, next) => { // eslint-disable-line no-unused-vars
    console.log(`Route non trouvée: ${req.method} ${req.url}`);
    return res.status(404).json({
      success: false,
      message: 'Route non trouvée'
    });
  });
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Set up routes and start server
setupRoutes();

export default app; 