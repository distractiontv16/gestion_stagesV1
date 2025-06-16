#!/usr/bin/env node

/**
 * Script pour nettoyer les anciens abonnements push avec les anciennes clés VAPID
 */

import db from './src/config/db.js';

async function cleanOldSubscriptions() {
  console.log('🧹 Nettoyage des anciens abonnements push...\n');

  try {
    // Afficher les abonnements actuels
    const { rows: currentSubs } = await db.query(
      'SELECT id, utilisateur_id, endpoint, created_at, is_active FROM push_subscriptions ORDER BY created_at DESC'
    );

    console.log(`📊 Abonnements actuels trouvés: ${currentSubs.length}`);
    
    if (currentSubs.length > 0) {
      console.log('\n📋 Liste des abonnements:');
      currentSubs.forEach((sub, index) => {
        console.log(`${index + 1}. ID: ${sub.id} | Utilisateur: ${sub.utilisateur_id} | Actif: ${sub.is_active}`);
        console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
        console.log(`   Créé: ${sub.created_at}\n`);
      });

      // Supprimer tous les anciens abonnements
      const { rowCount } = await db.query('DELETE FROM push_subscriptions');
      
      console.log(`✅ ${rowCount} abonnements supprimés avec succès`);
      console.log('\n🔄 Les nouveaux abonnements seront créés automatiquement avec les nouvelles clés VAPID');
      
    } else {
      console.log('ℹ️ Aucun abonnement à nettoyer');
    }

    console.log('\n🎯 Instructions pour la suite:');
    console.log('1. Redémarrez les serveurs');
    console.log('2. Reconnectez-vous à l\'application');
    console.log('3. Testez "Test Push" - un nouvel abonnement sera créé automatiquement');
    console.log('4. Les notifications push devraient maintenant fonctionner\n');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await db.closePool();
  }
}

// Exécuter le nettoyage
cleanOldSubscriptions();
