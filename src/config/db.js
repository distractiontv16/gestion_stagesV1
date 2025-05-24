import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Récupération de l'URL de la base de données depuis les variables d'environnement
const connectionString = process.env.DATABASE_URL;

// Configuration de la piscine de connexion PostgreSQL
const pool = new pg.Pool({
  connectionString: connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false, // Nécessaire pour Neon et autres DBaaS qui utilisent SSL
  max: 10, // Nombre maximum de connexions
  idleTimeoutMillis: 30000 // Délai avant de fermer une connexion inactive
});

// Test de la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Connexion PostgreSQL réussie');
  } catch (err) {
    console.error('Erreur de connexion à PostgreSQL:', err);
    process.exit(1);
  }
};

// Exécuter le test
testConnection();

// Helper pour exécuter les requêtes plus facilement
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

console.log('[db.js] Type de pool:', typeof pool, pool instanceof pg.Pool);
console.log('[db.js] Type de query exportée:', typeof query);

// Exporter pool et query
export default {
  pool,
  query
}; 