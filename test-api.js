#!/usr/bin/env node

/**
 * Script de test des APIs
 * Usage: node test-api.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Test des APIs du serveur');
console.log('=' .repeat(40));

// Test de base du serveur
async function testServer() {
  try {
    console.log('🔄 Test de base du serveur...');
    const response = await fetch(BASE_URL);
    
    if (response.ok) {
      console.log('✅ Serveur accessible');
      console.log(`📊 Status: ${response.status}`);
    } else {
      console.log(`⚠️  Serveur répond avec status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message);
    return false;
  }
  return true;
}

// Test d'une route API
async function testAPI(endpoint, description) {
  try {
    console.log(`\n🔄 Test: ${description}`);
    console.log(`🔗 URL: ${BASE_URL}${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
    
    if (response.ok) {
      console.log('✅ Route accessible');
    } else {
      console.log('⚠️  Route retourne une erreur');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Fonction principale
async function main() {
  const serverOk = await testServer();
  
  if (!serverOk) {
    console.error('\n❌ Serveur non accessible. Assurez-vous qu\'il est démarré avec:');
    console.error('   npm run server:dev');
    process.exit(1);
  }

  // Tests des routes principales
  await testAPI('/api/auth', 'Route d\'authentification');
  await testAPI('/api/internships', 'Route des stages');
  await testAPI('/api/admin', 'Route d\'administration');
  await testAPI('/api/notifications', 'Route des notifications');
  
  console.log('\n🎉 Tests terminés !');
}

main().catch(console.error);
