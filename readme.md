# 🎓 Plateforme de Gestion des Stages INSTI
## Système de Notifications PWA + SMS Automatique

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo)
[![PWA](https://img.shields.io/badge/PWA-enabled-green.svg)](https://web.dev/progressive-web-apps/)
[![SMS](https://img.shields.io/badge/SMS-TextBee-orange.svg)](https://textbee.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Plateforme moderne de gestion des stages avec système de notifications intelligent : Push PWA instantané + SMS automatique après 12h**

## 🎯 Vue d'ensemble

Cette plateforme révolutionne la gestion des stages à l'INSTI en remplaçant les fichiers Excel par un système en ligne complet avec un **système de notifications à deux niveaux** :

1. **📱 Notifications Push PWA** - Instantanées, même application fermée
2. **📲 SMS automatique** - Envoyé après 12h si notification non lue
3. **❌ Annulation intelligente** - SMS annulé si notification lue

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS
- **Backend** : Node.js + Express.js + JWT
- **Base de Données** : PostgreSQL (Neon Cloud)
- **PWA** : Service Workers + Web Push API + VAPID
- **SMS** : TextBee.dev (gratuit 50 SMS/jour)
- **Scheduler** : node-cron (vérifications toutes les 10 min)
- **Déploiement** : Vercel (Frontend + Serverless Functions)

---

## 📋 Table des Matières

1. [🏗️ Architecture Technique](#️-architecture-technique)
2. [✨ Fonctionnalités et Avantages](#-fonctionnalités-et-avantages)
3. [⚙️ Configuration et Déploiement](#️-configuration-et-déploiement)
4. [📱 Utilisation et Monitoring](#-utilisation-et-monitoring)
5. [🔧 Aspects Techniques Avancés](#-aspects-techniques-avancés)
6. [🚀 Guide de Démarrage Rapide](#-guide-de-démarrage-rapide)
7. [🔍 Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture Technique

### 📊 Workflow Complet : PWA Push → 12h → SMS

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │───▶│  Notification    │───▶│   PostgreSQL    │
│                 │    │    Service       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Push Service     │    │ Scheduled Jobs  │
                       │ (Immédiat)       │    │ (12h delay)     │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Service Worker   │    │  SMS Scheduler  │
                       │ (PWA Push)       │    │  (node-cron)    │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ User Device      │    │ TextBee Service │
                       │ (Notification)   │    │ (SMS)           │
                       └──────────────────┘    └─────────────────┘
```

### 🔄 Intégration des Composants

#### 1. **PushNotificationService** (`src/services/PushNotificationService.js`)
```javascript
// Gestion des notifications push PWA
class PushNotificationService {
  async sendToUser(userId, notificationData) {
    // 1. Récupère les subscriptions actives
    // 2. Envoie via Web Push API + VAPID
    // 3. Gère les subscriptions expirées
    // 4. Retourne le statut d'envoi
  }
}
```

#### 2. **NotificationService** (`src/services/NotificationService.js`)
```javascript
// Orchestrateur principal du système
class NotificationService {
  async createNotification(userId, title, message, type = 'both') {
    // 1. Crée la notification en DB
    // 2. Programme le SMS 12h après
    // 3. Envoie le push immédiatement
    // 4. Crée le job programmé
  }
  
  async markAsRead(notificationId) {
    // 1. Marque comme lue en DB
    // 2. Annule les jobs SMS en attente
  }
}
```

#### 3. **TextBeeService** (`src/services/TextBeeService.js`)
```javascript
// Gestion des envois SMS via TextBee
class TextBeeService {
  async sendSMS(phoneNumber, message) {
    // 1. Formate le numéro béninois (+229 01...)
    // 2. Envoie via API TextBee
    // 3. Gère les erreurs et retry
    // 4. Retourne le statut d'envoi
  }
}
```

#### 4. **SMSScheduler** (`src/schedulers/SMSScheduler.js`)
```javascript
// Scheduler automatique avec node-cron
class SMSScheduler {
  start() {
    // Vérification toutes les 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      await this.checkAndSendSMS();
    });
  }
  
  async checkAndSendSMS() {
    // 1. Trouve les notifications non lues > 12h
    // 2. Envoie les SMS via TextBeeService
    // 3. Met à jour les statuts en DB
  }
}
```

### 🗄️ Flux de Données Détaillé

**Étape 1 : Création de Notification**
```javascript
// Admin crée une notification
POST /api/notifications
{
  "userId": 2,
  "title": "Nouveau stage disponible",
  "message": "Un stage chez TechCorp est disponible",
  "type": "both"
}
```

**Étape 2 : Traitement Automatique**
```sql
-- 1. Insertion en base
INSERT INTO notifications (utilisateur_id, titre, message, scheduled_sms_at)
VALUES (2, 'Nouveau stage', 'Message...', NOW() + INTERVAL '12 hours');

-- 2. Création du job programmé
INSERT INTO scheduled_jobs (notification_id, job_type, scheduled_at)
VALUES (123, 'sms_followup', NOW() + INTERVAL '12 hours');
```

**Étape 3 : Push Immédiat**
```javascript
// Envoi push PWA
await webpush.sendNotification(subscription, {
  title: "Nouveau stage disponible",
  body: "Un stage chez TechCorp est disponible",
  data: { notificationId: 123 }
});
```

**Étape 4 : Surveillance Automatique**
```javascript
// Scheduler vérifie toutes les 10 minutes
cron.schedule('*/10 * * * *', async () => {
  const pendingNotifications = await db.query(`
    SELECT * FROM notifications 
    WHERE lue = FALSE 
    AND scheduled_sms_at <= NOW()
    AND sms_sent_at IS NULL
  `);
  
  for (const notif of pendingNotifications) {
    await TextBeeService.sendSMS(notif.telephone, notif.message);
  }
});
```

---

## ✨ Fonctionnalités et Avantages

### 🚀 Avantages du Système PWA

#### **1. Notifications Même App Fermée**
- **Service Worker** actif en arrière-plan
- **Push API** native du navigateur
- **Réception garantie** sur mobile et desktop
- **Pas besoin d'app native** (iOS/Android)

```javascript
// Service Worker intercepte les push
self.addEventListener('push', event => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.data
  });
});
```

#### **2. Installation Native**
```javascript
// Prompt d'installation automatique
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // Affiche le prompt d'installation PWA
  e.prompt();
});
```

#### **3. Capacités Offline**
- **Cache intelligent** des ressources critiques
- **Fonctionnement hors ligne** partiel
- **Synchronisation** à la reconnexion

### 📲 Bénéfices du SMS Automatique

#### **1. Fallback Intelligent**
- **Garantie de réception** même si push ignoré
- **Délai de 12h** pour laisser le temps de réagir
- **Annulation automatique** si notification lue

#### **2. Couverture Universelle**
- **Fonctionne sur tous les téléphones** (même anciens)
- **Pas de dépendance internet** pour la réception
- **Taux de lecture élevé** (98% des SMS sont lus)

#### **3. Coût Optimisé**
- **Plan gratuit TextBee** : 50 SMS/jour, 500/mois
- **Envoi uniquement si nécessaire** (push non lu)
- **Pas de gaspillage** grâce à l'annulation

### 🔄 Mécanisme d'Annulation Intelligente

```javascript
// Quand l'utilisateur lit la notification
async markAsRead(notificationId) {
  // 1. Marquer comme lue
  await db.query('UPDATE notifications SET lue = TRUE WHERE id = $1', [notificationId]);
  
  // 2. Annuler les SMS programmés
  await db.query(`
    UPDATE scheduled_jobs 
    SET status = 'cancelled'
    WHERE notification_id = $1 AND status = 'pending'
  `, [notificationId]);
}
```

### 📊 Comparaison avec Systèmes Traditionnels

| Fonctionnalité | Email | SMS Simple | **Notre Système** |
|----------------|-------|-------------|-------------------|
| Réception instantanée | ❌ | ✅ | ✅ (Push PWA) |
| Fonctionne app fermée | ❌ | ✅ | ✅ |
| Coût par message | Gratuit | €€€ | Gratuit + SMS backup |
| Taux de lecture | 20% | 98% | **95%** (Push + SMS) |
| Installation requise | ❌ | ❌ | PWA (optionnelle) |
| Annulation intelligente | ❌ | ❌ | ✅ |
| Monitoring temps réel | ❌ | ❌ | ✅ |

---

## ⚙️ Configuration et Déploiement

### 🔧 Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Base de données PostgreSQL (Neon)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# JWT pour l'authentification
JWT_SECRET="votre-secret-jwt-ultra-securise"

# VAPID pour les notifications push PWA
VAPID_PUBLIC_KEY="BH4dXKl9QOFf-S5wX9FfK9i8kNGAGRzPkRllD-lUjOOzIDi4NOHoHlfXwoQ-GoBXpw_9rvFzhw5dEsw7L2aODOE"
VAPID_PRIVATE_KEY="q1dXpw24JZVq-4_-7_YcxXjQowBXVP0VLueInYSBSm4"
VAPID_SUBJECT="mailto:admin@insti.edu"

# TextBee pour les SMS
TEXTBEE_API_KEY="votre-cle-api-textbee"
TEXTBEE_DEVICE_ID="votre-device-id-textbee"
TEXTBEE_BASE_URL="https://api.textbee.dev/api/v1"

# Configuration serveur
NODE_ENV="production"
PORT=3000
```

### 📱 Configuration TextBee

#### **1. Création du compte**
1. Allez sur [TextBee.dev](https://textbee.dev)
2. Créez un compte gratuit
3. Téléchargez l'app TextBee sur votre téléphone
4. Connectez votre téléphone comme "device"

#### **2. Configuration API**
```javascript
// Récupération des clés API
// 1. Dans l'app TextBee : Settings > API
// 2. Copiez l'API Key et Device ID
// 3. Ajoutez-les dans votre .env
```

#### **3. Format des numéros béninois**
```javascript
// Le système gère automatiquement le format +229 01...
const formatPhoneNumber = (phone) => {
  // Convertit 43053098 en +229 0143053098
  if (phone.startsWith('229')) return `+${phone}`;
  if (phone.startsWith('+229')) return phone;
  if (phone.length === 8) return `+229 01${phone}`;
  return phone;
};
```

### 🔑 Configuration VAPID

#### **1. Génération des clés**
```bash
# Utilisez le script fourni
node generate-vapid-keys.js
```

#### **2. Configuration côté client**
```javascript
// public/sw.js - Service Worker
self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-urgent.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

### 🗄️ Configuration Base de Données

#### **1. Tables principales**
```sql
-- Notifications avec SMS programmé
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'both',
  lue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  push_sent_at TIMESTAMP,
  sms_sent_at TIMESTAMP,
  scheduled_sms_at TIMESTAMP,
  escalation_level INTEGER DEFAULT 0
);

-- Jobs programmés pour le scheduler
CREATE TABLE scheduled_jobs (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id),
  job_type VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  executed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions push PWA
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW()
);
```

#### **2. Index pour performance**
```sql
-- Index pour le scheduler SMS
CREATE INDEX idx_notifications_sms_pending
ON notifications(scheduled_sms_at, lue, sms_sent_at)
WHERE lue = FALSE AND sms_sent_at IS NULL;

-- Index pour les jobs programmés
CREATE INDEX idx_scheduled_jobs_pending
ON scheduled_jobs(scheduled_at, status)
WHERE status = 'pending';

-- Index pour les subscriptions actives
CREATE INDEX idx_push_subscriptions_active
ON push_subscriptions(utilisateur_id, is_active)
WHERE is_active = TRUE;
```

### 🚀 Déploiement Vercel

#### **1. Configuration vercel.json**
```json
{
  "version": 2,
  "env": {
    "NODE_ENV": "production"
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(sw\\.js|workbox-.*\\.js|registerSW\\.js)",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate",
        "service-worker-allowed": "/"
      },
      "dest": "/dist/$1"
    },
    {
      "src": "/admin-login",
      "dest": "/dist/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/index.html"
    }
  ]
}
```

#### **2. Variables d'environnement Vercel**
```bash
# Via Vercel CLI
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
vercel env add TEXTBEE_API_KEY
vercel env add TEXTBEE_DEVICE_ID

# Ou via le dashboard Vercel
# Settings > Environment Variables
```

#### **3. Scripts de déploiement**
```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "vercel --prod",
    "deploy:preview": "vercel"
  }
}
```
