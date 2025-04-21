import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Loader2Icon, UserPlusIcon, AlertCircleIcon, ArrowLeftIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const PrestadorSignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Log the full URL and all parameters
  console.log('Current URL:', window.location.href);
  console.log('Location state:', location.state);
  console.log('Search params:', Object.fromEntries(searchParams.entries()));
  console.log('Hash:', location.hash);

  // Try to get prestadorId from various sources
  const prestadorIdFromQuery = searchParams.get('prestadorId');
  const prestadorIdFromHash = new URLSearchParams(location.hash.replace('#', '?')).get('prestadorId');
  const prestadorIdFromState = location.state?.prestadorId;

  console.log('PrestadorId sources:', {
    fromQuery: prestadorIdFromQuery,
    fromHash: prestadorIdFromHash,
    fromState: prestadorIdFromState
  });

  const prestadorId = prestadorIdFromQuery || prestadorIdFromHash || prestadorIdFromState;

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

  useEffect(() => {
    const fetchPrestadorEmail = async () => {
      console.log('Starting prestador fetch with ID:', prestadorId);
      
      if (!prestadorId) {
        console.error('No prestadorId found in URL or state');
        setError('Link de convite inválido - ID não encontrado');
        return;
      }

      try {
        // Log the query we're about to make
        console.log('Making Supabase query for prestador with ID:', prestadorId);

        // First try to get the prestador directly with detailed error logging
        let { data: prestador, error: prestadorError } = await supabase
          .from('PrestadorPJ')
          .select('*')
          .eq('id', prestadorId)
          .maybeSingle();

        // Log raw response for debugging
        console.log('Raw Supabase response:', { prestador, prestadorError });

        if (prestadorError) {
          console.error('Supabase error details:', {
            message: prestadorError.message,
            details: prestadorError.details,
            hint: prestadorError.hint
          });
          throw prestadorError;
        }

        if (!prestador) {
          // Try an alternative query approach
          const { data: altPrestador, error: altError } = await supabase
            .rpc('get_prestador_by_id', { p_id: prestadorId });

          console.log('Alternative query result:', { altPrestador, altError });

          if (!altError && altPrestador) {
            prestador = altPrestador;
          } else {
            // If still not found, try by email
            const emailFromURL = searchParams.get('email');
            
            console.log('Trying to find by email:', emailFromURL);

            if (emailFromURL) {
              const { data: prestadorByEmail, error: emailError } = await supabase
                .from('PrestadorPJ')
                .select('*')
                .eq('email', emailFromURL.toLowerCase())
                .maybeSingle();

              console.log('Email search result:', { prestadorByEmail, emailError });

              if (emailError) {
                console.error('Email search error:', emailError);
                throw emailError;
              }
              
              if (prestadorByEmail) {
                console.log('Found prestador by email:', prestadorByEmail);
                prestador = prestadorByEmail;
              }
            }
          }

          if (!prestador) {
            console.error('Prestador not found by any method');
            throw new Error('Prestador não encontrado. Por favor, verifique se o link do convite está correto ou entre em contato com a empresa.');
          }
        }

        console.log('Successfully found prestador:', prestador);
        setFormData(prev => ({ ...prev, email: prestador.email }));
      } catch (err: any) {
        console.error('Final error in fetchPrestadorEmail:', err);
        setError(err.message || 'Erro ao carregar informações do prestador');
      }
    };

    fetchPrestadorEmail();
  }, [prestadorId, location.hash, searchParams]);

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

    if (!prestadorId) {
      setError('Link de convite inválido');
      setLoading(false);
      return;
    }

    // Validate password requirements
    if (!passwordRequirements.every(req => req.met)) {
      setError('Por favor, atenda a todos os requisitos de senha.');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting password update process for email:', formData.email);

      // Update the user's password
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      console.log('Password update response:', { updateData, updateError });

      if (updateError) {
        console.error('Password update error:', updateError);
        
        // If update fails, try to reset password
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          formData.email.toLowerCase(),
          {
            redirectTo: `${window.location.origin}/prestador/signup?prestadorId=${prestadorId}&email=${formData.email}`
          }
        );

        if (resetError) {
          console.error('Password reset error:', resetError);
          throw resetError;
        }

        toast.success(
          'Enviamos um novo link para seu e-mail. Por favor, verifique sua caixa de entrada.',
          { duration: 6000 }
        );
        return;
      }

      // Try to sign in with new password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      // Create user role if it doesn't exist yet
      const { error: roleError } = await supabase.rpc('create_prestador_role', {
        user_id: updateData.user.id,
        prestador_id_param: prestadorId
      });

      if (roleError) {
        console.error('Error creating role:', roleError);
        // Don't throw here, as the password update and login were successful
        toast.error('Aviso: Houve um erro ao configurar algumas permissões, mas você pode continuar usando o sistema.');
      }

      toast.success('Senha atualizada com sucesso! Redirecionando para o dashboard...');
      
      // Redirect to the main dashboard, which will then redirect to the prestador's own page
      navigate('/');
      
    } catch (err: any) {
      console.error('Process error:', err);
      setError(err.message || 'Falha ao atualizar senha. Por favor, solicite um novo link de convite.');
      toast.error(err.message || 'Falha ao atualizar senha. Por favor, solicite um novo link de convite.', {
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar Conta de Prestador
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Complete seu cadastro para acessar o portal
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

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Requisitos da senha:</p>
              <div className="space-y-2">
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
                    Atualizando senha...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Atualizar Senha
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

export default PrestadorSignUpPage; 