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
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { supabase } from './lib/supabaseClient';

const AppRoutes = () => {
  const { session } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

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

        <Route path="/" element={
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