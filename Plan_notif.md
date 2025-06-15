# Plan de Mise en Œuvre - Système de Notifications INSTI

## 📋 PHASE D'ANALYSE - RÉSUMÉ

### Architecture Actuelle Identifiée

**Frontend :** React + TypeScript + Vite  
**Backend :** Node.js + Express  
**Base de données :** PostgreSQL hébergée sur Neon  
**Système de notification existant :** Basique avec table notifications (id, utilisateur_id, titre, message, lue, created_at)  
**Pas de PWA configurée :** Aucun service worker, manifeste ou configuration push  

### Infrastructure Existante

#### ✅ Éléments en place
- Table notifications avec colonnes de base
- API endpoints pour notifications (/api/notifications)
- Interface admin pour envoyer des notifications
- Interface étudiant pour voir les notifications

#### ❌ Éléments manquants
- Aucune configuration PWA
- Aucun service worker
- Aucun système de notification push web
- Aucune intégration SMS ou appels IA

---

## 🎯 PLAN DE MISE EN ŒUVRE DÉTAILLÉ

### PHASE 1 : MISE À JOUR DE LA BASE DE DONNÉES ✅ (Semaine 1)

#### 1.1 Extension de la table notifications ✅

```sql
-- Nouvelles colonnes pour le système en trois temps
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS push_sent_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS push_delivered_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS push_opened_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sms_delivered_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS voice_call_initiated_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS voice_call_completed_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
```

#### 1.2 Nouvelle table pour les abonnements push ✅

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(utilisateur_id, endpoint)
);
```

#### 1.3 Table pour le tracking des campagnes ✅

```sql
CREATE TABLE IF NOT EXISTS notification_campaigns (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
    campaign_type VARCHAR(20) NOT NULL, -- 'push', 'sms', 'voice'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    provider VARCHAR(50), -- 'web-push', 'orange', 'mtn', 'bland-ai'
    external_id TEXT, -- ID du provider externe
    cost_fcfa DECIMAL(10,2) DEFAULT 0,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### PHASE 2 : CONFIGURATION PWA OBLIGATOIRE 🔄 (Semaine 1-2)

#### 2.1 Manifeste Web App ✅

**Fichier :** `public/manifest.json`

```json
{
  "name": "INSTI - Gestion des Stages",
  "short_name": "INSTI Stages",
  "description": "Plateforme de gestion des stages - Institut INSTI",
  "start_url": "/student/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["education", "productivity"],
  "lang": "fr-FR"
}
```

#### 2.2 Service Worker 🧪

**Fichier :** `public/sw.js`

```javascript
const CACHE_NAME = 'insti-stages-v1';
const urlsToCache = [
  '/',
  '/student/dashboard',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.message || 'Nouvelle notification INSTI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-urgent.png',
    requireInteraction: true,
    persistent: true,
    actions: [
      {action: 'open', title: '🔗 Ouvrir Maintenant'},
      {action: 'snooze', title: '⏰ Dans 1h'}
    ],
    data: {
      studentId: data.studentId,
      notificationId: data.notificationId,
      url: data.targetUrl || '/student/dashboard'
    },
    tag: 'insti-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('🎓 INSTI - URGENT', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'snooze') {
    // Programmer une nouvelle notification dans 1h
    // (à implémenter côté serveur)
  }
});
```

#### 2.3 Composant d'installation PWA obligatoire 🧪

**Fichier :** `src/components/PWAInstallPrompt.tsx`

---

### PHASE 3 : BACKEND - SERVICES DE NOTIFICATION (Semaine 2-3)

#### 3.1 Service Push Web
**Fichier :** `src/services/PushNotificationService.js`

#### 3.2 Service SMS
**Fichier :** `src/services/SMSService.js`

#### 3.3 Service IA Vocale
**Fichier :** `src/services/VoiceAIService.js`

#### 3.4 Orchestrateur de notifications
**Fichier :** `src/services/NotificationOrchestrator.js`

---

### PHASE 4 : NOUVEAUX ENDPOINTS API (Semaine 3)

#### 4.1 Endpoints pour PWA
- `POST /api/push/subscribe` - Enregistrer un abonnement push
- `DELETE /api/push/unsubscribe` - Désabonner
- `POST /api/push/test` - Tester une notification push

#### 4.2 Endpoints pour campagnes
- `POST /api/notifications/campaign` - Lancer une campagne en trois temps
- `GET /api/notifications/metrics` - Métriques des campagnes
- `GET /api/notifications/campaign/:id/status` - Statut d'une campagne

---

### PHASE 5 : FRONTEND - INTÉGRATION PWA (Semaine 3-4)

#### 5.1 Hook pour PWA
**Fichier :** `src/hooks/usePWA.ts`

#### 5.2 Composant d'installation obligatoire
**Fichier :** `src/components/PWAInstallPrompt.tsx`

#### 5.3 Mise à jour du dashboard étudiant
- Intégration du prompt PWA obligatoire
- Gestion des permissions de notification
- Interface pour les préférences de notification

---

### PHASE 6 : DASHBOARD ADMIN AVANCÉ (Semaine 4)

#### 6.1 Interface de campagne
- Sélection du type de notification (standard/urgente)
- Prévisualisation des trois phases
- Programmation des envois

#### 6.2 Dashboard de métriques
- Taux de livraison par canal
- Coûts par campagne
- Temps de réponse moyen
- Graphiques de performance

---

### PHASE 7 : SYSTÈME DE PLANIFICATION (Semaine 4-5)

#### 7.1 Job Scheduler
**Fichier :** `src/services/NotificationScheduler.js`

- Utilisation de node-cron pour les tâches programmées
- Vérification toutes les heures des notifications non lues
- Déclenchement automatique des phases 2 et 3

#### 7.2 Queue System
- Implémentation d'une queue pour les notifications
- Retry automatique en cas d'échec
- Rate limiting pour éviter le spam

---

## 🔧 DÉTAILS TECHNIQUES SPÉCIFIQUES

### Variables d'environnement à ajouter

```env
# Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@insti.edu

# SMS Services
ORANGE_API_TOKEN=
ORANGE_API_URL=https://api.orange.com/smsmessaging/v1
MTN_API_TOKEN=
MTN_API_URL=

# Voice AI
BLAND_AI_API_KEY=
BLAND_AI_BASE_URL=https://api.bland.ai/v1

# Notification Settings
NOTIFICATION_RETRY_ATTEMPTS=3
SMS_DELAY_HOURS=12
VOICE_DELAY_HOURS=24
```

### Dépendances à installer
```bash
npm install web-push node-cron bull redis-server twilio axios
```

### Modifications du schéma utilisateur
```sql
-- Ajouter le consentement pour les notifications
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS notification_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS voice_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS pwa_installed_at TIMESTAMP;
```

---

## 📊 MÉTRIQUES À TRACKER

### KPIs Principaux
- **Taux d'installation PWA** : % d'étudiants ayant installé la PWA
- **Taux de livraison push** : % de notifications push délivrées
- **Taux d'ouverture** : % de notifications ouvertes dans les 24h
- **Escalade nécessaire** : % de notifications nécessitant SMS/appel
- **Coût par engagement** : Coût moyen pour obtenir une lecture
- **Temps de réponse** : Délai moyen entre envoi et lecture

### Dashboard Admin
- Graphiques en temps réel des métriques
- Coûts par mois/campagne
- Comparaison des canaux (push vs SMS vs voice)
- Alertes pour les échecs de livraison

---

## ⚖️ CONFORMITÉ LÉGALE

### Consentements requis
- **Inscription** : Consentement explicite pour notifications essentielles
- **PWA** : Information claire sur l'installation obligatoire
- **SMS/Appels** : Opt-in séparé avec possibilité d'opt-out
- **RGPD** : Droit de retrait avec conséquences académiques expliquées

### Mentions légales à ajouter

> "En vous inscrivant, vous acceptez de recevoir des notifications essentielles concernant votre parcours académique via push web, SMS et appels automatisés. Ces communications sont nécessaires au bon suivi de votre dossier de stage. L'installation de la PWA est obligatoire pour accéder à la plateforme."

---

**Question :** Voulez-vous que je commence par implémenter une phase spécifique, ou préférez-vous que je commence par la Phase 1 (base de données) et que nous procédions étape par étape ?