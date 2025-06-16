/**
 * Test direct des notifications push - Bypass de l'interface admin
 * Pour identifier la source exacte du problème
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDirectPushNotification() {
  log('\n🧪 TEST DIRECT DES NOTIFICATIONS PUSH', 'bold');
  log('=' .repeat(50), 'blue');
  log('Ce test va envoyer une notification directement à votre téléphone', 'cyan');
  log('pour identifier si le problème vient de l\'interface admin ou du système push.', 'cyan');
  log('');

  try {
    // Test 1: Vérifier la connectivité API
    log('📡 1. TEST DE CONNECTIVITÉ API', 'blue');
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      if (healthResponse.ok) {
        log('   ✅ API accessible', 'green');
      } else {
        log(`   ⚠️  API répond avec le statut: ${healthResponse.status}`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ API non accessible: ${error.message}`, 'red');
      return false;
    }

    // Test 2: Test direct via l'endpoint push/test
    log('\n🔔 2. TEST DIRECT NOTIFICATION PUSH', 'blue');
    log('   Envoi d\'une notification de test directement via l\'API...', 'yellow');

    // Simuler un token admin pour le test
    const testPayload = {
      title: '🧪 TEST DIRECT PUSH',
      message: 'Test direct depuis le script - Si vous recevez ceci, le système push fonctionne !',
      type: 'test_direct',
      priority: 'urgent'
    };

    const pushResponse = await fetch(`${API_BASE_URL}/api/push/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: Ce test nécessite un token valide
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(testPayload)
    });

    if (pushResponse.ok) {
      const pushResult = await pushResponse.json();
      log('   ✅ Réponse API push/test:', 'green');
      log(`      Success: ${pushResult.success}`, 'reset');
      log(`      Message: ${pushResult.message}`, 'reset');
      
      if (pushResult.success) {
        log('   🎉 NOTIFICATION ENVOYÉE VIA API PUSH/TEST !', 'green');
        log('   📱 Vérifiez votre téléphone maintenant...', 'cyan');
      } else {
        log('   ❌ Échec de l\'envoi via API push/test', 'red');
      }
    } else {
      log(`   ❌ Erreur API push/test: ${pushResponse.status}`, 'red');
      const errorText = await pushResponse.text();
      log(`      Détails: ${errorText}`, 'red');
    }

    // Test 3: Test direct via l'endpoint admin/notifications
    log('\n📋 3. TEST DIRECT VIA ENDPOINT ADMIN', 'blue');
    log('   Simulation de l\'envoi admin...', 'yellow');

    const adminPayload = {
      destinataire: {
        type: 'etudiant',
        id: 2  // Votre ID utilisateur (celui qui reçoit les notifications)
      },
      titre: '🎯 TEST ADMIN DIRECT',
      message: 'Test direct via endpoint admin - Comparaison avec interface web'
    };

    const adminResponse = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
      },
      body: JSON.stringify(adminPayload)
    });

    if (adminResponse.ok) {
      const adminResult = await adminResponse.json();
      log('   ✅ Réponse API admin/notifications:', 'green');
      log(`      Success: ${adminResult.success}`, 'reset');
      log(`      Message: ${adminResult.message}`, 'reset');
      
      if (adminResult.success) {
        log('   🎉 NOTIFICATION ENVOYÉE VIA API ADMIN !', 'green');
        log('   📱 Vérifiez votre téléphone maintenant...', 'cyan');
      }
    } else {
      log(`   ❌ Erreur API admin: ${adminResponse.status}`, 'red');
    }

    // Test 4: Vérification des abonnements
    log('\n📊 4. VÉRIFICATION DES ABONNEMENTS', 'blue');
    log('   Vérification des abonnements push actifs...', 'yellow');

    // Ce test nécessiterait l'accès direct à la base de données
    log('   ⚠️  Utilisez: npm run diagnose:push pour voir les abonnements', 'yellow');

    // Résumé
    log('\n📋 RÉSUMÉ DU TEST DIRECT', 'bold');
    log('=' .repeat(40), 'blue');
    log('Si vous avez reçu une notification:', 'cyan');
    log('  ✅ Le système push fonctionne', 'green');
    log('  ❌ Le problème vient de l\'interface admin', 'red');
    log('');
    log('Si vous n\'avez rien reçu:', 'cyan');
    log('  ❌ Le problème est dans le système push lui-même', 'red');
    log('  🔧 Il faut vérifier les abonnements et les clés VAPID', 'yellow');

    return true;

  } catch (error) {
    log(`❌ Erreur lors du test direct: ${error.message}`, 'red');
    return false;
  }
}

// Version simplifiée sans token (pour test local)
async function testLocalPushSimulation() {
  log('\n🔧 TEST LOCAL SIMPLIFIÉ', 'bold');
  log('=' .repeat(30), 'blue');
  
  log('Ce test simule l\'envoi sans authentification', 'cyan');
  log('pour vérifier la logique de base.', 'cyan');
  log('');

  // Simulation des données que l'interface admin envoie
  const simulatedData = {
    destinataire: { type: 'etudiant', id: 2 },
    titre: '🔧 Test Local Simulation',
    message: 'Test de simulation locale du système push'
  };

  log('📋 Données simulées:', 'blue');
  log(JSON.stringify(simulatedData, null, 2), 'reset');
  log('');

  log('🎯 INSTRUCTIONS POUR LE TEST MANUEL:', 'bold');
  log('1. Copiez ces données dans l\'interface admin', 'yellow');
  log('2. Changez le destinataire pour "Étudiant spécifique" avec votre ID', 'yellow');
  log('3. Envoyez la notification', 'yellow');
  log('4. Comparez avec les logs serveur', 'yellow');
  log('');

  log('🔍 LOGS À SURVEILLER:', 'bold');
  log('• "📡 Envoi notifications push à X utilisateurs"', 'cyan');
  log('• "✅ Résultat envoi push: success: true"', 'cyan');
  log('• Erreurs 410 "subscription has unsubscribed or expired"', 'cyan');
  log('');

  return true;
}

// Fonction principale
async function runDirectTests() {
  log('🚀 DÉMARRAGE DES TESTS DIRECTS', 'bold');
  log('Objectif: Identifier la source exacte du problème', 'cyan');
  log('');

  // Test simplifié d'abord
  await testLocalPushSimulation();
  
  log('\n' + '='.repeat(60), 'blue');
  log('🎯 PROCHAINE ÉTAPE:', 'bold');
  log('Testez manuellement avec l\'interface admin en utilisant', 'cyan');
  log('les données simulées ci-dessus et surveillez les logs serveur.', 'cyan');
  log('');
  log('Si vous voulez un test automatisé complet,', 'yellow');
  log('ajoutez votre token d\'authentification dans le script.', 'yellow');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runDirectTests();
}

export { testDirectPushNotification, testLocalPushSimulation };
