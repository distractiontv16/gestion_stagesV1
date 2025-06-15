import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { X, Download, Smartphone, Bell, Shield, CheckCircle } from 'lucide-react';

interface PWAInstallPromptProps {
  isStudent: boolean;
  onInstallComplete?: () => void;
  onSkip?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  isStudent, 
  onInstallComplete,
  onSkip 
}) => {
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isSupported,
    installPWA,
    checkInstallation,
    requestNotificationPermission,
    subscribeToPush
  } = usePWA();

  const [currentStep, setCurrentStep] = useState(1);
  const [isInstalling, setIsInstalling] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  // Vérifier si le prompt doit être affiché
  useEffect(() => {
    if (!isStudent) {
      setShowPrompt(false);
      return;
    }

    // Pour les étudiants, vérifier si la PWA est déjà installée
    const isPWAInstalled = checkInstallation();
    
    if (!isPWAInstalled && isSupported) {
      setShowPrompt(true);
    } else if (isPWAInstalled) {
      // PWA installée, vérifier les permissions de notification
      setNotificationPermission(Notification.permission);
      if (Notification.permission !== 'granted') {
        setCurrentStep(2);
        setShowPrompt(true);
      } else {
        setShowPrompt(false);
        onInstallComplete?.();
      }
    }
  }, [isStudent, isInstalled, isStandalone, isSupported, checkInstallation, onInstallComplete]);

  const handleInstallPWA = async () => {
    setIsInstalling(true);
    
    try {
      const success = await installPWA();
      
      if (success || checkInstallation()) {
        setCurrentStep(2);
        // Attendre un peu pour que l'installation se termine
        setTimeout(() => {
          setIsInstalling(false);
        }, 2000);
      } else {
        setIsInstalling(false);
        // Afficher les instructions manuelles
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      setIsInstalling(false);
      setCurrentStep(3);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // S'abonner aux notifications push
        await subscribeToPush();
        setShowPrompt(false);
        onInstallComplete?.();
      }
    } catch (error) {
      console.error('Erreur permission notifications:', error);
    }
  };

  const handleSkip = () => {
    if (!isStudent) {
      setShowPrompt(false);
      onSkip?.();
      return;
    }

    // Pour les étudiants, l'installation est obligatoire
    alert('L\'installation de l\'application est obligatoire pour accéder à la plateforme étudiante.');
  };

  if (!showPrompt || !isStudent) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🎓 Installation Obligatoire</h2>
            {!isStudent && (
              <button 
                onClick={handleSkip}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            )}
          </div>
          <p className="text-orange-100 mt-2">
            Configuration requise pour les étudiants
          </p>
        </div>

        <div className="p-6">
          {/* Étape 1: Installation PWA */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="mx-auto h-16 w-16 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Installer l'Application INSTI
                </h3>
                <p className="text-gray-600 mb-4">
                  Pour accéder à la plateforme, vous devez installer l'application 
                  sur votre appareil. Cela vous permettra de recevoir des notifications 
                  importantes concernant vos stages.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Avantages :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Accès rapide depuis votre écran d'accueil</li>
                  <li>• Notifications push en temps réel</li>
                  <li>• Fonctionne même hors ligne</li>
                  <li>• Interface optimisée mobile</li>
                </ul>
              </div>

              <div className="space-y-3">
                {isInstallable ? (
                  <button
                    onClick={handleInstallPWA}
                    disabled={isInstalling}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isInstalling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Installation en cours...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2" size={20} />
                        Installer l'Application
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">
                      Le bouton d'installation automatique n'est pas disponible.
                    </p>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-orange-500 hover:text-orange-600 font-semibold"
                    >
                      Voir les instructions manuelles →
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Cette installation est obligatoire pour tous les étudiants
                </p>
              </div>
            </div>
          )}

          {/* Étape 2: Permissions de notification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Bell className="mx-auto h-16 w-16 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Activer les Notifications
                </h3>
                <p className="text-gray-600 mb-4">
                  Autorisez les notifications pour recevoir des informations 
                  importantes sur vos stages en temps réel.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Important :</h4>
                <p className="text-sm text-yellow-800">
                  Les notifications sont essentielles pour vous tenir informé des 
                  échéances, des nouvelles opportunités de stage et des communications 
                  administratives urgentes.
                </p>
              </div>

              <button
                onClick={handleNotificationPermission}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center"
              >
                <Bell className="mr-2" size={20} />
                Autoriser les Notifications
              </button>

              {notificationPermission === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    Les notifications ont été refusées. Vous devez les activer 
                    manuellement dans les paramètres de votre navigateur.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Instructions manuelles */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield className="mx-auto h-16 w-16 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Installation Manuelle
                </h3>
                <p className="text-gray-600 mb-4">
                  Suivez ces étapes pour installer l'application :
                </p>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Sur Chrome (Android/PC) :</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Cliquez sur le menu (⋮) en haut à droite</li>
                    <li>Sélectionnez "Installer l'application"</li>
                    <li>Confirmez l'installation</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Sur Safari (iOS) :</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Cliquez sur le bouton de partage (□↗)</li>
                    <li>Sélectionnez "Sur l'écran d'accueil"</li>
                    <li>Confirmez l'ajout</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600"
              >
                J'ai installé l'application
              </button>
            </div>
          )}

          {/* Étape de succès */}
          {checkInstallation() && notificationPermission === 'granted' && (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Configuration Terminée !
              </h3>
              <p className="text-gray-600">
                Vous pouvez maintenant accéder à la plateforme INSTI.
              </p>
              <button
                onClick={() => {
                  setShowPrompt(false);
                  onInstallComplete?.();
                }}
                className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-600"
              >
                Continuer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
