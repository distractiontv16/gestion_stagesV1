#!/usr/bin/env node

/**
 * Script de démarrage pour le développement
 * Teste la connexion DB avant de démarrer le serveur
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';
import pg from 'pg';

// Charger les variables d'environnement
dotenv.config();

const { Pool } = pg;

console.log('🚀 Démarrage du serveur de développement');
console.log('=' .repeat(50));

// Test rapide de la base de données
async function testDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non définie');
    return false;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('🔄 Test de connexion à la base de données...');
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    console.log('✅ Base de données accessible');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    await pool.end();
    return false;
  }
}

// Démarrer le serveur
function startServer() {
  console.log('\n🚀 Démarrage du serveur...');
  
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  server.on('error', (error) => {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Le serveur s'est arrêté avec le code ${code}`);
      process.exit(code);
    }
  });

  // Gestion des signaux pour arrêter proprement
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur...');
    server.kill('SIGTERM');
  });
}

// Fonction principale
async function main() {
  try {
    // Test de la base de données
    const dbOk = await testDatabase();
    
    if (!dbOk) {
      console.error('\n❌ Impossible de se connecter à la base de données');
      console.error('💡 Vérifiez votre fichier .env et votre connexion internet');
      process.exit(1);
    }

    // Démarrer le serveur
    startServer();
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

main();
