#!/usr/bin/env node

/**
 * Script pour redémarrer proprement les serveurs après les corrections PWA
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Redémarrage des serveurs avec corrections PWA...\n');

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
      console.log('🎯 SERVEURS REDÉMARRÉS AVEC CORRECTIONS PWA');
      console.log('='.repeat(80));
      console.log('🔗 URL de test: https://robin-saving-instantly.ngrok-free.app');
      console.log('');
      console.log('🔧 CORRECTIONS APPLIQUÉES:');
      console.log('   ✅ Nouvelles clés VAPID valides (courbe P-256)');
      console.log('   ✅ Service worker corrigé (endpoints /api/push/)');
      console.log('   ✅ Configuration Vite PWA avec injectManifest');
      console.log('   ✅ Détection PWA améliorée');
      console.log('   ✅ Tests de notifications avec debug détaillé');
      console.log('   ✅ Test de notification locale ajouté');
      console.log('');
      console.log('🧪 NOUVEAUX TESTS DISPONIBLES:');
      console.log('   1. "Test Local" - Notification locale directe');
      console.log('   2. "Test Push" - Notification via serveur (amélioré)');
      console.log('   3. Debug détaillé pour chaque étape');
      console.log('');
      console.log('📱 ÉTAPES DE TEST:');
      console.log('   1. Ouvrez https://robin-saving-instantly.ngrok-free.app');
      console.log('   2. Connectez-vous en tant qu\'étudiant');
      console.log('   3. Allez dans "Test PWA"');
      console.log('   4. Testez d\'abord "Test Local" (doit fonctionner)');
      console.log('   5. Puis "Test Push" (vérifiez les logs debug)');
      console.log('   6. Enfin "Test Complet" pour tout valider');
      console.log('');
      console.log('🔍 SI PROBLÈMES:');
      console.log('   - Effacez cache navigateur (Ctrl+Shift+R)');
      console.log('   - Vérifiez console navigateur pour erreurs');
      console.log('   - Vérifiez logs serveur ci-dessus');
      console.log('   - Désinstallez/réinstallez PWA si nécessaire');
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
