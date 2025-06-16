# Plan d'implémentation TextBee pour notifications Push → SMS

## 📋 Vue d'ensemble

**Objectif :** Envoyer automatiquement un SMS après 12h si l'utilisateur ne répond pas à une notification push.

**Architecture :**
- **Frontend :** React + Vite (notifications push)
- **Backend :** Node.js (gestion des notifications, scheduler, SMS)
- **Base de données :** Neon (PostgreSQL)
- **SMS Gateway :** TextBee.dev (plan gratuit)

---

## 🔧 Phase 1 : Configuration de TextBee

### 1.1 Création du compte TextBee
1. Aller sur https://textbee.dev/dashboard
2. Créer un compte gratuit (pas besoin de carte de crédit)
3. Récupérer votre **API_KEY** depuis le dashboard

### 1.2 Installation de l'app Android
1. Télécharger l'app TextBee sur votre téléphone Android
2. Se connecter avec votre compte
3. Récupérer le **DEVICE_ID** depuis l'app
4. Vérifier que l'appareil est actif dans le dashboard

### 1.3 Test de l'API
```bash
# Test avec curl
curl -X POST "https://api.textbee.dev/api/v1/gateway/devices/YOUR_DEVICE_ID/send-sms" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+22912345678"],
    "message": "Test depuis TextBee!"
  }'
```

---

## 🗄️ Phase 2 : Structure de la base de données

### 2.1 Tables nécessaires dans Neon

```sql
-- Table des utilisateurs (si pas déjà existante)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL, -- Format: +22912345678
  push_token VARCHAR(500), -- Token pour notifications push
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'push', 'sms', 'both'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'read', 'failed'
  push_sent_at TIMESTAMP,
  sms_sent_at TIMESTAMP,
  read_at TIMESTAMP,
  scheduled_sms_at TIMESTAMP, -- Pour programmer l'SMS après 12h
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les jobs programmés
CREATE TABLE scheduled_jobs (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id),
  job_type VARCHAR(50) NOT NULL, -- 'sms_followup'
  scheduled_at TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'executed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛠️ Phase 3 : Backend Node.js

### 3.1 Installation des dépendances

```bash
npm install axios node-cron dotenv pg
npm install --save-dev @types/node-cron
```

### 3.2 Configuration des variables d'environnement

```env
# .env
TEXTBEE_API_KEY=votre_api_key_textbee
TEXTBEE_DEVICE_ID=votre_device_id
TEXTBEE_BASE_URL=https://api.textbee.dev/api/v1
DATABASE_URL=votre_url_neon
```

### 3.3 Service TextBee

```javascript
// services/textbeeService.js
import axios from 'axios';

class TextBeeService {
  constructor() {
    this.apiKey = process.env.TEXTBEE_API_KEY;
    this.deviceId = process.env.TEXTBEE_DEVICE_ID;
    this.baseUrl = process.env.TEXTBEE_BASE_URL;
  }

  async sendSMS(phoneNumber, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/gateway/devices/${this.deviceId}/send-sms`,
        {
          recipients: [phoneNumber],
          message: message
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur TextBee:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBulkSMS(phoneNumbers, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/gateway/devices/${this.deviceId}/send-sms`,
        {
          recipients: phoneNumbers,
          message: message
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new TextBeeService();
```

### 3.4 Service de gestion des notifications

```javascript
// services/notificationService.js
import { pool } from '../config/database.js';
import textbeeService from './textbeeService.js';

class NotificationService {
  async createNotification(userId, title, message, type = 'push') {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO notifications (user_id, title, message, type, scheduled_sms_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, title, message, type, new Date(Date.now() + 12 * 60 * 60 * 1000)]); // +12h
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async sendPushNotification(notification) {
    // Votre logique push existante
    // ...
    
    // Marquer comme envoyée
    await this.updateNotificationStatus(notification.id, 'sent', 'push');
    
    // Programmer l'SMS de suivi
    await this.scheduleFollowUpSMS(notification);
  }

  async scheduleFollowUpSMS(notification) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO scheduled_jobs (notification_id, job_type, scheduled_at)
        VALUES ($1, $2, $3)
      `, [notification.id, 'sms_followup', notification.scheduled_sms_at]);
    } finally {
      client.release();
    }
  }

  async checkUnreadNotifications() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT n.*, u.phone_number, u.email
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        WHERE n.read_at IS NULL 
        AND n.push_sent_at IS NOT NULL
        AND n.sms_sent_at IS NULL
        AND n.scheduled_sms_at <= NOW()
      `);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  async sendFollowUpSMS(notification) {
    const smsMessage = `Rappel: ${notification.title}\n${notification.message}`;
    
    const result = await textbeeService.sendSMS(
      notification.phone_number,
      smsMessage
    );

    if (result.success) {
      await this.updateNotificationStatus(notification.id, 'sent', 'sms');
      console.log(`SMS de suivi envoyé à ${notification.phone_number}`);
    } else {
      console.error(`Échec SMS pour notification ${notification.id}:`, result.error);
    }

    return result;
  }

  async updateNotificationStatus(notificationId, status, type) {
    const client = await pool.connect();
    try {
      const field = type === 'push' ? 'push_sent_at' : 'sms_sent_at';
      await client.query(`
        UPDATE notifications 
        SET status = $1, ${field} = NOW()
        WHERE id = $2
      `, [status, notificationId]);
    } finally {
      client.release();
    }
  }

  async markAsRead(notificationId) {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE notifications 
        SET read_at = NOW(), status = 'read'
        WHERE id = $1
      `, [notificationId]);
    } finally {
      client.release();
    }
  }
}

export default new NotificationService();
```

### 3.5 Scheduler avec node-cron

```javascript
// schedulers/smsScheduler.js
import cron from 'node-cron';
import notificationService from '../services/notificationService.js';

class SMSScheduler {
  start() {
    // Vérifier toutes les 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      console.log('Vérification des SMS de suivi...');
      
      try {
        const unreadNotifications = await notificationService.checkUnreadNotifications();
        
        for (const notification of unreadNotifications) {
          await notificationService.sendFollowUpSMS(notification);
        }
        
        if (unreadNotifications.length > 0) {
          console.log(`${unreadNotifications.length} SMS de suivi envoyés`);
        }
      } catch (error) {
        console.error('Erreur dans le scheduler SMS:', error);
      }
    });
    
    console.log('SMS Scheduler démarré - vérification toutes les 10 minutes');
  }
}

export default new SMSScheduler();
```

---

## ⚛️ Phase 4 : Frontend React + Vite

### 4.1 Hook pour les notifications

```javascript
// hooks/useNotifications.js
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Erreur marquer comme lu:', error);
    }
  };

  return { notifications, markAsRead };
};
```

### 4.2 Composant de notification

```javascript
// components/NotificationComponent.jsx
import { useNotifications } from '../hooks/useNotifications';

const NotificationComponent = () => {
  const { notifications, markAsRead } = useNotifications();

  const handleNotificationClick = (notification) => {
    // Marquer comme lue (empêche l'envoi du SMS)
    markAsRead(notification.id);
    
    // Traiter l'action de la notification
    // ...
  };

  return (
    <div className="notifications">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className="notification-item"
          onClick={() => handleNotificationClick(notification)}
        >
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <small>Cliquez pour confirmer réception</small>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;
```

---

## 🚀 Phase 5 : Intégration et routes API

### 5.1 Routes API principales

```javascript
// routes/notifications.js
import express from 'express';
import notificationService from '../services/notificationService.js';

const router = express.Router();

// Créer une notification
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    const notification = await notificationService.createNotification(
      userId, title, message, type
    );
    
    // Envoyer la notification push immédiatement
    await notificationService.sendPushNotification(notification);
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marquer comme lue
router.post('/:id/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test SMS manuel
router.post('/test-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    const result = await textbeeService.sendSMS(phoneNumber, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 5.2 Démarrage du serveur

```javascript
// server.js
import express from 'express';
import smsScheduler from './schedulers/smsScheduler.js';
import notificationRoutes from './routes/notifications.js';

const app = express();

app.use(express.json());
app.use('/api/notifications', notificationRoutes);

// Démarrer le scheduler
smsScheduler.start();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('Scheduler SMS actif');
});
```

---

## 📊 Phase 6 : Monitoring et limites

### 6.1 Surveillance des limites TextBee (Plan gratuit)
- ✅ Max 50 messages/jour
- ✅ 500 messages/mois
- ✅ 50 destinataires en bulk

### 6.2 Dashboard de monitoring

```javascript
// Ajouter à votre dashboard
const getTextBeeUsage = async () => {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const dailyCount = await pool.query(`
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE sms_sent_at::date = $1
  `, [today]);
  
  const monthlyCount = await pool.query(`
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE sms_sent_at >= $1
  `, [`${thisMonth}-01`]);
  
  return {
    dailyUsage: dailyCount.rows[0].count,
    monthlyUsage: monthlyCount.rows[0].count,
    dailyLimit: 50,
    monthlyLimit: 500
  };
};
```

---

## ✅ Checklist de déploiement

### Étapes de mise en place :

1. **Configuration TextBee**
   - [ ] Compte créé sur textbee.dev
   - [ ] App Android installée et connectée
   - [ ] API_KEY et DEVICE_ID récupérés
   - [ ] Test d'envoi SMS réussi

2. **Base de données**
   - [ ] Tables créées dans Neon
   - [ ] Connexion testée
   - [ ] Index créés pour les performances

3. **Backend**
   - [ ] Services TextBee implémentés
   - [ ] Scheduler configuré
   - [ ] Routes API créées
   - [ ] Variables d'environnement configurées

4. **Frontend**
   - [ ] Hooks de notifications créés
   - [ ] Composants d'interface
   - [ ] Gestion des clics sur notifications

5. **Tests**
   - [ ] Test de bout en bout du flow
   - [ ] Vérification des délais de 12h
   - [ ] Test des limites d'API

### Commandes de démarrage :

```bash
# Backend
npm run dev

# Frontend
npm run dev

# Vérifier les logs
tail -f logs/sms-scheduler.log
```

---

## 🎯 Avantages de cette solution

- **Gratuit** : Plan TextBee gratuit parfait pour commencer
- **Simple** : API REST simple à utiliser
- **Fiable** : Utilise votre téléphone Android comme passerelle
- **Open Source** : Code source disponible
- **Contrôlé** : Pas de dépendance externe critique
- **Évolutif** : Peut passer au plan Pro si besoin

**Limitation principale** : Nécessite un téléphone Android connecté en permanence.