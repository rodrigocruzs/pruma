import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2Icon, Building2Icon, UserIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { CompanySettings, UserProfile } from '../types/supabase';

type OnboardingStep = 'personal' | 'company';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [personalData, setPersonalData] = useState<Partial<UserProfile>>({
    first_name: '',
    last_name: '',
  });
  const [companyData, setCompanyData] = useState<Partial<CompanySettings>>({
    company_name: '',
    razao_social: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  });

  // Initialize records if they don't exist
  useEffect(() => {
    const initializeRecords = async () => {
      if (!user || initialized) return;

      try {
        setLoading(true);
        const [{ data: profile }, { data: settings }] = await Promise.all([
          supabase
            .from('user_profiles')
            .select()
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('company_settings')
            .select()
            .eq('user_id', user.id)
            .single(),
        ]);

        // If records don't exist, create them
        if (!profile) {
          await supabase
            .from('user_profiles')
            .insert({ user_id: user.id })
            .select()
            .single();
        }

        if (!settings) {
          await supabase
            .from('company_settings')
            .insert({ user_id: user.id })
            .select()
            .single();
        }

        setInitialized(true);
      } catch (err) {
        console.error('Error initializing records:', err);
        setError('Erro ao inicializar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    initializeRecords();
  }, [user, initialized]);

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove non-digits
      .replace(/^(\d{2})(\d)/, '$1.$2') // Add first dot
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Add second dot
      .replace(/\.(\d{3})(\d)/, '.$1/$2') // Add slash
      .replace(/(\d{4})(\d)/, '$1-$2') // Add dash
      .slice(0, 18); // Limit length
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove non-digits
      .replace(/^(\d{5})(\d)/, '$1-$2') // Add dash
      .slice(0, 9); // Limit length
  };

  const handlePersonalDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field type
    if (e.target instanceof HTMLInputElement) {
      switch (name) {
        case 'cnpj':
          formattedValue = formatCNPJ(value);
          break;
        case 'cep':
          formattedValue = formatCEP(value);
          break;
      }
    }

    setCompanyData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    if (!initialized) {
      setError('Aguarde a inicialização dos dados...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select()
        .eq('user_id', user.id)
        .single();

      if (checkError) {
        throw checkError;
      }

      // If profile doesn't exist, create it first
      if (!existingProfile) {
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          throw createError;
        }
      }

      // Now update the profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: personalData.first_name,
          last_name: personalData.last_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // If everything worked, move to the next step
      setCurrentStep('company');
    } catch (err: any) {
      console.error('Error saving personal data:', err);
      setError(err.message || 'Falha ao salvar dados pessoais.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    if (!initialized) {
      setError('Aguarde a inicialização dos dados...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if the settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('company_settings')
        .select()
        .eq('user_id', user.id)
        .single();

      if (checkError) {
        throw checkError;
      }

      // If settings don't exist, create them first
      if (!existingSettings) {
        const { error: createError } = await supabase
          .from('company_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          throw createError;
        }
      }

      // Now update the settings
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          ...companyData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Navigate to dashboard after completing onboarding
      navigate('/');
    } catch (err: any) {
      console.error('Error saving company data:', err);
      setError(err.message || 'Falha ao salvar dados da empresa.');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalForm = () => (
    <form onSubmit={handlePersonalSubmit} className="space-y-6">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          required
          value={personalData.first_name || ''}
          onChange={handlePersonalDataChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Sobrenome
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          required
          value={personalData.last_name || ''}
          onChange={handlePersonalDataChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2Icon className="animate-spin h-5 w-5" />
          ) : (
            <>
              Próximo
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderCompanyForm = () => (
    <form onSubmit={handleCompanySubmit} className="space-y-6">
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
          Nome da Empresa
        </label>
        <input
          type="text"
          id="company_name"
          name="company_name"
          required
          value={companyData.company_name || ''}
          onChange={handleCompanyDataChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="razao_social" className="block text-sm font-medium text-gray-700">
          Razão Social
        </label>
        <input
          type="text"
          id="razao_social"
          name="razao_social"
          required
          value={companyData.razao_social || ''}
          onChange={handleCompanyDataChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
          CNPJ
        </label>
        <input
          type="text"
          id="cnpj"
          name="cnpj"
          required
          value={companyData.cnpj || ''}
          onChange={handleCompanyDataChange}
          placeholder="00.000.000/0000-00"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
          Endereço
        </label>
        <input
          type="text"
          id="endereco"
          name="endereco"
          required
          value={companyData.endereco || ''}
          onChange={handleCompanyDataChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
            Cidade
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            required
            value={companyData.cidade || ''}
            onChange={handleCompanyDataChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            required
            value={companyData.estado || ''}
            onChange={handleCompanyDataChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Selecione...</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
          CEP
        </label>
        <input
          type="text"
          id="cep"
          name="cep"
          required
          value={companyData.cep || ''}
          onChange={handleCompanyDataChange}
          placeholder="00000-000"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2Icon className="animate-spin h-5 w-5" />
          ) : (
            'Concluir Cadastro'
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {(loading && !initialized) ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2Icon className="animate-spin h-8 w-8 text-blue-600 mb-4" />
          <p className="text-sm text-gray-600">Inicializando...</p>
        </div>
      ) : (
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {currentStep === 'personal' ? 'Dados Pessoais' : 'Dados da Empresa'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {currentStep === 'personal'
                ? 'Complete seu cadastro com seus dados pessoais'
                : 'Informe os dados da sua empresa'}
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-8 flex justify-center space-x-8">
                <div
                  className={`flex flex-col items-center ${
                    currentStep === 'personal' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                      currentStep === 'personal' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-sm font-medium">Pessoal</span>
                </div>

                <div
                  className={`flex flex-col items-center ${
                    currentStep === 'company' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                      currentStep === 'company' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <Building2Icon className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-sm font-medium">Empresa</span>
                </div>
              </div>

              {currentStep === 'personal' ? renderPersonalForm() : renderCompanyForm()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingPage; 