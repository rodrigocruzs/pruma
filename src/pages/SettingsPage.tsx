import React, { useState, useEffect } from 'react';
import { Building2, User, PencilIcon } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../contexts/AuthContext';
import type { CompanySettings, UserProfile } from '../types/supabase';

type SettingsTab = 'empresa' | 'conta';

const SettingsPage = () => {
  const { companySettings, userProfile, updateCompanySettings, updateUserProfile } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('empresa');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    company: Partial<CompanySettings>;
    profile: Partial<UserProfile>;
  }>({
    company: {
      company_name: companySettings?.company_name || '',
      razao_social: companySettings?.razao_social || '',
      cnpj: companySettings?.cnpj || '',
      endereco: companySettings?.endereco || '',
      cidade: companySettings?.cidade || '',
      estado: companySettings?.estado || '',
      cep: companySettings?.cep || '',
    },
    profile: {
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
    }
  });

  // Update form data when settings change
  useEffect(() => {
    setFormData({
      company: {
        company_name: companySettings?.company_name || '',
        razao_social: companySettings?.razao_social || '',
        cnpj: companySettings?.cnpj || '',
        endereco: companySettings?.endereco || '',
        cidade: companySettings?.cidade || '',
        estado: companySettings?.estado || '',
        cep: companySettings?.cep || '',
      },
      profile: {
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || '',
      }
    });
  }, [companySettings, userProfile]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field type
    switch (id) {
      case 'cnpj':
        formattedValue = formatCNPJ(value);
        break;
      case 'cep':
        formattedValue = formatCEP(value);
        break;
    }

    if (activeTab === 'empresa') {
      setFormData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          [id]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [id]: formattedValue
        }
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'empresa') {
        await updateCompanySettings(formData.company);
      } else {
        await updateUserProfile(formData.profile);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      // You might want to show an error message to the user here
    }
  };

  const renderInput = (id: string, label: string, type: string = 'text') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          id={id}
          value={activeTab === 'empresa' ? (formData.company[id as keyof typeof formData.company] || '') : (formData.profile[id as keyof typeof formData.profile] || '')}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <div className="w-full p-2 bg-gray-50 rounded-md text-gray-700">
          {activeTab === 'empresa' 
            ? (formData.company[id as keyof typeof formData.company] || '-')
            : (formData.profile[id as keyof typeof formData.profile] || '-')
          }
        </div>
      )}
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-4">
      {renderInput('company_name', 'Nome da Empresa')}
      {renderInput('razao_social', 'Razão Social')}
      {renderInput('cnpj', 'CNPJ')}
      {renderInput('endereco', 'Endereço')}
      {renderInput('cidade', 'Cidade')}
      {renderInput('estado', 'Estado')}
      {renderInput('cep', 'CEP')}
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-4">
      {renderInput('first_name', 'Nome')}
      {renderInput('last_name', 'Sobrenome')}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-mail
        </label>
        <div className="w-full p-2 bg-gray-50 rounded-md text-gray-700">
          {user?.email || '-'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('empresa')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'empresa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Empresa
              </div>
            </button>
            <button
              onClick={() => setActiveTab('conta')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conta'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Conta
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-end mb-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>

          {activeTab === 'empresa' ? renderCompanySettings() : renderAccountSettings()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 