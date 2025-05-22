import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function stopRunningServers() {
  console.log('Arrêt des serveurs existants...');
  
  const findCommand = process.platform === 'win32'
    ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV'
    : 'ps aux | grep node';
  
  try {
    const findProcess = spawn(process.platform === 'win32' ? 'cmd' : 'bash', 
      process.platform === 'win32' ? ['/c', findCommand] : ['-c', findCommand]);
    
    let output = '';
    
    findProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    await new Promise(resolve => {
      findProcess.on('close', (code) => {
        console.log(`Recherche des processus terminée avec le code ${code}`);
        resolve();
      });
    });
    
    // Sur Windows, essayer de terminer les processus server.js
    if (process.platform === 'win32') {
      const killProcess = spawn('taskkill', ['/F', '/FI', 'WINDOWTITLE eq *server.js*']);
      
      await new Promise(resolve => {
        killProcess.on('close', (code) => {
          console.log(`Tentative d'arrêt des serveurs terminée avec le code ${code}`);
          resolve();
        });
      });
    } else {
      // Sur Linux/Mac, on cherche les PID et on les termine
      const lines = output.split('\n').filter(line => line.includes('server.js'));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 1) {
          const pid = parts[1];
          console.log(`Tentative d'arrêt du processus ${pid}`);
          
          try {
            process.kill(parseInt(pid), 'SIGTERM');
          } catch (error) {
            console.error(`Erreur lors de l'arrêt du processus ${pid}:`, error);
          }
        }
      }
    }
    
    console.log('Attente de 2 secondes pour s\'assurer que les processus sont terminés...');
    await setTimeout(2000);
    
  } catch (error) {
    console.error('Erreur lors de l\'arrêt des serveurs:', error);
  }
}

async function startServer() {
  console.log('Démarrage du serveur...');
  
  const serverProcess = spawn('npm', ['run', 'server'], {
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('error', (error) => {
    console.error('Erreur lors du démarrage du serveur:', error);
  });
  
  console.log('Serveur démarré en arrière-plan.');
}

// Fonction principale
async function main() {
  try {
    await stopRunningServers();
    await startServer();
    console.log('Redémarrage du serveur terminé avec succès.');
  } catch (error) {
    console.error('Erreur lors du redémarrage du serveur:', error);
  }
}

// Exécution
main(); 