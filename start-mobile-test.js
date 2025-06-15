import { spawn } from 'child_process';
import os from 'os';

// Fonction pour obtenir l'adresse IP locale
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorer les adresses internes et IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

console.log('🚀 ================================');
console.log('📱 DÉMARRAGE POUR TEST MOBILE');
console.log('🚀 ================================');
console.log(`🌐 IP Locale détectée: ${localIP}`);
console.log(`📲 URL pour mobile: http://${localIP}:3000`);
console.log(`💻 URL pour desktop: http://localhost:3000`);
console.log('🚀 ================================');
console.log('');
console.log('📋 Instructions pour tester sur mobile:');
console.log('1. Connectez votre téléphone au même WiFi');
console.log(`2. Ouvrez le navigateur mobile`);
console.log(`3. Allez sur: http://${localIP}:3000`);
console.log('4. Testez l\'installation PWA');
console.log('5. Testez les notifications push');
console.log('');
console.log('🚀 ================================');

// Démarrer le serveur avec l'IP locale
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '0.0.0.0', // Accepter les connexions de toutes les IPs
    PORT: '3000'
  }
});

// Démarrer Vite pour le frontend
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '0.0.0.0' // Accepter les connexions de toutes les IPs
  }
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt des serveurs...');
  serverProcess.kill('SIGINT');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt des serveurs...');
  serverProcess.kill('SIGTERM');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});

serverProcess.on('error', (error) => {
  console.error('❌ Erreur serveur backend:', error);
});

viteProcess.on('error', (error) => {
  console.error('❌ Erreur serveur frontend:', error);
});

console.log('⏳ Démarrage des serveurs...');
console.log('📱 Prêt pour les tests mobiles dans quelques secondes !');
