import { UserInfo } from '@/pages/student/Dashboard'; // Ajustez si UserInfo est déplacée

interface ProfileTabProps {
  studentInfo: UserInfo;
}

const ProfileTab = ({ studentInfo }: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Mon profil étudiant</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
            {studentInfo.prenom?.[0] || ''}{studentInfo.nom?.[0] || ''}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{studentInfo.prenom} {studentInfo.nom}</h3>
            <p className="text-gray-600 text-lg">{studentInfo.filiere}</p>
            <p className="text-sm text-gray-500 mt-1">Matricule: {studentInfo.matricule}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Informations personnelles</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-medium text-gray-800">{studentInfo.prenom} {studentInfo.nom}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Filière</p>
              <p className="font-medium text-gray-800">{studentInfo.filiere}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Matricule</p>
              <p className="font-medium text-gray-800">{studentInfo.matricule}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Coordonnées</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{studentInfo.email || 'Non renseigné'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="font-medium text-gray-800">{studentInfo.telephone || 'Non renseigné'}</p>
            </div>
            
            {studentInfo.whatsapp && (
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-medium text-gray-800">{studentInfo.whatsapp}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab; 