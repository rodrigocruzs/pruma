import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ContractorDetailPage from './pages/ContractorDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import AddContractorPage from './pages/AddContractorPage';
import EditContractorPage from './pages/EditContractorPage';
import BatchPaymentPage from './pages/BatchPaymentPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import PrestadorSignUpPage from './pages/PrestadorSignUpPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { supabase } from './lib/supabaseClient';

// Custom hook to set page title based on route
const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = 'Pruma';
    let pageTitle;

    switch (location.pathname) {
      case '/':
        pageTitle = `${baseTitle} | Gestão de Prestadores PJ`;
        break;
      case '/login':
        pageTitle = `${baseTitle} | Entrar`;
        break;
      case '/signup':
        pageTitle = `${baseTitle} | Criar Conta`;
        break;
      case '/prestador/signup':
        pageTitle = `${baseTitle} | Cadastro de Prestador`;
        break;
      case '/onboarding':
        pageTitle = `${baseTitle} | Configuração Inicial`;
        break;
      case '/dashboard':
        pageTitle = `${baseTitle} | Dashboard`;
        break;
      case '/dashboard/pagamentos':
        pageTitle = `${baseTitle} | Pagamentos`;
        break;
      case '/dashboard/folha':
        pageTitle = `${baseTitle} | Folha de Pagamento`;
        break;
      case '/dashboard/adicionar-prestador':
        pageTitle = `${baseTitle} | Adicionar Prestador`;
        break;
      case '/dashboard/configuracoes':
        pageTitle = `${baseTitle} | Configurações`;
        break;
      default:
        if (location.pathname.includes('/dashboard/prestador/')) {
          if (location.pathname.includes('/editar')) {
            pageTitle = `${baseTitle} | Editar Prestador`;
          } else {
            pageTitle = `${baseTitle} | Detalhes do Prestador`;
          }
        } else {
          pageTitle = baseTitle;
        }
    }

    document.title = pageTitle;
  }, [location]);
};

// Component to handle public routes - redirects to dashboard if user is already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Title manager component that will be used inside the Router context
const TitleManager = () => {
  usePageTitle();
  return null;
};

const AppRoutes = () => {
  const { session } = useAuth();

  return (
    <BrowserRouter>
      <TitleManager />
      <Routes>
        {/* Public Routes with redirect for authenticated users */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        } />
        
        {/* Special public route that doesn't redirect */}
        <Route path="/prestador/signup" element={<PrestadorSignUpPage />} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute allowedRoles={['company', 'prestador']}>
            <SupabaseProvider supabase={supabase} session={session}>
              <SettingsProvider>
                <OnboardingPage />
              </SettingsProvider>
            </SupabaseProvider>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['company', 'prestador']}>
            <SupabaseProvider supabase={supabase} session={session}>
              <SettingsProvider>
                <Layout />
              </SettingsProvider>
            </SupabaseProvider>
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="prestador/:id" element={<ContractorDetailPage />} />
          <Route path="prestador/:id/editar" element={<EditContractorPage />} />
          <Route path="pagamentos" element={<PaymentsPage />} />
          <Route path="folha" element={<BatchPaymentPage />} />
          <Route path="adicionar-prestador" element={<AddContractorPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        {/* Redirect from old root to dashboard for existing users */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}