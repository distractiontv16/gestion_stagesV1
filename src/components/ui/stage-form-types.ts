// Interface publique pour le type StageFormData
export interface StageFormData {
  // Onglet 1: Informations sur l'Entreprise
  departement: string;
  commune: string;
  quartier: string;
  nomEntreprise: string;
  dateDebutStage: string;
  dateFinStage: string;
  
  // Onglet 2: Informations sur l'Étudiant
  filiere: string;
  prenom: string;
  nom: string;
  telephone: string;
  themeMemoire: string;
  
  // Onglet 3: Informations sur le Maître de Stage
  nomMaitreStage: string;
  prenomMaitreStage: string;
  telephoneMaitreStage: string;
  emailMaitreStage: string;
  fonctionMaitreStage: string;
  
  // Onglet 4: Informations sur le Maître de Mémoire
  nomMaitreMemoire: string;
  telephoneMaitreMemoire: string;
  emailMaitreMemoire: string;
  statutMaitreMemoire: 'Permanent' | 'Vacataire' | '';
} 