import { InternshipOffer } from '@/types'; // Importer depuis les types globaux

interface FindInternshipTabProps {
  hasFoundInternship: boolean | null;
  handleInternshipStatusChange: (status: boolean) => void;
  internshipOffers: InternshipOffer[]; // Utilisation de l'interface InternshipOffer
}

const FindInternshipTab = ({
  hasFoundInternship,
  handleInternshipStatusChange,
  internshipOffers,
}: FindInternshipTabProps) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">Trouver un Stage</h2>

      {/* Statut de recherche de stage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-5">Avez-vous déjà trouvé un stage ?</h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            className={`w-full sm:w-auto flex-1 px-6 py-3 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
              ${
                hasFoundInternship === true
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => handleInternshipStatusChange(true)}
          >
            Oui, j'ai trouvé un stage
          </button>
          <button
            className={`w-full sm:w-auto flex-1 px-6 py-3 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
              ${
                hasFoundInternship === false
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => handleInternshipStatusChange(false)}
          >
            Non, je cherche encore
          </button>
        </div>

        {hasFoundInternship === true && (
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <p className="text-green-700 font-medium">
              Excellent ! N'oubliez pas de remplir le formulaire d'information de stage dans l'onglet "Informations de Stage".
            </p>
          </div>
        )}

        {hasFoundInternship === false && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <p className="text-blue-700 font-medium">
              Consultez les propositions de stages ci-dessous. Elles sont sélectionnées selon votre profil et votre filière.
            </p>
          </div>
        )}
      </div>

      {/* Propositions de stages */}
      {hasFoundInternship === false && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-5">Propositions de stages adaptées à votre profil</h3>
          {internshipOffers.length > 0 ? (
            <div className="space-y-5">
              {internshipOffers.map(offer => (
                <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg text-blue-700">{offer.titre}</h4>
                      <p className="text-gray-800 font-medium text-md">{offer.entreprise_nom}</p>
                      <p className="text-gray-600 text-sm mt-1">{offer.location} • <span className="font-medium">Durée: {offer.duration}</span></p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out self-start sm:self-center whitespace-nowrap">
                      Voir l'offre et Postuler
                    </button>
                  </div>
                  <p className="mt-3 text-gray-700 text-sm leading-relaxed">{offer.description}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compétences requises:</span>
                    <p className="text-sm text-gray-600 mt-1">{offer.requirements}</p>
                  </div>
                </div>
              ))}
            </div>
             ) : (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l-4-4m0 0l4-4m-4 4h18" /> {/* Exemple d'icône, peut être remplacée */} 
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune offre pour le moment</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Nous n'avons pas de propositions de stage correspondant à votre profil pour l'instant. Revenez plus tard !
                </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindInternshipTab; 