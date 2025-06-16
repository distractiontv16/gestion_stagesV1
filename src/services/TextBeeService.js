/**
 * Service TextBee pour l'envoi de SMS
 * Basé sur le plan d'implémentation TextBee
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class TextBeeService {
  constructor() {
    this.apiKey = process.env.TEXTBEE_API_KEY;
    this.deviceId = process.env.TEXTBEE_DEVICE_ID;
    this.baseUrl = process.env.TEXTBEE_BASE_URL || 'https://api.textbee.dev/api/v1';
    
    // Vérifier la configuration
    if (!this.apiKey || !this.deviceId) {
      console.warn('⚠️  Configuration TextBee incomplète. Vérifiez TEXTBEE_API_KEY et TEXTBEE_DEVICE_ID');
    }
  }

  /**
   * Envoyer un SMS à un numéro
   * @param {string} phoneNumber - Numéro de téléphone au format +22912345678
   * @param {string} message - Message à envoyer
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendSMS(phoneNumber, message) {
    try {
      // Vérifier la configuration
      if (!this.apiKey || !this.deviceId) {
        return {
          success: false,
          error: 'Configuration TextBee manquante',
          provider: 'textbee'
        };
      }

      // Formater le numéro de téléphone
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      console.log(`📱 Envoi SMS via TextBee vers ${formattedPhone}`);

      const response = await axios.post(
        `${this.baseUrl}/gateway/devices/${this.deviceId}/send-sms`,
        {
          recipients: [formattedPhone],
          message: message
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 secondes de timeout
        }
      );

      console.log('✅ SMS envoyé avec succès via TextBee');
      
      return {
        success: true,
        data: response.data,
        provider: 'textbee',
        messageId: response.data?.messageId || `textbee-${Date.now()}`,
        cost: 0 // TextBee gratuit
      };

    } catch (error) {
      console.error('❌ Erreur TextBee:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: 'textbee',
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Envoyer des SMS en masse
   * @param {Array<string>} phoneNumbers - Liste des numéros
   * @param {string} message - Message à envoyer
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  async sendBulkSMS(phoneNumbers, message) {
    try {
      if (!this.apiKey || !this.deviceId) {
        return {
          success: false,
          error: 'Configuration TextBee manquante',
          provider: 'textbee'
        };
      }

      // Limiter à 50 destinataires (limite TextBee gratuit)
      const limitedNumbers = phoneNumbers.slice(0, 50);
      const formattedNumbers = limitedNumbers.map(phone => this.formatPhoneNumber(phone));

      console.log(`📱 Envoi SMS en masse via TextBee vers ${formattedNumbers.length} destinataires`);

      const response = await axios.post(
        `${this.baseUrl}/gateway/devices/${this.deviceId}/send-sms`,
        {
          recipients: formattedNumbers,
          message: message
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 secondes pour les envois en masse
        }
      );

      console.log('✅ SMS en masse envoyés avec succès via TextBee');

      return {
        success: true,
        data: response.data,
        provider: 'textbee',
        sentCount: formattedNumbers.length,
        skippedCount: phoneNumbers.length - formattedNumbers.length,
        cost: 0
      };

    } catch (error) {
      console.error('❌ Erreur TextBee bulk:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: 'textbee'
      };
    }
  }

  /**
   * Formater le numéro de téléphone pour le Bénin (nouvelle numérotation avec 01)
   * @param {string} phoneNumber - Numéro brut
   * @returns {string} Numéro formaté
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';

    // Nettoyer le numéro (garder seulement les chiffres et le +)
    let cleaned = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    // Si le numéro commence par +229, le garder tel quel
    if (cleaned.startsWith('+229')) {
      return cleaned;
    }

    // Si le numéro commence par 229, ajouter le +
    if (cleaned.startsWith('229')) {
      return '+' + cleaned;
    }

    // Si le numéro commence par 01 (nouveau format béninois)
    if (cleaned.startsWith('01')) {
      return '+229' + cleaned;
    }

    // Si le numéro commence par 0 mais pas 01, remplacer par +22901
    if (cleaned.startsWith('0') && !cleaned.startsWith('01')) {
      return '+22901' + cleaned.substring(1);
    }

    // Si c'est un numéro local de 8 chiffres (ancien format), ajouter +22901
    if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
      return '+22901' + cleaned;
    }

    // Si c'est un numéro local de 10 chiffres commençant par 01, ajouter +229
    if (cleaned.length === 10 && cleaned.startsWith('01')) {
      return '+229' + cleaned;
    }

    // Retourner tel quel si on ne peut pas déterminer le format
    return cleaned;
  }

  /**
   * Créer le message SMS pour les notifications de stage
   * @param {string} prenom - Prénom de l'étudiant
   * @param {string} titre - Titre de la notification
   * @param {string} message - Message de la notification
   * @returns {string} Message SMS formaté
   */
  formatStageNotificationSMS(prenom, titre, message) {
    const shortUrl = 'https://bit.ly/insti-stage'; // À configurer avec un raccourcisseur d'URL
    
    return `🎓 INSTI - STAGE URGENT
Bonjour ${prenom},

${titre}

Connectez-vous MAINTENANT sur :
👉 ${shortUrl}

Information critique en attente.
Délai expirant bientôt.

Support: +229 XX XX XX XX`;
  }

  /**
   * Tester la configuration TextBee
   * @returns {Promise<Object>} Résultat du test
   */
  async testConfiguration() {
    try {
      if (!this.apiKey || !this.deviceId) {
        return {
          success: false,
          error: 'Configuration manquante',
          details: {
            hasApiKey: !!this.apiKey,
            hasDeviceId: !!this.deviceId
          }
        };
      }

      // Test avec un numéro fictif (ne sera pas envoyé)
      const testMessage = 'Test de configuration TextBee - ' + new Date().toISOString();
      
      console.log('🧪 Test de configuration TextBee...');
      
      // Juste tester l'endpoint sans envoyer
      const response = await axios.get(
        `${this.baseUrl}/gateway/devices/${this.deviceId}`,
        {
          headers: {
            'x-api-key': this.apiKey
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        message: 'Configuration TextBee valide',
        deviceStatus: response.data
      };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Obtenir les statistiques d'utilisation
   * @returns {Object} Statistiques d'utilisation
   */
  getUsageStats() {
    // Pour TextBee gratuit
    return {
      dailyLimit: 50,
      monthlyLimit: 500,
      bulkLimit: 50,
      provider: 'textbee',
      plan: 'gratuit'
    };
  }
}

export default new TextBeeService();
