"use client";

import { useState } from "react";
import { SunIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  matricule: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    matricule: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Réinitialiser l'erreur d'authentification lorsque l'utilisateur modifie les champs
    if (authError) setAuthError(null);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
    let valid = true;

    // Validation matricule
    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
      valid = false;
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      setIsSubmitting(true);
      setAuthError(null);
      
      try {
        // Nettoyer le matricule des espaces et tabulations
        const cleanMatricule = formData.matricule.trim();
        
        console.log('Tentative de connexion avec:', {
          matricule: cleanMatricule,
          password: formData.password
        });
        
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matricule: cleanMatricule, // Utiliser le matricule nettoyé
            password: formData.password
          }),
        });

        const data = await response.json();
        console.log('Réponse du serveur:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la connexion');
        }

        // Stocker le token JWT dans le localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          
          // Redirection basée sur le rôle
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setAuthError(error instanceof Error ? error.message : 'Identifiants incorrects');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl shadow-xl">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center gap-3">
            <SunIcon className="h-8 w-8" />
            <h1 className="text-2xl font-semibold">Connexion</h1>
          </div>
          <p className="mt-2 opacity-90">
            Plateforme de Gestion des Stages - INSTI
          </p>
        </div>

        <div className="bg-white p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {authError && (
              <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {authError}
              </div>
            )}
            
            <div>
              <label htmlFor="matricule" className="block text-sm mb-2 font-medium">
                Matricule
              </label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.matricule ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={!!errors.matricule}
                placeholder="54036STI22"
              />
              {errors.matricule && (
                <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={!!errors.password}
                placeholder="Entrez votre mot de passe"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Mot de passe oublié?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors mt-3 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Connexion en cours...</span>
              ) : (
                <span>Se connecter</span>
              )}
            </button>

            <div className="text-center text-gray-600 text-sm mt-4">
              Pas encore inscrit?{" "}
              <a href="/register" className="text-blue-600 font-medium hover:underline">
                Créez votre compte
              </a>
            </div>
            
            <div className="text-center text-gray-600 text-sm mt-2">
              <a href="/admin/login" className="text-blue-600 font-medium hover:underline">
                Accès administrateur
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 