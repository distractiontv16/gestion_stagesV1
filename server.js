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
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());

// Port configuration
const PORT = process.env.PORT || 3000;

// Import routes dynamically
const setupRoutes = async () => {
  try {
    // Routes for auth
    const authRoutes = await import('./src/routes/auth.js');
    app.use('/api/auth', authRoutes.default);
    
    // Import the auth middleware
    const authMiddleware = await import('./src/middleware/auth.js');
    
    // Example of protected routes
    const testProtectedRoute = express.Router();
    testProtectedRoute.get('/test', authMiddleware.protect, (req, res) => {
      res.json({ success: true, message: 'Route protégée accessible', user: req.user });
    });
    
    app.use('/api', testProtectedRoute);
    
    console.log('Routes loaded successfully');
  } catch (error) {
    console.error('Error loading routes:', error);
  }
  
  // Error handling middleware
  app.use((err, req, res) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
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