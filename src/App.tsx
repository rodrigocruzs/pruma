import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Component to handle public routes - redirects to dashboard if user is already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { session } = useAuth();

  return (
    <BrowserRouter>
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
          <Route path="pagamentos/lote" element={<BatchPaymentPage />} />
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