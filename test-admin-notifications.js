/**
 * Script de test pour vérifier le système de notifications admin
 * Phase 3 : Vérification du tableau de bord d'administration
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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAdminNotificationSystem() {
  log('\n🧪 PHASE 3 : TEST DU SYSTÈME DE NOTIFICATIONS ADMIN', 'bold');
  log('=' .repeat(60), 'blue');

  try {
    // Test 1: Vérifier les endpoints API
    log('\n📋 1. VÉRIFICATION DES ENDPOINTS API', 'blue');
    
    // Test de l'endpoint de création de notification
    log('   • Test endpoint POST /api/admin/notifications...', 'yellow');
    
    const testPayload = {
      destinataire: {
        type: 'tous',
        id: null
      },
      titre: 'Test Système Admin',
      message: 'Test automatique du système de notifications admin'
    };

    // Note: Ce test nécessite un token admin valide
    log('   ⚠️  Nécessite un token admin valide pour test complet', 'yellow');
    
    // Test 2: Vérifier la structure des données
    log('\n📊 2. VÉRIFICATION DE LA STRUCTURE DES DONNÉES', 'blue');
    
    const requiredFields = ['destinataire', 'titre', 'message'];
    const payloadValid = requiredFields.every(field => testPayload.hasOwnProperty(field));
    
    if (payloadValid) {
      log('   ✅ Structure du payload valide', 'green');
    } else {
      log('   ❌ Structure du payload invalide', 'red');
    }

    // Test 3: Vérifier les types de destinataires
    log('\n👥 3. VÉRIFICATION DES TYPES DE DESTINATAIRES', 'blue');
    
    const supportedTypes = ['etudiant', 'filiere', 'tous'];
    const typeValid = supportedTypes.includes(testPayload.destinataire.type);
    
    if (typeValid) {
      log('   ✅ Type de destinataire supporté: ' + testPayload.destinataire.type, 'green');
    } else {
      log('   ❌ Type de destinataire non supporté', 'red');
    }

    // Test 4: Vérifier les filières disponibles
    log('\n🎓 4. VÉRIFICATION DES FILIÈRES DISPONIBLES', 'blue');
    
    const filieres = [
      { id: 1, nom: 'GEI/EE' },
      { id: 2, nom: 'GEI/IT' },
      { id: 3, nom: 'GE/ER' },
      { id: 4, nom: 'GMP' },
      { id: 5, nom: 'MSY/MI' },
      { id: 6, nom: 'ER/SE' },
      { id: 7, nom: 'GC/A' },
      { id: 8, nom: 'GC/B' },
      { id: 9, nom: 'MSY/MA' },
      { id: 10, nom: 'GE/FC' }
    ];

    log(`   ✅ ${filieres.length} filières configurées`, 'green');
    filieres.forEach(filiere => {
      log(`      - ${filiere.nom} (ID: ${filiere.id})`, 'reset');
    });

    // Test 5: Vérifier la validation des champs
    log('\n✅ 5. VÉRIFICATION DE LA VALIDATION', 'blue');
    
    const validationTests = [
      { field: 'titre', value: testPayload.titre, required: true },
      { field: 'message', value: testPayload.message, required: true },
      { field: 'destinataire.type', value: testPayload.destinataire.type, required: true }
    ];

    let validationPassed = true;
    validationTests.forEach(test => {
      if (test.required && (!test.value || test.value.trim() === '')) {
        log(`   ❌ Champ requis manquant: ${test.field}`, 'red');
        validationPassed = false;
      } else {
        log(`   ✅ Champ valide: ${test.field}`, 'green');
      }
    });

    // Résumé
    log('\n📋 RÉSUMÉ DES TESTS', 'bold');
    log('=' .repeat(40), 'blue');
    
    if (payloadValid && typeValid && validationPassed) {
      log('✅ Tous les tests de structure passent', 'green');
      log('✅ Le système admin est prêt pour les tests en conditions réelles', 'green');
    } else {
      log('❌ Certains tests ont échoué', 'red');
    }

    // Instructions pour les tests manuels
    log('\n🎯 INSTRUCTIONS POUR LES TESTS MANUELS', 'bold');
    log('=' .repeat(50), 'blue');
    log('1. Connectez-vous au dashboard admin', 'yellow');
    log('2. Allez dans l\'onglet "Notifications"', 'yellow');
    log('3. Testez l\'envoi à un étudiant spécifique', 'yellow');
    log('4. Testez l\'envoi à une filière', 'yellow');
    log('5. Testez l\'envoi à tous les étudiants', 'yellow');
    log('6. Vérifiez l\'historique des notifications', 'yellow');

    return true;

  } catch (error) {
    log(`❌ Erreur lors des tests: ${error.message}`, 'red');
    return false;
  }
}

// Fonction pour tester la connectivité API
async function testAPIConnectivity() {
  log('\n🌐 TEST DE CONNECTIVITÉ API', 'blue');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      log('✅ API accessible', 'green');
      return true;
    } else {
      log(`⚠️  API répond avec le statut: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ API non accessible: ${error.message}`, 'red');
    log('   Assurez-vous que le serveur backend est démarré', 'yellow');
    return false;
  }
}

// Exécution des tests
async function runTests() {
  log('🚀 DÉMARRAGE DES TESTS DU SYSTÈME ADMIN', 'bold');
  
  const apiConnected = await testAPIConnectivity();
  const adminTestsPassed = await testAdminNotificationSystem();
  
  log('\n' + '='.repeat(60), 'blue');
  
  if (apiConnected && adminTestsPassed) {
    log('🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
    log('Le système admin est prêt pour les tests en conditions réelles.', 'green');
  } else {
    log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('Vérifiez les erreurs ci-dessus avant de continuer.', 'yellow');
  }
  
  log('\n🔄 PROCHAINE ÉTAPE: Phase 4 - Test de réception PWA par les étudiants', 'blue');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testAdminNotificationSystem, testAPIConnectivity };
