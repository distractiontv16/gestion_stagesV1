"use client";

import { useState } from "react";
import { SunIcon } from "lucide-react";

// Types pour notre formulaire
interface IUserRegistration {
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
  matricule: string;
  filiereId: string;
  password: string;
  confirmPassword: string;
}

// Liste des filières
const filieres = [
  { id: "1", nom: "GEI/EE" },
  { id: "2", nom: "GEI/IT" },
  { id: "3", nom: "GE/ER" },
  { id: "4", nom: "GMP" },
  { id: "5", nom: "MSY/MI" },
  { id: "6", nom: "ER/SE" },
  { id: "7", nom: "GC/A" },
  { id: "8", nom: "GC/B" },
  { id: "9", nom: "MSY/MA" },
  { id: "10", nom: "GE/FC" },
];

export const SignupForm = () => {
  // État initial du formulaire
  const [formData, setFormData] = useState<IUserRegistration>({
    nom: "",
    prenom: "",
    telephone: "",
    whatsapp: "",
    matricule: "",
    filiereId: "",
    password: "",
    confirmPassword: "",
  });

  // État des erreurs
  const [errors, setErrors] = useState<Partial<Record<keyof IUserRegistration, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Gestion des changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Partial<Record<keyof IUserRegistration, string>> = {};
    let valid = true;

    // Validation nom et prénom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
      valid = false;
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
      valid = false;
    }

    // Validation téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le numéro de téléphone est requis";
      valid = false;
    } else if (!/^\d{8,}$/.test(formData.telephone)) {
      newErrors.telephone = "Le numéro de téléphone doit avoir au moins 8 chiffres";
      valid = false;
    }

    // Validation matricule
    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
      valid = false;
    }

    // Validation filière
    if (!formData.filiereId) {
      newErrors.filiereId = "Veuillez sélectionner une filière";
      valid = false;
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      valid = false;
    }

    // Validation confirmation de mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    setSubmitted(true);

    if (isValid) {
      // Logique d'envoi des données au serveur
      console.log("Formulaire soumis :", formData);
      alert("Inscription réussie !");
      
      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        whatsapp: "",
        matricule: "",
        filiereId: "",
        password: "",
        confirmPassword: "",
      });
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Créez votre compte étudiant</h1>
          <p className="text-gray-600">Remplissez le formulaire ci-dessous pour vous inscrire</p>
        </div>

        <div className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {/* Prénom */}
            <div>
              <label htmlFor="prenom" className="block text-sm mb-2">
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.prenom ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.prenom && (
                <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm mb-2">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.nom ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nom && (
                <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                placeholder="Votre numéro de téléphone"
                value={formData.telephone}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.telephone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.telephone && (
                <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm mb-2">
                WhatsApp (si différent)
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                placeholder="Numéro WhatsApp (optionnel)"
                value={formData.whatsapp}
                onChange={handleChange}
                className="text-sm w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Filière */}
            <div>
              <label htmlFor="filiereId" className="block text-sm mb-2">
                Filière
              </label>
              <select
                id="filiereId"
                name="filiereId"
                value={formData.filiereId}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.filiereId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Sélectionnez une filière</option>
                {filieres.map(filiere => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
              {errors.filiereId && (
                <p className="text-red-500 text-xs mt-1">{errors.filiereId}</p>
              )}
            </div>

            {/* Matricule */}
            <div>
              <label htmlFor="matricule" className="block text-sm mb-2">
                Matricule
              </label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                placeholder="Votre matricule"
                value={formData.matricule}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.matricule ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.matricule && (
                <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors mt-4"
            >
              S'inscrire
            </button>

            <div className="text-center text-gray-600 text-sm mt-4">
              Déjà inscrit? <a href="/login" className="text-blue-600 font-medium hover:underline">Connectez-vous ici</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 