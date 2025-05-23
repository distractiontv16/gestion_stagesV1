import {
    UsersIcon,
    ClipboardListIcon,
    BellIcon,
    BriefcaseIcon,
    BookOpenIcon,
    SettingsIcon,
    HomeIcon // Ajout de HomeIcon pour le tableau de bord
  } from 'lucide-react';
  
  interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    adminFullName: string;
  }
  
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: HomeIcon },
    { id: 'students', label: 'Étudiants', icon: UsersIcon },
    { id: 'evaluations', label: 'Évaluations', icon: ClipboardListIcon },
    { id: 'proposals', label: 'Propositions de stages', icon: BriefcaseIcon },
    { id: 'projets', label: 'Projets', icon: BookOpenIcon },
    { id: 'parametres', label: 'Paramètres', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];
  
  const AdminSidebar = ({ activeTab, setActiveTab, adminFullName }: AdminSidebarProps) => {
    return (
      <aside className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:flex md:flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">INSTI Stages</h1>
          <p className="text-gray-400 text-sm mt-1">Portail Administrateur</p>
          {adminFullName && (
            <p className="text-white font-semibold mt-3 truncate" title={adminFullName}>
                {adminFullName}
            </p>
           )}
        </div>
  
        <nav className="flex-grow p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out
                    ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-700">
            {/* Vous pouvez ajouter un lien vers le profil de l'admin ou d'autres actions ici si nécessaire */}
            <p className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} INSTI Stages</p>
        </div>
      </aside>
    );
  };
  
  export default AdminSidebar; 