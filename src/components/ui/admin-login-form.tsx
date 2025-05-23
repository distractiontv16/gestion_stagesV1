import { useState } from "react";
import { SunIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminLoginFormData {
  matricule: string;
  password: string;
}

export const AdminLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdminLoginFormData>({
    matricule: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AdminLoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Reset auth error when user modifies fields
    if (authError) setAuthError(null);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof AdminLoginFormData, string>> = {};
    let valid = true;

    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
      valid = false;
    }

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
        const cleanMatricule = formData.matricule.trim();
        
        const response = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matricule: cleanMatricule,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la connexion');
        }

        // Store JWT token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/admin/dashboard');
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
        <div className="bg-blue-800 text-white p-6">
          <div className="flex items-center gap-3">
            <SunIcon className="h-8 w-8" />
            <h1 className="text-2xl font-semibold">Administration</h1>
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
                placeholder="ADMIN001"
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

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors mt-3 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Connexion en cours...</span>
              ) : (
                <span>Se connecter</span>
              )}
            </button>

            <div className="text-center text-gray-600 text-sm mt-4">
              <a href="/login" className="text-blue-600 font-medium hover:underline">
                Retour à la page de connexion étudiant
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 