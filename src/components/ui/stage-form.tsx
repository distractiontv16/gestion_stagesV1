"use client";

import React, { useState } from 'react';
import { StageFormData } from './stage-form-types';

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
    
    filiere: 'GEI/IT', // Valeurs préremplies (à remplacer par les données réelles de l'utilisateur)
    prenom: 'Mamadou',
    nom: 'Diallo',
    telephone: '771234567',
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
        newErrors.nomMaitreMemoire = 'Le nom et prénom du maître de mémoire sont requis';
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
  
  // Navigation entre les onglets
  const goToNextTab = () => {
    if (validateCurrentTab()) {
      setCurrentTab(prev => prev + 1);
    }
  };
  
  const goToPrevTab = () => {
    setCurrentTab(prev => prev - 1);
  };
  
  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentTab()) {
      // Envoyer les données au serveur
      console.log('Données du formulaire:', formData);
      alert('Formulaire soumis avec succès!');
      // Rediriger ou réinitialiser le formulaire ici
    }
  };
  
  // Titres des onglets
  const tabTitles = [
    'Informations sur l\'Entreprise',
    'Informations sur l\'Étudiant',
    'Informations sur le Maître de Stage',
    'Informations sur le Maître de Mémoire'
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
      <form className="p-6" onSubmit={handleSubmit}>
        {/* Contenu dynamique de l'onglet actif */}
        {renderTabContent()}
        
        {/* Boutons de navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={goToPrevTab}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              currentTab === 0 ? 'invisible' : ''
            }`}
          >
            Précédent
          </button>
          
          {currentTab < 3 ? (
            <button
              type="button"
              onClick={goToNextTab}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Soumettre
            </button>
          )}
        </div>
      </form>
    </div>
  );
}; 