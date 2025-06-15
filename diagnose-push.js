#!/usr/bin/env node

/**
 * Script de diagnostic complet pour les notifications push
 */

import db from './src/config/db.js';
import webpush from 'web-push';

async function diagnosePushSystem() {
  console.log('🔍 DIAGNOSTIC COMPLET DU SYSTÈME PUSH\n');

  try {
    // 1. Vérifier les variables d'environnement
    console.log('📋 1. VARIABLES D\'ENVIRONNEMENT:');
    console.log(`VAPID_PUBLIC_KEY: ${process.env.VAPID_PUBLIC_KEY ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`VAPID_PRIVATE_KEY: ${process.env.VAPID_PRIVATE_KEY ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`VAPID_SUBJECT: ${process.env.VAPID_SUBJECT || '❌ Manquante'}`);
    
    if (process.env.VAPID_PUBLIC_KEY) {
      console.log(`Clé publique: ${process.env.VAPID_PUBLIC_KEY.substring(0, 20)}...`);
    }

    // 2. Tester la configuration VAPID
    console.log('\n🔑 2. TEST CONFIGURATION VAPID:');
    try {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@insti.edu',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      console.log('✅ Configuration VAPID valide');
    } catch (vapidError) {
      console.log(`❌ Erreur VAPID: ${vapidError.message}`);
    }

    // 3. Vérifier les abonnements en base
    console.log('\n📊 3. ABONNEMENTS EN BASE DE DONNÉES:');
    const { rows: subscriptions } = await db.query(`
      SELECT 
        id, 
        utilisateur_id, 
        endpoint, 
        created_at, 
        updated_at, 
        is_active,
        SUBSTRING(p256dh_key, 1, 20) as p256dh_preview,
        SUBSTRING(auth_key, 1, 20) as auth_preview
      FROM push_subscriptions 
      ORDER BY created_at DESC
    `);

    console.log(`Nombre d'abonnements: ${subscriptions.length}`);
    
    if (subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`\n${index + 1}. Abonnement ID: ${sub.id}`);
        console.log(`   Utilisateur: ${sub.utilisateur_id}`);
        console.log(`   Actif: ${sub.is_active ? '✅' : '❌'}`);
        console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
        console.log(`   Créé: ${sub.created_at}`);
        console.log(`   Mis à jour: ${sub.updated_at}`);
        console.log(`   P256DH: ${sub.p256dh_preview}...`);
        console.log(`   Auth: ${sub.auth_preview}...`);
      });
    }

    // 4. Recommandations
    console.log('\n💡 4. RECOMMANDATIONS:');
    
    if (subscriptions.length === 0) {
      console.log('✅ Aucun abonnement - Parfait pour un nouveau test');
    } else if (subscriptions.length === 1) {
      console.log('⚠️ 1 abonnement trouvé - Si erreur VAPID, supprimez-le');
      console.log('   Commande: npm run clean:push');
    } else {
      console.log(`⚠️ ${subscriptions.length} abonnements trouvés - Nettoyage recommandé`);
      console.log('   Commande: npm run clean:push');
    }

    // 5. Test de clé VAPID
    console.log('\n🧪 5. TEST CLÉS VAPID:');
    if (process.env.VAPID_PUBLIC_KEY) {
      const publicKey = process.env.VAPID_PUBLIC_KEY;
      
      // Vérifier la longueur (doit être 87 caractères pour P-256)
      if (publicKey.length === 87) {
        console.log('✅ Longueur clé publique correcte (87 caractères)');
      } else {
        console.log(`❌ Longueur clé publique incorrecte: ${publicKey.length} (attendu: 87)`);
      }
      
      // Vérifier qu'elle commence par 'B' (format non compressé P-256)
      if (publicKey.startsWith('B')) {
        console.log('✅ Format clé publique correct (commence par B)');
      } else {
        console.log(`❌ Format clé publique incorrect (commence par ${publicKey[0]})`);
      }
    }

    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('1. Si des abonnements existent: npm run clean:push');
    console.log('2. Redémarrer les serveurs: npm run restart:pwa');
    console.log('3. Tester "Reset Push" dans l\'interface');
    console.log('4. Puis tester "Test Push"');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await db.closePool();
  }
}

// Exécuter le diagnostic
diagnosePushSystem();
