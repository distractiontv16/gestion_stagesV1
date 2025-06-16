# 📱 Phase 2 : SMS Automatique après 12h

## 🎯 Vue d'ensemble

La Phase 2 du système de notifications INSTI implémente l'envoi automatique de SMS 12 heures après qu'une notification push n'ait pas été lue par l'étudiant.

### 🔄 Workflow Automatique

1. **T+0h** : Notification push envoyée via PWA
2. **T+12h** : Si non lue → SMS automatique envoyé
3. **Si lue** : SMS automatiquement annulé

## 🛠️ Architecture Technique

### Services Implémentés

- **TextBeeService** : Gestion des envois SMS via TextBee.dev
- **NotificationService** : Orchestration PWA + SMS
- **SMSScheduler** : Vérification automatique toutes les 10 minutes

### Base de Données

```sql
-- Nouvelles colonnes dans notifications
ALTER TABLE notifications ADD COLUMN scheduled_sms_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN sms_sent_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN sms_delivered_at TIMESTAMP;

-- Nouvelle table pour les jobs programmés
CREATE TABLE scheduled_jobs (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id),
  job_type VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Installation et Configuration

### 1. Configuration TextBee

1. Créez un compte sur [TextBee.dev](https://textbee.dev)
2. Installez l'app Android TextBee
3. Récupérez votre API_KEY et DEVICE_ID
4. Ajoutez dans `.env` :

```env
TEXTBEE_API_KEY=votre_api_key
TEXTBEE_DEVICE_ID=votre_device_id
TEXTBEE_BASE_URL=https://api.textbee.dev/api/v1
```

### 2. Installation des Dépendances

```bash
npm install node-cron
```

### 3. Configuration de la Base de Données

```bash
# Configurer les tables nécessaires
node setup-sms-database.js
```

## 🧪 Tests et Validation

### Tests Disponibles

```bash
# Test complet du système SMS
npm run test:sms

# Test d'intégration Phase 2
npm run test:phase2

# Démarrer avec système SMS
npm run start:sms
```

### Résultats Attendus

```
🧪 TEST DU SYSTÈME SMS - PHASE 2
=====================================

📋 1. TEST CONFIGURATION TEXTBEE
   • API Key: ✅ Configurée
   • Device ID: ✅ Configuré
   • Test connexion: ✅ Réussi

📋 2. TEST STRUCTURE BASE DE DONNÉES
   • Connexion DB: ✅ Réussie
   • Total notifications: 135
   • SMS en attente: 0

🚀 SYSTÈME SMS PRÊT !
```

## 📡 API Endpoints

### Endpoints SMS

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/sms/test` | POST | Tester un SMS |
| `/api/sms/test-stage` | POST | Tester SMS de stage |
| `/api/sms/config` | GET | Vérifier configuration |
| `/api/sms/stats` | GET | Statistiques SMS |
| `/api/sms/pending` | GET | SMS en attente |
| `/api/sms/scheduler/status` | GET | Statut scheduler |
| `/api/sms/scheduler/force-check` | POST | Forcer vérification |

### Exemple d'utilisation

```javascript
// Tester un SMS
const response = await fetch('/api/sms/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    phoneNumber: '+22912345678',
    message: 'Test SMS'
  })
});
```

## 🎮 Interface Admin

### Composant SMSTestComponent

Intégrez le composant dans votre interface admin :

```tsx
import SMSTestComponent from './components/admin/SMSTestComponent';

// Dans votre dashboard admin
<SMSTestComponent />
```

### Fonctionnalités

- ✅ Statistiques en temps réel
- ✅ Test d'envoi SMS
- ✅ Monitoring des SMS en attente
- ✅ Contrôle du scheduler
- ✅ Vérification forcée

## 📊 Monitoring et Statistiques

### Métriques Trackées

- **Notifications** : Total, push envoyés, SMS envoyés, lues
- **Scheduler** : Statut, vérifications, taux de succès
- **Usage** : Limites TextBee, coûts

### Dashboard en Temps Réel

Le composant admin affiche :
- 📊 Statistiques des notifications
- ⏰ Statut du scheduler
- 📈 Limites d'utilisation TextBee
- ⏳ Liste des SMS en attente

## 🔧 Configuration Avancée

### Variables d'Environnement

```env
# SMS Configuration
TEXTBEE_API_KEY=your_api_key
TEXTBEE_DEVICE_ID=your_device_id
TEXTBEE_BASE_URL=https://api.textbee.dev/api/v1

# Notification Settings
SMS_DELAY_HOURS=12
NOTIFICATION_RETRY_ATTEMPTS=3
```

### Limites TextBee (Plan Gratuit)

- **Quotidien** : 50 SMS
- **Mensuel** : 500 SMS
- **Bulk** : 50 destinataires max

## 🚨 Dépannage

### Problèmes Courants

1. **SMS non envoyés**
   - Vérifiez la configuration TextBee
   - Vérifiez que l'app Android est connectée
   - Consultez les logs du scheduler

2. **Scheduler inactif**
   - Redémarrez le serveur
   - Vérifiez les logs d'erreur
   - Utilisez `force-check` pour tester

3. **Notifications non détectées**
   - Vérifiez la structure de la base de données
   - Vérifiez les colonnes `scheduled_sms_at`
   - Consultez la table `scheduled_jobs`

### Logs Utiles

```bash
# Logs du scheduler
📊 Check #1 - 16/06/2025 07:37:10
🔍 0 notifications trouvées pour SMS de suivi
✅ Aucun SMS de suivi à envoyer

# Logs d'envoi SMS
📱 Envoi SMS de suivi pour notification 137
✅ SMS de suivi envoyé pour notification 137
```

## 🎯 Prochaines Étapes

### Phase 3 : Appels IA Vocaux (Optionnel)

- Intégration Bland AI
- Appels automatiques après 24h
- Scripts vocaux personnalisés

### Améliorations Possibles

- Interface de gestion des templates SMS
- Statistiques avancées avec graphiques
- Intégration avec d'autres providers SMS
- Notifications par email en backup

## 📞 Support

Pour toute question ou problème :

1. Consultez les logs du serveur
2. Utilisez les scripts de test
3. Vérifiez la configuration TextBee
4. Consultez la documentation TextBee.dev

---

**🎉 La Phase 2 est maintenant opérationnelle !**

Le système envoie automatiquement des SMS 12h après les notifications push non lues, avec annulation automatique si l'utilisateur lit la notification entre temps.
