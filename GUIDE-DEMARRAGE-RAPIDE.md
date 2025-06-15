# 🚀 Guide de Démarrage Rapide

## ✅ Configuration Terminée !

Votre serveur backend est maintenant configuré pour utiliser la base de données Neon.

## 🎯 Démarrage Rapide

### Option 1 : Démarrage Automatique (Recommandé)
```bash
# Démarre frontend (Vite) + backend (Express) simultanément
npm run start:dev
```

### Option 2 : Démarrage Manuel (2 terminaux)

**Terminal 1 - Backend :**
```bash
npm run server:dev
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### Option 3 : Démarrage avec Couleurs
```bash
# Version avec préfixes colorés pour distinguer frontend/backend
npm run dev:full
```

## 🔍 Tests et Vérifications

### Test de la Base de Données
```bash
npm run db:test
```

### Démarrage Simple du Backend
```bash
npm run server
```

### Démarrage Simple du Frontend
```bash
npm run dev
```

## 🌐 URLs d'Accès

- **Frontend (React/Vite)** : http://localhost:5173
- **Backend (Express API)** : http://localhost:3000
- **API Routes** : http://localhost:3000/api/...

## 📋 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Démarrage backend avec vérifications |
| `npm run server` | Démarrage direct du backend |
| `npm run server:dev` | Backend avec rechargement auto (nodemon) |
| `npm run dev` | Frontend avec rechargement auto (Vite) |
| `npm run start:dev` | Frontend + Backend simultanément |
| `npm run dev:full` | Version avec couleurs et préfixes |
| `npm run db:test` | Test complet de la base de données |
| `npm run build` | Build de production du frontend |

## 🛠️ Résolution de Problèmes

### Si `concurrently` ne fonctionne pas :
```bash
# Réinstaller concurrently
npm install --save-dev concurrently

# Ou utiliser les scripts manuels
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

### Si la base de données ne répond pas :
```bash
npm run db:test
```

### Si le port 3000 est occupé :
```bash
# Modifier le PORT dans .env
PORT=3001
```

## 🎉 Votre Application est Prête !

1. ✅ Base de données Neon connectée
2. ✅ Backend Express configuré
3. ✅ Frontend React/Vite prêt
4. ✅ Routes API disponibles
5. ✅ SSL activé pour Neon
6. ✅ Pool de connexions optimisé

**Bon développement ! 🚀**
