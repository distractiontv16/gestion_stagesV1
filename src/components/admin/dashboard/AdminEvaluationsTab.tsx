import React from 'react';

const AdminEvaluationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Évaluations des Stages</h2>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-800">Module en Cours de Développement</h3>
          <p className="mt-2 text-gray-600">
            La section dédiée à la gestion et au suivi des évaluations de stages est actuellement en phase de conception et sera disponible prochainement.
          </p>
          <p className="mt-1 text-gray-600">
            Elle permettra de centraliser les fiches d'évaluation, suivre les validations, et générer des synthèses.
          </p>
        </div>
      </div>

      {/* On pourrait ajouter ici des sections pour, par exemple:
          - Télécharger le modèle de fiche d'évaluation
          - Voir des statistiques globales sur les évaluations passées (si applicable)
       */}
    </div>
  );
};

export default AdminEvaluationsTab; 