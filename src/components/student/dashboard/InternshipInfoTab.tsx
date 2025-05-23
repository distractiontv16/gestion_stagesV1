import { StageInfo } from '@/pages/student/Dashboard'; // Ajustez si StageInfo est déplacée

interface InternshipInfoTabProps {
  loadingStage: boolean;
  stageInfo: StageInfo | null;
  handleStartFormClick: () => void;
  formatDate: (dateString?: string) => string;
}

const InternshipInfoTab = ({
  loadingStage,
  stageInfo,
  handleStartFormClick,
  formatDate,
}: InternshipInfoTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Informations de Stage</h2>

      {loadingStage ? (
        <div className="py-8 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          <p className="ml-3 text-gray-600">Chargement des informations de stage...</p>
        </div>
      ) : stageInfo ? (
        <div className="space-y-8">
          <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-md font-medium text-green-700">
                  Vos informations de stage ont été soumises.
                </p>
                <p className="text-sm text-green-600">
                  Vous pouvez les modifier à tout moment en cliquant sur le bouton ci-dessous.
                </p>
              </div>
            </div>
          </div>

          {/* Informations sur l'entreprise */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-5 text-gray-700">Entreprise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <p className="text-sm text-gray-500">Nom de l'entreprise</p>
                <p className="font-medium text-gray-800">{stageInfo.nom_entreprise || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Département</p>
                <p className="font-medium text-gray-800">{stageInfo.departement || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commune</p>
                <p className="font-medium text-gray-800">{stageInfo.commune || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quartier</p>
                <p className="font-medium text-gray-800">{stageInfo.quartier || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de début</p>
                <p className="font-medium text-gray-800">{formatDate(stageInfo.date_debut)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de fin</p>
                <p className="font-medium text-gray-800">{formatDate(stageInfo.date_fin)}</p>
              </div>
            </div>
          </div>

          {/* Informations sur le thème */}
          {stageInfo.theme_memoire && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Thème de fin d'études</h3>
              <p className="text-gray-800 leading-relaxed">{stageInfo.theme_memoire}</p>
            </div>
          )}

          {/* Informations sur le maître de stage */}
          {(stageInfo.nom_maitre_stage || stageInfo.email_maitre_stage) && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-5 text-gray-700">Maître de stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {stageInfo.nom_maitre_stage && (
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-gray-800">{stageInfo.prenom_maitre_stage} {stageInfo.nom_maitre_stage}</p>
                  </div>
                )}
                {stageInfo.telephone_maitre_stage && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-800">{stageInfo.telephone_maitre_stage}</p>
                  </div>
                )}
                {stageInfo.email_maitre_stage && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{stageInfo.email_maitre_stage}</p>
                  </div>
                )}
                {stageInfo.fonction_maitre_stage && (
                  <div>
                    <p className="text-sm text-gray-500">Fonction</p>
                    <p className="font-medium text-gray-800">{stageInfo.fonction_maitre_stage}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations sur le maître de mémoire */}
          {(stageInfo.nom_maitre_memoire || stageInfo.email_maitre_memoire) && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-5 text-gray-700">Maître de mémoire</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {stageInfo.nom_maitre_memoire && (
                   <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium text-gray-800">{stageInfo.nom_maitre_memoire}</p>
                  </div>
                )}
                {stageInfo.telephone_maitre_memoire && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-800">{stageInfo.telephone_maitre_memoire}</p>
                  </div>
                )}
                {stageInfo.email_maitre_memoire && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{stageInfo.email_maitre_memoire}</p>
                  </div>
                )}
                {stageInfo.statut_maitre_memoire && (
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="font-medium text-gray-800">{stageInfo.statut_maitre_memoire}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              onClick={handleStartFormClick}
            >
              Modifier les informations
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-md shadow-sm mb-8 max-w-2xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 text-left">
                <p className="text-md font-medium text-yellow-800">
                  Aucune information de stage soumise pour le moment.
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Veuillez compléter le formulaire pour enregistrer les détails de votre stage.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md max-w-2xl mx-auto">
            <h3 className="font-semibold text-xl text-gray-800 mb-3">Prêt à enregistrer votre stage ?</h3>
            <p className="text-gray-600 mb-8">
              Cliquez sur le bouton ci-dessous pour commencer à remplir le formulaire avec les informations relatives à votre stage.
            </p>
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              onClick={handleStartFormClick}
            >
              Commencer le formulaire
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipInfoTab; 