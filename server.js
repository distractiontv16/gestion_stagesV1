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
    console.log('[Serverless Function] Starting setupRoutes...');
    
    // Routes for auth
    console.log('[Serverless Function] Attempting to import authRoutes from ./src/routes/auth.js...');
    const authRoutesModule = await import('./src/routes/auth.js');
    console.log('[Serverless Function] authRoutesModule imported. Type:', typeof authRoutesModule, 'Content:', authRoutesModule);
    
    if (authRoutesModule && authRoutesModule.default && typeof authRoutesModule.default === 'function') {
      console.log('[Serverless Function] authRoutesModule.default is a function (router). Attempting to use it for /api/auth');
      app.use('/api/auth', authRoutesModule.default);
      console.log('[Serverless Function] /api/auth routes configured.');
    } else {
      console.error('[Serverless Function] ERROR: authRoutesModule.default is not available or not a function. Type of default:', typeof authRoutesModule?.default);
    }
    
    // Routes for internships
    console.log('[Serverless Function] Attempting to import internshipsRoutes from ./src/routes/internships.js...');
    const internshipsRoutesModule = await import('./src/routes/internships.js');
    console.log('[Serverless Function] internshipsRoutesModule imported. Type:', typeof internshipsRoutesModule, 'Content:', internshipsRoutesModule);

    if (internshipsRoutesModule && internshipsRoutesModule.default && typeof internshipsRoutesModule.default === 'function') {
      console.log('[Serverless Function] internshipsRoutesModule.default is a function (router). Attempting to use it for /api/internships');
      app.use('/api/internships', internshipsRoutesModule.default);
      console.log('[Serverless Function] /api/internships routes configured.');
    } else {
      console.error('[Serverless Function] ERROR: internshipsRoutesModule.default is not available or not a function. Type of default:', typeof internshipsRoutesModule?.default);
    }
    
    // Routes for admin
    console.log('[Serverless Function] Attempting to import adminRoutes from ./src/routes/admin.js...');
    const adminRoutesModule = await import('./src/routes/admin.js');
    console.log('[Serverless Function] adminRoutesModule imported. Type:', typeof adminRoutesModule, 'Content:', adminRoutesModule);
    
    if (adminRoutesModule && adminRoutesModule.default && typeof adminRoutesModule.default === 'function') {
      console.log('[Serverless Function] adminRoutesModule.default is a function (router). Attempting to use it for /api/admin');
      app.use('/api/admin', adminRoutesModule.default);
      console.log('[Serverless Function] /api/admin routes configured.');
    } else {
      console.error('[Serverless Function] ERROR: adminRoutesModule.default is not available or not a function. Type of default:', typeof adminRoutesModule?.default);
    }
    
    // Routes for public projects and propositions
    console.log('[Serverless Function] Attempting to import projetsPublicsRoutes from ./src/routes/projetsPublics.js...');
    const projetsPublicsRoutesModule = await import('./src/routes/projetsPublics.js');
    console.log('[Serverless Function] projetsPublicsRoutesModule imported. Type:', typeof projetsPublicsRoutesModule, 'Content:', projetsPublicsRoutesModule);

    if (projetsPublicsRoutesModule && projetsPublicsRoutesModule.default && typeof projetsPublicsRoutesModule.default === 'function') {
      console.log('[Serverless Function] projetsPublicsRoutesModule.default is a function (router). Attempting to use it for /api');
      app.use('/api', projetsPublicsRoutesModule.default); // Note: this is a broad path, ensure order if other /api paths exist
      console.log('[Serverless Function] /api (projetsPublics) routes configured.');
    } else {
      console.error('[Serverless Function] ERROR: projetsPublicsRoutesModule.default is not available or not a function. Type of default:', typeof projetsPublicsRoutesModule?.default);
    }

    // Routes for notifications
    console.log('[Serverless Function] Attempting to import notificationsRoutes from ./src/routes/notifications.js...');
    const notificationsRoutesModule = await import('./src/routes/notifications.js');
    console.log('[Serverless Function] notificationsRoutesModule imported. Type:', typeof notificationsRoutesModule, 'Content:', notificationsRoutesModule);

    if (notificationsRoutesModule && notificationsRoutesModule.default && typeof notificationsRoutesModule.default === 'function') {
      console.log('[Serverless Function] notificationsRoutesModule.default is a function (router). Attempting to use it for /api/notifications');
      app.use('/api/notifications', notificationsRoutesModule.default);
      console.log('[Serverless Function] /api/notifications routes configured.');
    } else {
      console.error('[Serverless Function] ERROR: notificationsRoutesModule.default is not available or not a function. Type of default:', typeof notificationsRoutesModule?.default);
    }
    
    // Import the auth middleware (Note: this import is not used for app.use, was it for the testProtectedRoute only?)
    console.log('[Serverless Function] Attempting to import authMiddleware from ./src/middleware/auth.js...');
    const authMiddlewareModule = await import('./src/middleware/auth.js');
    console.log('[Serverless Function] authMiddlewareModule imported. Type:', typeof authMiddlewareModule, 'Content:', authMiddlewareModule);
    
    // Example of protected routes
    if (authMiddlewareModule && authMiddlewareModule.protect) {
      console.log('[Serverless Function] authMiddlewareModule.protect is available. Configuring testProtectedRoute.');
      const testProtectedRoute = express.Router();
      testProtectedRoute.get('/test', authMiddlewareModule.protect, (req, res) => {
        res.json({ success: true, message: 'Route protégée accessible', user: req.user });
      });
      app.use('/api', testProtectedRoute); // Note: Also a broad path, consider specificity or order
      console.log('[Serverless Function] /api/test route configured.');
    } else {
      console.error('[Serverless Function] ERROR: authMiddlewareModule.protect is not available!');
    }
    
    console.log('[Serverless Function] All routes configuration attempts finished.');
    
    // List all registered routes
    listRoutes();
  } catch (error) {
    console.error('[Serverless Function] CRITICAL ERROR in setupRoutes:', error);
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