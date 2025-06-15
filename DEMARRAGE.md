# 🚀 Guide de Démarrage du Serveur Backend

## Configuration de la Base de Données Neon

Votre serveur backend est maintenant configuré pour utiliser la base de données Neon hébergée.

### ✅ Configuration Actuelle

- **Base de données** : PostgreSQL sur Neon
- **Host** : `ep-holy-paper-a8tprhn6-pooler.eastus2.azure.neon.tech`
- **Database** : `stagedb`
- **SSL** : Activé (requis par Neon)
- **Pool de connexions** : Optimisé pour Neon (max 20 connexions)

## 🔧 Scripts Disponibles

### Test de la Base de Données
```bash
# Tester la connexion à la base de données
npm run db:test

# Vérification rapide de la configuration
npm run db:check
```

### Démarrage du Serveur

```bash
# Démarrage avec test préalable de la DB
npm start

# Démarrage direct du serveur
npm run server

# Démarrage en mode développement avec nodemon
npm run server:dev

# Démarrage en mode production
npm run server:prod
```

### Développement Frontend + Backend
```bash
# Démarrer le frontend (Vite) et le backend simultanément
npm run start:dev
```

## 🔍 Vérification de l'Installation

### 1. Test de Connexion à la Base de Données
```bash
npm run db:test
```

**Sortie attendue :**
```
🚀 Test de connexion à la base de données Neon
==================================================
✅ DATABASE_URL trouvée
🔗 Host: ep-holy-paper-a8tprhn6-pooler.eastus2.azure.neon.tech

🔄 Tentative de connexion...
✅ Connexion établie avec succès !

🔍 Test de requête basique...
✅ Requête exécutée avec succès !
📅 Heure serveur: [timestamp]
🗄️  Version: PostgreSQL 15.x

📂 Test du schéma...
✅ Schéma actuel: public

📋 Vérification des tables...
✅ Tables trouvées:
   📄 utilisateurs
   📄 stages
   📄 entreprises
   [autres tables...]

🎉 Test de connexion terminé avec succès !
```

### 2. Démarrage du Serveur
```bash
npm start
```

**Sortie attendue :**
```
🚀 Démarrage du serveur de développement
==================================================
🔄 Test de connexion à la base de données...
✅ Base de données accessible

🚀 Démarrage du serveur...
✅ Variables d'environnement chargées
🌍 Environnement: development
🔌 Port: 3000
🔧 [db.js] Configuration du pool PostgreSQL initialisée
📊 [db.js] Pool configuré avec max: 20 connexions
✅ Connexion PostgreSQL réussie !
📅 Heure serveur: [timestamp]
🗄️  Version PostgreSQL: 15.x
📂 Schéma actuel: public
🎉 Configuration de la base de données terminée avec succès !

🚀 ================================
🎉 Serveur démarré avec succès !
🔗 URL: http://localhost:3000
🌍 Environnement: development
🚀 ================================
```

## 🛠️ Résolution des Problèmes

### Erreur : "DATABASE_URL n'est pas définie"
- Vérifiez que le fichier `.env` existe à la racine du projet
- Vérifiez que `DATABASE_URL` est bien définie dans `.env`

### Erreur de connexion à la base de données
- Vérifiez votre connexion internet
- Vérifiez que l'URL de la base de données est correcte
- Contactez l'équipe Neon si le problème persiste

### Le serveur ne démarre pas
1. Vérifiez que toutes les dépendances sont installées : `npm install`
2. Testez la base de données : `npm run db:test`
3. Vérifiez les logs d'erreur dans la console

## 📁 Fichiers de Configuration

- `.env` : Variables d'environnement
- `src/config/db.js` : Configuration de la base de données
- `server.js` : Serveur principal Express
- `test-db-connection.js` : Script de test de la DB
- `start-dev.js` : Script de démarrage avec vérifications

## 🔐 Sécurité

- Les connexions à Neon utilisent SSL/TLS
- Le JWT_SECRET est configuré pour l'authentification
- Les variables sensibles sont dans `.env` (non versionné)

## 📞 Support

En cas de problème, vérifiez :
1. Les logs de la console
2. La connectivité réseau
3. La validité des credentials Neon
4. Les variables d'environnement
