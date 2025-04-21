import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2Icon, UserPlusIcon, AlertCircleIcon, ArrowLeftIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import prumaIcon from '../assets/images/pruma-icon.svg';

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
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    // Track if password fields have been touched
    if (name === 'password' && !passwordTouched) {
      setPasswordTouched(true);
    }
    if (name === 'confirmPassword' && !confirmPasswordTouched) {
      setConfirmPasswordTouched(true);
    }
    
    setFormData(prev => {
      const newData = { 
        ...prev, 
        [name]: value 
      };
      
      if (name === 'password' || name === 'confirmPassword') {
        validatePassword(
          name === 'password' ? (value as string) : newData.password,
          name === 'confirmPassword' ? (value as string) : newData.confirmPassword
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

      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if we should show validation status
  const shouldShowValidation = passwordTouched || confirmPasswordTouched;

  return (
    <div className="min-h-screen bg-[#FCF8EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={prumaIcon} alt="Pruma" className="h-12 w-12 text-[#C49A22]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Criar sua conta na Pruma</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/login" className="font-medium text-[#C49A22] hover:text-[#A37F1C]">
            entrar na sua conta existente
          </Link>
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
                Email
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C49A22] focus:border-[#C49A22] sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C49A22] focus:border-[#C49A22] sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Requisitos da Senha:</p>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {shouldShowValidation ? (
                      req.met ? (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                      )
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                    )}
                    <span className={shouldShowValidation 
                      ? (req.met ? 'text-green-700' : 'text-red-700') 
                      : 'text-gray-500'
                    }>
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C49A22] hover:bg-[#A37F1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C49A22] disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 