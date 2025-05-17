"use client";

import React, { useState, useEffect } from 'react';
import { StageFormData } from './stage-form-types';
import { SuccessModal } from './success-modal';

// Importation des composants d'onglets
import {
  EntrepriseForm,
  EtudiantForm,
  MaitreStageForm,
  MaitreMemoireForm
} from './stage-form-tabs';

export const StageForm = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [formData, setFormData] = useState<StageFormData>({
    // Initialisation des champs
    departement: '',
    commune: '',
    quartier: '',
    nomEntreprise: '',
    dateDebutStage: '',
    dateFinStage: '',
    
    filiere: '', 
    prenom: '',
    nom: '',
    telephone: '',
    themeMemoire: '',
    
    nomMaitreStage: '',
    prenomMaitreStage: '',
    telephoneMaitreStage: '',
    emailMaitreStage: '',
    fonctionMaitreStage: '',
    
    nomMaitreMemoire: '',
    telephoneMaitreMemoire: '',
    emailMaitreMemoire: '',
    statutMaitreMemoire: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof StageFormData, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [stageExists, setStageExists] = useState<boolean>(false);
  
  // Gérer les changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name as keyof StageFormData]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  // Récupérer les informations de l'utilisateur et du stage existant au chargement
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Récupération des données de l'utilisateur
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            // Trouver le nom de la filière à partir de l'ID
            let filiereName = '';
            if (userData.data.filiere_id) {
              const filieres = [
                { id: 1, nom: 'GEI/EE' },
                { id: 2, nom: 'GEI/IT' },
                { id: 3, nom: 'GE/ER' },
                { id: 4, nom: 'GMP' },
                { id: 5, nom: 'MSY/MI' },
                { id: 6, nom: 'ER/SE' },
                { id: 7, nom: 'GC/A' },
                { id: 8, nom: 'GC/B' },
                { id: 9, nom: 'MSY/MA' },
                { id: 10, nom: 'GE/FC' },
              ];
              
              const filiere = filieres.find(f => f.id === userData.data.filiere_id);
              filiereName = filiere ? filiere.nom : '';
            }
            
            // Remplir les données de l'étudiant
            setFormData(prevData => ({
              ...prevData,
              prenom: userData.data.prenom || '',
              nom: userData.data.nom || '',
              telephone: userData.data.telephone || '',
              filiere: filiereName || ''
            }));
            
            // Vérifier si un stage existe déjà pour cet étudiant
            const stageResponse = await fetch(`/api/internships/user/${userData.data.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (stageResponse.ok) {
              const stageData = await stageResponse.json();
              if (stageData.success && stageData.data) {
                // Stage existant, remplir le formulaire avec les données existantes
                setStageExists(true);
                setFormData(prevData => ({
                  ...prevData,
                  departement: stageData.data.departement || '',
                  commune: stageData.data.commune || '',
                  quartier: stageData.data.quartier || '',
                  nomEntreprise: stageData.data.nom_entreprise || '',
                  dateDebutStage: stageData.data.date_debut ? new Date(stageData.data.date_debut).toISOString().split('T')[0] : '',
                  dateFinStage: stageData.data.date_fin ? new Date(stageData.data.date_fin).toISOString().split('T')[0] : '',
                  themeMemoire: stageData.data.theme_memoire || '',
                  
                  nomMaitreStage: stageData.data.nom_maitre_stage || '',
                  prenomMaitreStage: stageData.data.prenom_maitre_stage || '',
                  telephoneMaitreStage: stageData.data.telephone_maitre_stage || '',
                  emailMaitreStage: stageData.data.email_maitre_stage || '',
                  fonctionMaitreStage: stageData.data.fonction_maitre_stage || '',
                  
                  nomMaitreMemoire: stageData.data.nom_maitre_memoire || '',
                  telephoneMaitreMemoire: stageData.data.telephone_maitre_memoire || '',
                  emailMaitreMemoire: stageData.data.email_maitre_memoire || '',
                  statutMaitreMemoire: stageData.data.statut_maitre_memoire || ''
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  // Valider l'onglet actuel
  const validateCurrentTab = (): boolean => {
    const newErrors: Partial<Record<keyof StageFormData, string>> = {};
    let isValid = true;
    
    // Validation de l'onglet 1: Informations sur l'Entreprise
    if (currentTab === 0) {
      if (!formData.departement) {
        newErrors.departement = 'Le département est requis';
        isValid = false;
      }
      
      if (!formData.commune) {
        newErrors.commune = 'La commune est requise';
        isValid = false;
      }
      
      if (!formData.quartier) {
        newErrors.quartier = 'Le quartier est requis';
        isValid = false;
      }
      
      if (!formData.nomEntreprise) {
        newErrors.nomEntreprise = "Le nom de l'entreprise est requis";
        isValid = false;
      }
      
      if (!formData.dateDebutStage) {
        newErrors.dateDebutStage = 'La date de début est requise';
        isValid = false;
      }
      
      // La date de fin n'est plus requise
      if (formData.dateFinStage && formData.dateDebutStage && 
          new Date(formData.dateFinStage) <= new Date(formData.dateDebutStage)) {
        newErrors.dateFinStage = 'La date de fin doit être après la date de début';
        isValid = false;
      }
    }
    
    // Validation de l'onglet 2: Informations sur l'Étudiant
    else if (currentTab === 1) {
      if (!formData.themeMemoire) {
        newErrors.themeMemoire = 'Le thème de fin d\'études est requis';
        isValid = false;
      }
    }
    
    // Validation de l'onglet 3: Informations sur le Maître de Stage
    else if (currentTab === 2) {
      if (!formData.nomMaitreStage) {
        newErrors.nomMaitreStage = 'Le nom du maître de stage est requis';
        isValid = false;
      }
      
      if (!formData.prenomMaitreStage) {
        newErrors.prenomMaitreStage = 'Le prénom du maître de stage est requis';
        isValid = false;
      }
      
      if (!formData.telephoneMaitreStage) {
        newErrors.telephoneMaitreStage = 'Le téléphone du maître de stage est requis';
        isValid = false;
      }
      
      if (!formData.emailMaitreStage) {
        newErrors.emailMaitreStage = 'L\'email du maître de stage est requis';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailMaitreStage)) {
        newErrors.emailMaitreStage = 'L\'email n\'est pas valide';
        isValid = false;
      }
      
      if (!formData.fonctionMaitreStage) {
        newErrors.fonctionMaitreStage = 'La fonction du maître de stage est requise';
        isValid = false;
      }
    }
    
    // Validation de l'onglet 4: Informations sur le Maître de Mémoire
    else if (currentTab === 3) {
      if (!formData.nomMaitreMemoire) {
        newErrors.nomMaitreMemoire = 'Le nom du maître de mémoire est requis';
        isValid = false;
      }
      
      if (!formData.telephoneMaitreMemoire) {
        newErrors.telephoneMaitreMemoire = 'Le téléphone du maître de mémoire est requis';
        isValid = false;
      }
      
      if (!formData.emailMaitreMemoire) {
        newErrors.emailMaitreMemoire = 'L\'email du maître de mémoire est requis';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailMaitreMemoire)) {
        newErrors.emailMaitreMemoire = 'L\'email n\'est pas valide';
        isValid = false;
      }
      
      if (!formData.statutMaitreMemoire) {
        newErrors.statutMaitreMemoire = 'Le statut du maître de mémoire est requis';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Gérer la navigation entre les onglets
  const handleNext = () => {
    if (validateCurrentTab()) {
      if (currentTab < tabTitles.length - 1) {
        setCurrentTab(currentTab + 1);
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };
  
  // Envoyer les données du formulaire
  const handleSubmit = async () => {
    if (!validateCurrentTab()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }
      
      const response = await fetch('/api/internships/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          // Afficher le modal de succès
          setShowSuccessModal(true);
        } else {
          console.error('Error submitting form:', responseData.message);
        }
      } else {
        const errorData = await response.json();
        console.error('Form submission error:', errorData);
        
        // Traitement des erreurs de validation
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors: Partial<Record<keyof StageFormData, string>> = {};
          errorData.errors.forEach((err: any) => {
            if (err.path) {
              validationErrors[err.path as keyof StageFormData] = err.msg;
            }
          });
          setErrors(validationErrors);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Liste des titres d'onglets
  const tabTitles = [
    "Entreprise",
    "Étudiant",
    "Maître de stage",
    "Maître de mémoire"
  ];
  
  // Rendu conditionnel du contenu de l'onglet actif
  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <EntrepriseForm formData={formData} handleChange={handleChange} errors={errors} />;
      case 1:
        return <EtudiantForm formData={formData} handleChange={handleChange} errors={errors} />;
      case 2:
        return <MaitreStageForm formData={formData} handleChange={handleChange} errors={errors} />;
      case 3:
        return <MaitreMemoireForm formData={formData} handleChange={handleChange} errors={errors} />;
      default:
        return null;
    }
  };
  
  // Modal de succès
  const successMessage = stageExists ? 
    "Vos informations de stage ont été mises à jour avec succès. Vous pouvez revenir les consulter ou les modifier à tout moment." : 
    "Vos informations de stage ont été enregistrées avec succès. Merci pour votre soumission! Vous pouvez revenir les consulter ou les modifier à tout moment.";
  
  // Afficher un loader pendant le chargement des données
  if (isLoading && formData.nom === '') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2">Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* En-tête avec indicateur de progression */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">Enregistrement de Stage</h2>
        <p className="text-sm opacity-90">Étape {currentTab + 1} sur 4: {tabTitles[currentTab]}</p>
        
        {/* Barre de progression */}
        <div className="w-full bg-blue-800 rounded-full h-2.5 mt-3">
          <div 
            className="bg-white h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentTab + 1) * 25}%` }}
          ></div>
        </div>
      </div>
      
      {/* Contenu du formulaire */}
      <div className="p-6">
        {renderTabContent()}
        
        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button 
            className={`px-4 py-2 rounded-md ${
              currentTab === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            onClick={handlePrevious}
            disabled={currentTab === 0}
          >
            Précédent
          </button>
          
          {currentTab < tabTitles.length - 1 ? (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              onClick={handleNext}
            >
              Suivant
            </button>
          ) : (
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                'Soumettre'
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Modal de succès */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        redirectPath="/student/dashboard"
      />
    </div>
  );
}; 