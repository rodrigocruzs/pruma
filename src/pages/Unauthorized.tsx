import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircleIcon } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  const handleRedirect = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userRole?.role === 'prestador') {
      navigate('/prestador/dashboard');
    } else if (userRole?.role === 'company') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const getMessage = () => {
    if (loading) {
      return 'Verificando suas permissões...';
    }

    if (!user) {
      return 'Você precisa fazer login para acessar esta página.';
    }

    if (!userRole) {
      return 'Sua conta ainda não tem um papel atribuído. Por favor, verifique seu email para completar o cadastro.';
    }

    return 'Você não tem permissão para acessar esta página.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <AlertCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Acesso Não Autorizado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getMessage()}
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleRedirect}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {!user ? 'Ir para Login' : 'Voltar para página inicial'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 