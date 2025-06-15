#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections PWA
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Test des corrections PWA INSTI...\n');

// Fonction pour démarrer un processus
function startProcess(command, args, name, color = '\x1b[36m') {
  const process = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname
  });

  process.stdout.on('data', (data) => {
    console.log(`${color}[${name}]\x1b[0m ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`${color}[${name} ERROR]\x1b[0m ${data.toString().trim()}`);
  });

  return process;
}

// Démarrer le serveur backend
console.log('📡 Démarrage du serveur backend...');
const backendProcess = startProcess('node', ['server.js'], 'BACKEND', '\x1b[33m');

// Attendre un peu avant de démarrer le frontend
setTimeout(() => {
  console.log('⚛️ Démarrage du serveur frontend...');
  const frontendProcess = startProcess('npm', ['run', 'dev'], 'FRONTEND', '\x1b[36m');
  
  // Attendre encore un peu avant de démarrer ngrok
  setTimeout(() => {
    console.log('🌐 Démarrage de ngrok avec HTTPS...');
    const ngrokProcess = startProcess(
      'ngrok', 
      ['http', '--url=robin-saving-instantly.ngrok-free.app', '5173'], 
      'NGROK', 
      '\x1b[32m'
    );

    // Instructions pour l'utilisateur
    setTimeout(() => {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CORRECTIONS PWA APPLIQUÉES - TESTS À EFFECTUER');
      console.log('='.repeat(80));
      console.log('🔗 URL de test: https://robin-saving-instantly.ngrok-free.app');
      console.log('');
      console.log('✅ CORRECTIONS EFFECTUÉES:');
      console.log('   1. ✅ Nouvelles clés VAPID valides générées');
      console.log('   2. ✅ Configuration Vite PWA corrigée (injectManifest)');
      console.log('   3. ✅ Endpoints service worker corrigés (/api/push/)');
      console.log('   4. ✅ Clé VAPID frontend configurée (VITE_VAPID_PUBLIC_KEY)');
      console.log('   5. ✅ Composant de test de notifications amélioré');
      console.log('');
      console.log('🧪 TESTS À EFFECTUER:');
      console.log('   1. Connectez-vous en tant qu\'étudiant');
      console.log('   2. Allez dans l\'onglet "Test PWA" (mode développement)');
      console.log('   3. Cliquez sur "Test Complet" pour vérifier:');
      console.log('      - Support PWA ✅');
      console.log('      - Permissions notifications ✅');
      console.log('      - Abonnement push ✅');
      console.log('      - Envoi notification test ✅');
      console.log('');
      console.log('📱 VÉRIFICATIONS ICÔNES:');
      console.log('   1. Vérifiez que l\'icône INSTI apparaît (pas Vite)');
      console.log('   2. Testez l\'installation PWA sur mobile');
      console.log('   3. Vérifiez les notifications push sur l\'appareil');
      console.log('');
      console.log('🔍 DÉBOGAGE:');
      console.log('   - Console navigateur: Logs détaillés du service worker');
      console.log('   - Console serveur: Logs des notifications push');
      console.log('   - Onglet Application > Service Workers dans DevTools');
      console.log('');
      console.log('❌ SI PROBLÈMES PERSISTENT:');
      console.log('   1. Effacez le cache navigateur (Ctrl+Shift+R)');
      console.log('   2. Désinstallez et réinstallez la PWA');
      console.log('   3. Vérifiez les logs serveur pour les erreurs VAPID');
      console.log('='.repeat(80) + '\n');
    }, 3000);

  }, 2000);
}, 2000);

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt des processus...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt des processus...');
  process.exit(0);
});
