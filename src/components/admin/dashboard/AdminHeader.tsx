import { MenuIcon } from 'lucide-react'; // Pour le bouton de menu mobile

interface AdminHeaderProps {
  activeTabLabel: string;
  adminMatricule?: string;
  handleLogout: () => void;
  toggleMobileSidebar?: () => void; // Optionnel, si vous ajoutez une sidebar mobile
  isMobileSidebarOpen?: boolean; // Optionnel
}

const AdminHeader = ({
  activeTabLabel,
  adminMatricule,
  handleLogout,
  toggleMobileSidebar,
  // isMobileSidebarOpen // Décommenter si utilisé
}: AdminHeaderProps) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="flex justify-between items-center p-4 h-16">
        <div className="flex items-center">
          {toggleMobileSidebar && (
            <button 
              onClick={toggleMobileSidebar} 
              className="md:hidden mr-3 p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Ouvrir le menu latéral"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 truncate">
            {activeTabLabel}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {adminMatricule && (
            <span className="text-sm text-gray-600 hidden sm:inline">
              Matricule: {adminMatricule}
            </span>
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out shadow-sm hover:shadow-md"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 