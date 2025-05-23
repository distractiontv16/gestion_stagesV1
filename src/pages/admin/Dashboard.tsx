import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';
import { AdminProjetsTab } from '../../components/ui/admin-projets-tab';
import { AdminDashboardOverview } from '../../components/ui/admin-dashboard-overview';
import { AdminStudentsTab } from '../../components/ui/admin-students-tab';
import { AdminParametresTab } from '../../components/ui/admin-parametres-tab';
import { AdminSystemParams } from '../../components/ui/admin-system-params';
import AdminSidebar from '../../components/admin/dashboard/AdminSidebar';
import AdminHeader from '../../components/admin/dashboard/AdminHeader';
import AdminProposalsTab from '../../components/admin/dashboard/AdminProposalsTab';
import AdminNotificationsTab from '../../components/admin/dashboard/AdminNotificationsTab';
import AdminEvaluationsTab from '../../components/admin/dashboard/AdminEvaluationsTab';

// Interface pour les informations d'utilisateur
interface UserInfo {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  matricule: string;
  role?: string;
}

const tabLabels: { [key: string]: string } = {
  dashboard: 'Tableau de Bord',
  students: 'Gestion des Étudiants',
  evaluations: 'Évaluations',
  proposals: 'Propositions de Stages',
  projets: 'Gestion des Projets',
  parametres: 'Paramètres du Compte',
  notifications: 'Notifications',
  'system-params': 'Paramètres Système',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<UserInfo>({
    nom: '',
    prenom: '',
    matricule: '',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar toggle
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        let apiUrl = '/api/auth/me';
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Échec de récupération des informations utilisateur');
        }
        const data = await response.json();
        if (data.success && data.data) {
          if (data.data.role !== 'admin') {
            navigate('/student/dashboard');
            return;
          }
          setAdminInfo({
            id: data.data.id,
            nom: data.data.nom || '',
            prenom: data.data.prenom || '',
            email: data.data.email || '',
            matricule: data.data.matricule || '',
            role: data.data.role
          });
        } else {
          console.error('Données invalides reçues:', data);
          setError('Impossible de charger les informations administrateur');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données administrateur:', err);
        setError('Erreur lors du chargement des données administrateur');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-4">Erreur</h2>
          <p className="mb-6">{error}</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => navigate('/login')}
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }
  
  const currentTabLabel = tabLabels[activeTab] || 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* AdminSidebar does not take isSidebarOpen for fixed desktop display */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        adminFullName={`${adminInfo.prenom} ${adminInfo.nom}`} 
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader 
          activeTabLabel={currentTabLabel} 
          adminMatricule={adminInfo.matricule}
          handleLogout={handleLogout} 
          toggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isMobileSidebarOpen={isSidebarOpen} // Pass state for mobile burger menu icon state
        />
        <main className="p-6 flex-1 overflow-auto">
          {activeTab === 'dashboard' && <AdminDashboardOverview />}
          {activeTab === 'students' && <AdminStudentsTab />}
          {activeTab === 'projets' && <AdminProjetsTab />}
          {activeTab === 'proposals' && (
            <AdminProposalsTab />
          )}
          {activeTab === 'notifications' && <AdminNotificationsTab />}
          {activeTab === 'evaluations' && <AdminEvaluationsTab />}
          {activeTab === 'parametres' && <AdminParametresTab />}
          {activeTab === 'system-params' && <AdminSystemParams />}
        </main>
      </div>
      {/* Mobile Sidebar - Conditionally rendered based on isSidebarOpen */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 z-30 bg-gray-900 bg-opacity-75 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        >
            <div 
                className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white p-4 transform transition-transform ease-in-out duration-300"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside sidebar
            >
                {/* We can reuse AdminSidebar here or create a specific MobileAdminSidebar */}
                {/* For now, let's assume AdminSidebar can be styled for mobile or we make a new one later */}
                <AdminSidebar 
                    activeTab={activeTab} 
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setIsSidebarOpen(false); // Close sidebar on tab selection
                    }} 
                    adminFullName={`${adminInfo.prenom} ${adminInfo.nom}`} 
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 