import webpush from 'web-push';

console.log('🔑 Génération des clés VAPID...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Clés VAPID générées avec succès !\n');
console.log('📋 Copiez ces clés dans votre fichier .env :\n');
console.log('# Configuration PWA et Push Notifications');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:admin@insti.edu\n');

console.log('🔧 Instructions :');
console.log('1. Copiez les lignes ci-dessus dans votre fichier "env"');
console.log('2. Remplacez les anciennes clés VAPID');
console.log('3. Redémarrez le serveur');
console.log('4. Testez sur votre mobile avec l\'URL : http://169.254.16.199:3000\n');

console.log('📱 N\'oubliez pas :');
console.log('- Connectez votre téléphone au même WiFi');
console.log('- Utilisez Chrome ou Safari sur mobile');
console.log('- Acceptez les permissions de notification');
