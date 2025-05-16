"use client";

import React from 'react';
import { 
  InputField, 
  DisabledField, 
  TextareaField,
  SelectField
} from './form-components';
import { StageFormData } from './stage-form-types';

// Composant d'informations sur l'entreprise
export const EntrepriseForm = ({ 
  formData, 
  handleChange, 
  errors 
}: { 
  formData: StageFormData; 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  errors: Partial<Record<keyof StageFormData, string>>;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField 
        label="Département" 
        id="departement" 
        name="departement" 
        value={formData.departement} 
        onChange={handleChange} 
        error={errors.departement} 
        placeholder="Ex: Dakar" 
      />
      
      <InputField 
        label="Commune" 
        id="commune" 
        name="commune" 
        value={formData.commune} 
        onChange={handleChange} 
        error={errors.commune} 
        placeholder="Ex: Dakar Plateau" 
      />
      
      <InputField 
        label="Quartier" 
        id="quartier" 
        name="quartier" 
        value={formData.quartier} 
        onChange={handleChange} 
        error={errors.quartier} 
        placeholder="Ex: Point E" 
      />
    </div>
    
    <InputField 
      label="Nom de l'entreprise" 
      id="nomEntreprise" 
      name="nomEntreprise" 
      value={formData.nomEntreprise} 
      onChange={handleChange} 
      error={errors.nomEntreprise} 
      placeholder="Nom de l'entreprise" 
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField 
        label="Date de début de stage" 
        id="dateDebutStage" 
        name="dateDebutStage" 
        value={formData.dateDebutStage} 
        onChange={handleChange} 
        error={errors.dateDebutStage} 
        type="date" 
      />
      
      <InputField 
        label="Date de fin de stage" 
        id="dateFinStage" 
        name="dateFinStage" 
        value={formData.dateFinStage} 
        onChange={handleChange} 
        error={errors.dateFinStage} 
        type="date" 
        required={false}
      />
    </div>
  </div>
);

// Composant d'informations sur l'étudiant
export const EtudiantForm = ({ 
  formData, 
  handleChange, 
  errors 
}: { 
  formData: StageFormData; 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  errors: Partial<Record<keyof StageFormData, string>>;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DisabledField 
        label="Filière/Spécialité" 
        id="filiere" 
        name="filiere" 
        value={formData.filiere} 
      />
      
      <DisabledField 
        label="Prénom" 
        id="prenom" 
        name="prenom" 
        value={formData.prenom} 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DisabledField 
        label="Nom" 
        id="nom" 
        name="nom" 
        value={formData.nom} 
      />
      
      <DisabledField 
        label="Numéro de téléphone" 
        id="telephone" 
        name="telephone" 
        value={formData.telephone} 
      />
    </div>
    
    <TextareaField 
      label="Thème de fin d'études" 
      id="themeMemoire" 
      name="themeMemoire" 
      value={formData.themeMemoire} 
      onChange={handleChange} 
      error={errors.themeMemoire} 
      placeholder="Décrivez votre thème de fin d'études" 
    />
  </div>
);

// Composant d'informations sur le maître de stage
export const MaitreStageForm = ({ 
  formData, 
  handleChange, 
  errors 
}: { 
  formData: StageFormData; 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  errors: Partial<Record<keyof StageFormData, string>>;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField 
        label="Nom" 
        id="nomMaitreStage" 
        name="nomMaitreStage" 
        value={formData.nomMaitreStage} 
        onChange={handleChange} 
        error={errors.nomMaitreStage} 
        placeholder="Nom du maître de stage" 
      />
      
      <InputField 
        label="Prénom" 
        id="prenomMaitreStage" 
        name="prenomMaitreStage" 
        value={formData.prenomMaitreStage} 
        onChange={handleChange} 
        error={errors.prenomMaitreStage} 
        placeholder="Prénom du maître de stage" 
      />
    </div>
    
    <InputField 
      label="Numéro de téléphone" 
      id="telephoneMaitreStage" 
      name="telephoneMaitreStage" 
      value={formData.telephoneMaitreStage} 
      onChange={handleChange} 
      error={errors.telephoneMaitreStage} 
      placeholder="Numéro de téléphone du maître de stage" 
      type="tel"
    />
    
    <InputField 
      label="Email" 
      id="emailMaitreStage" 
      name="emailMaitreStage" 
      value={formData.emailMaitreStage} 
      onChange={handleChange} 
      error={errors.emailMaitreStage} 
      placeholder="Email du maître de stage" 
      type="email"
    />
    
    <InputField 
      label="Fonction/Poste" 
      id="fonctionMaitreStage" 
      name="fonctionMaitreStage" 
      value={formData.fonctionMaitreStage} 
      onChange={handleChange} 
      error={errors.fonctionMaitreStage} 
      placeholder="Fonction/Poste du maître de stage" 
    />
  </div>
);

// Composant d'informations sur le maître de mémoire
export const MaitreMemoireForm = ({ 
  formData, 
  handleChange, 
  errors 
}: { 
  formData: StageFormData; 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  errors: Partial<Record<keyof StageFormData, string>>;
}) => (
  <div className="space-y-4">
    <InputField 
      label="Nom et prénom" 
      id="nomMaitreMemoire" 
      name="nomMaitreMemoire" 
      value={formData.nomMaitreMemoire} 
      onChange={handleChange} 
      error={errors.nomMaitreMemoire} 
      placeholder="Nom et prénom du maître de mémoire" 
    />
    
    <InputField 
      label="Numéro de téléphone" 
      id="telephoneMaitreMemoire" 
      name="telephoneMaitreMemoire" 
      value={formData.telephoneMaitreMemoire} 
      onChange={handleChange} 
      error={errors.telephoneMaitreMemoire} 
      placeholder="Numéro de téléphone du maître de mémoire" 
      type="tel"
    />
    
    <InputField 
      label="Email" 
      id="emailMaitreMemoire" 
      name="emailMaitreMemoire" 
      value={formData.emailMaitreMemoire} 
      onChange={handleChange} 
      error={errors.emailMaitreMemoire} 
      placeholder="Email du maître de mémoire" 
      type="email"
    />
    
    <SelectField 
      label="Statut" 
      id="statutMaitreMemoire" 
      name="statutMaitreMemoire" 
      value={formData.statutMaitreMemoire} 
      onChange={handleChange} 
      error={errors.statutMaitreMemoire} 
      options={[
        { value: "", label: "Sélectionnez un statut" },
        { value: "Permanent", label: "Permanent" },
        { value: "Vacataire", label: "Vacataire" }
      ]}
    />
  </div>
); 