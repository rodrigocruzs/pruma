import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2Icon, UserPlusIcon, AlertCircleIcon, ArrowLeftIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { text: 'Mínimo de 8 caracteres', met: false },
    { text: 'Pelo menos uma letra maiúscula', met: false },
    { text: 'Pelo menos um número', met: false },
    { text: 'Senhas coincidem', met: false },
  ]);

  const validatePassword = (password: string, confirmPassword: string) => {
    const newRequirements = [
      { text: 'Mínimo de 8 caracteres', met: password.length >= 8 },
      { text: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(password) },
      { text: 'Pelo menos um número', met: /[0-9]/.test(password) },
      { text: 'Senhas coincidem', met: password === confirmPassword && password !== '' },
    ];
    setPasswordRequirements(newRequirements);
    return newRequirements.every(req => req.met);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'password' || name === 'confirmPassword') {
        validatePassword(
          name === 'password' ? value : newData.password,
          name === 'confirmPassword' ? value : newData.confirmPassword
        );
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password requirements
    if (!passwordRequirements.every(req => req.met)) {
      setError('Por favor, atenda a todos os requisitos de senha.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;

      // Navigate to onboarding after successful signup
      navigate('/onboarding', { 
        state: { 
          message: 'Por favor, verifique seu e-mail para confirmar sua conta.',
          userId: data.user?.id
        }
      });
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar Nova Conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Crie sua conta para acessar o sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Requisitos da Senha:</p>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {req.met ? (
                      <CheckCircle2Icon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !passwordRequirements.every(req => req.met)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="animate-spin h-5 w-5 mr-2" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 