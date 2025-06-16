#!/usr/bin/env node

/**
 * Script pour tester la PWA avec ngrok en HTTPS
 * Usage: npm run start:pwa
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Démarrage du test PWA avec ngrok HTTPS...\n');

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

  process.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m Processus terminé avec le code ${code}`);
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
      console.log('\n' + '='.repeat(60));
      console.log('🎓 INSTRUCTIONS POUR TESTER LA PWA');
      console.log('='.repeat(60));
      console.log('1. Ouvrez votre navigateur sur: https://robin-saving-instantly.ngrok-free.app');
      console.log('2. Acceptez l\'avertissement de sécurité ngrok');
      console.log('3. Connectez-vous en tant qu\'étudiant');
      console.log('4. Vérifiez que le prompt PWA apparaît');
      console.log('5. Installez la PWA et testez les notifications');
      console.log('\n📱 Pour tester sur mobile:');
      console.log('   - Ouvrez le même lien sur votre téléphone');
      console.log('   - Brave/Chrome: Menu > "Ajouter à l\'écran d\'accueil"');
      console.log('\n🔍 Debug PWA dans la console:');
      console.log('   - Tapez: window.pwaSupport');
      console.log('   - Vérifiez les logs du Service Worker');
      console.log('='.repeat(60) + '\n');
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
