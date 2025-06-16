#!/usr/bin/env node

/**
 * Script de test de connexion à la base de données Neon
 * Usage: node test-db-connection.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

// Charger les variables d'environnement
dotenv.config();

const { Pool } = pg;

console.log('🚀 Test de connexion à la base de données Neon');
console.log('=' .repeat(50));

// Vérifier les variables d'environnement
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas définie dans le fichier .env');
  process.exit(1);
}

console.log('✅ DATABASE_URL trouvée');
console.log(`🔗 Host: ${process.env.DATABASE_URL.match(/@([^:]+)/)?.[1] || 'Non trouvé'}`);

// Configuration du pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // Une seule connexion pour le test
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  let client;
  
  try {
    console.log('\n🔄 Tentative de connexion...');
    
    // Test de connexion
    client = await pool.connect();
    console.log('✅ Connexion établie avec succès !');
    
    // Test de requête basique
    console.log('\n🔍 Test de requête basique...');
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Requête exécutée avec succès !');
    console.log(`📅 Heure serveur: ${result.rows[0].current_time}`);
    console.log(`🗄️  Version: ${result.rows[0].version.split(' ')[0]}`);
    
    // Test du schéma
    console.log('\n📂 Test du schéma...');
    const schemaResult = await client.query('SELECT current_schema() as schema');
    console.log(`✅ Schéma actuel: ${schemaResult.rows[0].schema}`);
    
    // Test des tables (optionnel)
    console.log('\n📋 Vérification des tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tables trouvées:');
      tablesResult.rows.forEach(row => {
        console.log(`   📄 ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Aucune table trouvée dans le schéma public');
    }
    
    console.log('\n🎉 Test de connexion terminé avec succès !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test de connexion:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('   💡 Vérifiez votre connexion internet et l\'URL de la base de données');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Le serveur de base de données refuse la connexion');
    } else if (error.message.includes('password')) {
      console.error('   💡 Vérifiez vos identifiants de connexion');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Gestion des signaux pour fermer proprement
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du test...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du test...');
  await pool.end();
  process.exit(0);
});

// Lancer le test
testConnection();
