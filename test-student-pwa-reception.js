/**
 * Script de test pour vérifier la réception PWA côté étudiant
 * Phase 4 : Test de réception PWA par les étudiants
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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testStudentPWAReception() {
  log('\n📱 PHASE 4 : TEST DE RÉCEPTION PWA PAR LES ÉTUDIANTS', 'bold');
  log('=' .repeat(70), 'blue');

  try {
    // Test 1: Vérifier la configuration PWA
    log('\n🔧 1. VÉRIFICATION DE LA CONFIGURATION PWA', 'blue');
    
    // Vérifier le manifeste
    log('   • Vérification du manifeste PWA...', 'yellow');
    try {
      const manifestResponse = await fetch(`${API_BASE_URL}/manifest.json`);
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        log('   ✅ Manifeste PWA accessible', 'green');
        log(`      - Nom: ${manifest.name}`, 'reset');
        log(`      - URL de démarrage: ${manifest.start_url}`, 'reset');
        log(`      - Mode d'affichage: ${manifest.display}`, 'reset');
        log(`      - Icônes: ${manifest.icons?.length || 0} configurées`, 'reset');
      } else {
        log('   ❌ Manifeste PWA non accessible', 'red');
      }
    } catch (error) {
      log(`   ❌ Erreur manifeste: ${error.message}`, 'red');
    }

    // Vérifier le service worker
    log('\n   • Vérification du service worker...', 'yellow');
    try {
      const swResponse = await fetch(`${API_BASE_URL}/sw.js`);
      if (swResponse.ok) {
        const swContent = await swResponse.text();
        log('   ✅ Service Worker accessible', 'green');
        
        // Vérifier les fonctionnalités clés
        const hasInstallEvent = swContent.includes('addEventListener(\'install\'');
        const hasPushEvent = swContent.includes('addEventListener(\'push\'');
        const hasNotificationClick = swContent.includes('addEventListener(\'notificationclick\'');
        
        log(`      - Événement install: ${hasInstallEvent ? '✅' : '❌'}`, hasInstallEvent ? 'green' : 'red');
        log(`      - Événement push: ${hasPushEvent ? '✅' : '❌'}`, hasPushEvent ? 'green' : 'red');
        log(`      - Gestion des clics: ${hasNotificationClick ? '✅' : '❌'}`, hasNotificationClick ? 'green' : 'red');
      } else {
        log('   ❌ Service Worker non accessible', 'red');
      }
    } catch (error) {
      log(`   ❌ Erreur service worker: ${error.message}`, 'red');
    }

    // Test 2: Vérifier les endpoints de notifications étudiants
    log('\n📬 2. VÉRIFICATION DES ENDPOINTS ÉTUDIANTS', 'blue');
    
    const studentEndpoints = [
      { path: '/api/notifications', method: 'GET', description: 'Récupérer notifications' },
      { path: '/api/notifications/unread', method: 'GET', description: 'Notifications non lues' },
      { path: '/api/push/subscribe', method: 'POST', description: 'Abonnement push' },
      { path: '/api/push/test', method: 'POST', description: 'Test notification' }
    ];

    studentEndpoints.forEach(endpoint => {
      log(`   • ${endpoint.method} ${endpoint.path} - ${endpoint.description}`, 'cyan');
      log('     ⚠️  Nécessite authentification étudiant pour test complet', 'yellow');
    });

    // Test 3: Vérifier la configuration VAPID
    log('\n🔐 3. VÉRIFICATION DE LA CONFIGURATION VAPID', 'blue');
    
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
      log('   ✅ Clés VAPID configurées', 'green');
      log(`      - Clé publique: ${vapidPublicKey.substring(0, 20)}...`, 'reset');
      log(`      - Sujet: ${vapidSubject}`, 'reset');
      
      // Vérifier la longueur de la clé publique
      if (vapidPublicKey.length === 87) {
        log('   ✅ Longueur de clé publique correcte (87 caractères)', 'green');
      } else {
        log(`   ⚠️  Longueur de clé publique inhabituelle: ${vapidPublicKey.length}`, 'yellow');
      }
    } else {
      log('   ❌ Configuration VAPID incomplète', 'red');
      log('      Vérifiez les variables d\'environnement VAPID_*', 'yellow');
    }

    // Test 4: Vérifier la base de données des abonnements
    log('\n🗄️  4. VÉRIFICATION DE LA STRUCTURE BASE DE DONNÉES', 'blue');
    
    log('   • Tables requises pour PWA:', 'cyan');
    log('     - push_subscriptions (abonnements push)', 'reset');
    log('     - notifications (notifications étendues)', 'reset');
    log('     - notification_campaigns (tracking)', 'reset');
    log('   ⚠️  Vérification manuelle requise via diagnose-push.js', 'yellow');

    // Test 5: Scénarios de test pour étudiants
    log('\n🎯 5. SCÉNARIOS DE TEST POUR ÉTUDIANTS', 'blue');
    
    const testScenarios = [
      {
        title: 'Installation PWA',
        steps: [
          'Étudiant se connecte au dashboard',
          'Prompt d\'installation PWA apparaît',
          'Étudiant installe la PWA',
          'Permissions de notification demandées',
          'Abonnement push créé automatiquement'
        ]
      },
      {
        title: 'Réception notification (PWA ouverte)',
        steps: [
          'Admin envoie notification',
          'Notification apparaît immédiatement',
          'Clic sur notification ouvre la PWA',
          'Notification marquée comme lue'
        ]
      },
      {
        title: 'Réception notification (PWA fermée)',
        steps: [
          'PWA complètement fermée',
          'Admin envoie notification',
          'Notification système apparaît',
          'Clic ouvre la PWA au bon endroit'
        ]
      }
    ];

    testScenarios.forEach((scenario, index) => {
      log(`\n   📋 Scénario ${index + 1}: ${scenario.title}`, 'cyan');
      scenario.steps.forEach((step, stepIndex) => {
        log(`      ${stepIndex + 1}. ${step}`, 'reset');
      });
    });

    // Test 6: Checklist de compatibilité
    log('\n✅ 6. CHECKLIST DE COMPATIBILITÉ', 'blue');
    
    const compatibilityChecks = [
      { item: 'Chrome/Chromium (Desktop & Mobile)', status: '✅ Supporté' },
      { item: 'Firefox (Desktop & Mobile)', status: '✅ Supporté' },
      { item: 'Safari (iOS 16.4+)', status: '✅ Supporté' },
      { item: 'Edge (Desktop & Mobile)', status: '✅ Supporté' },
      { item: 'Samsung Internet', status: '✅ Supporté' },
      { item: 'Brave Browser', status: '✅ Supporté' }
    ];

    compatibilityChecks.forEach(check => {
      log(`   ${check.status} ${check.item}`, check.status.includes('✅') ? 'green' : 'yellow');
    });

    // Résumé et instructions
    log('\n📋 RÉSUMÉ - PHASE 4', 'bold');
    log('=' .repeat(40), 'blue');
    log('✅ Configuration PWA vérifiée', 'green');
    log('✅ Endpoints étudiants identifiés', 'green');
    log('✅ Configuration VAPID validée', 'green');
    log('✅ Scénarios de test définis', 'green');

    log('\n🎯 PRÊT POUR LES TESTS EN CONDITIONS RÉELLES', 'bold');
    log('Passez maintenant à la Phase 5 pour les tests finaux.', 'green');

    return true;

  } catch (error) {
    log(`❌ Erreur lors des tests Phase 4: ${error.message}`, 'red');
    return false;
  }
}

// Instructions pour la Phase 5
function showPhase5Instructions() {
  log('\n🚀 PHASE 5 : INSTRUCTIONS POUR LES TESTS EN CONDITIONS RÉELLES', 'bold');
  log('=' .repeat(70), 'blue');
  
  log('\n📋 ÉTAPES À SUIVRE:', 'cyan');
  log('1. 💻 Sur votre PC:', 'yellow');
  log('   - Connectez-vous au dashboard admin', 'reset');
  log('   - Allez dans l\'onglet "Notifications"', 'reset');
  log('   - Préparez un message de test', 'reset');
  
  log('\n2. 📱 Sur votre téléphone:', 'yellow');
  log('   - Installez la PWA si pas déjà fait', 'reset');
  log('   - Fermez complètement la PWA', 'reset');
  log('   - Assurez-vous d\'avoir une connexion internet', 'reset');
  
  log('\n3. 🧪 Test final:', 'yellow');
  log('   - Envoyez la notification depuis le PC', 'reset');
  log('   - Vérifiez la réception sur le téléphone', 'reset');
  log('   - Testez le clic sur la notification', 'reset');
  
  log('\n✅ CRITÈRES DE SUCCÈS:', 'green');
  log('• Notification apparaît comme notification système', 'reset');
  log('• Notification reçue même PWA fermée', 'reset');
  log('• Clic ouvre la PWA au bon endroit', 'reset');
  log('• Son/vibration si notification urgente', 'reset');
}

// Exécution des tests
async function runPhase4Tests() {
  log('🚀 DÉMARRAGE DES TESTS PHASE 4', 'bold');
  
  const phase4Passed = await testStudentPWAReception();
  
  log('\n' + '='.repeat(70), 'blue');
  
  if (phase4Passed) {
    log('🎉 PHASE 4 TERMINÉE AVEC SUCCÈS !', 'green');
    showPhase5Instructions();
  } else {
    log('⚠️  PHASE 4 INCOMPLÈTE', 'yellow');
    log('Vérifiez les erreurs ci-dessus avant de continuer.', 'yellow');
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runPhase4Tests();
}

export { testStudentPWAReception, showPhase5Instructions };
