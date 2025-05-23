import { UserInfo } from '@/pages/student/Dashboard'; // Ajustez le chemin si nécessaire

interface HeaderProps {
  studentInfo: UserInfo;
  handleLogout: () => void;
  toggleSidebar: () => void; // Pour afficher/cacher la sidebar sur mobile
}

const Header = ({ studentInfo, handleLogout, toggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Bouton pour afficher la sidebar sur mobile */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div className="h-9 w-9 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">IS</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">INSTI Stages</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-sm font-medium">{studentInfo.prenom} {studentInfo.nom}</p>
              <p className="text-xs text-gray-500">{studentInfo.filiere || 'Étudiant'}</p>
            </div>
            
            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{studentInfo.prenom?.[0] || ''}{studentInfo.nom?.[0] || ''}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-30">
                <div className="py-2 px-4 border-b border-gray-100">
                  <p className="font-medium truncate">{studentInfo.prenom} {studentInfo.nom}</p>
                  <p className="text-sm text-gray-500 truncate">{studentInfo.matricule}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 