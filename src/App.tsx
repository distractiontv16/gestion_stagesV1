import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';

// Importation dynamique des pages
const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const AdminLoginPage = lazy(() => import('./pages/admin-login'));

// Pages étudiants
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));

// Pages admin
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));

// Composant de chargement
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Routes étudiants */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          
          {/* Routes admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
