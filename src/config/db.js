import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration de la piscine de connexion PostgreSQL
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_stages',
  port: process.env.DB_PORT || 5432,
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