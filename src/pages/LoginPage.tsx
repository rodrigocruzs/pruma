import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader2Icon, LogInIcon, AlertCircleIcon, UserPlusIcon } from 'lucide-react';
import prumaIcon from '../assets/images/pruma-icon.svg';
import { supabase } from '../lib/supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check for success message in location state
    const message = location.state?.message;
    if (message) {
      setSuccessMessage(message);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message === 'Email not confirmed') {
          throw new Error('Por favor, verifique seu e-mail para confirmar sua conta antes de fazer login.');
        }
        throw signInError;
      }

      if (data?.user) {
        const redirect = location.state?.redirect;
        if (redirect) {
          navigate(redirect);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF8EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <img src={prumaIcon} alt="Pruma" className="h-8 w-8 text-[#C49A22] mr-2" />
          <h2 className="mt-6 text-center text-3xl font-light text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.05em' }}>
            Pruma
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600 font-light">
          Faça login para acessar o sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
              <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C49A22] focus:border-[#C49A22] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C49A22] focus:border-[#C49A22] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C49A22] hover:bg-[#A37F1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C49A22] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="animate-spin h-5 w-5 mr-2" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogInIcon className="h-5 w-5 mr-2" />
                    Entrar
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center text-sm text-[#C49A22] hover:text-[#A37F1C]"
              >
                <UserPlusIcon className="h-4 w-4 mr-1" />
                Criar nova conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 