import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FileIcon, AlertCircleIcon, KeyIcon, BriefcaseIcon, BuildingIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatCNPJ, formatPhoneNumber, formatCurrency, unformatCurrency, unformatValue } from '../utils/formatters';

// Helper function to validate currency values
const isValidCurrency = (value: string): boolean => {
  if (!value) return false;
  const numericValue = parseFloat(unformatCurrency(value));
  return !isNaN(numericValue) && numericValue > 0;
};

// Interface for fetched data (can be reused or adapted if needed)
interface PrestadorPJData {
  id: string;
  nome: string;
  sobrenome: string;
  razao_social: string | null;
  cnpj: string | null;
  funcao: string | null;
  data_inicio: string;
  nascimento: string | null;
  email: string;
  telefone_contato: string | null;
  remuneracao: number;
  endereco_logradouro: string | null;
  endereco_cidade: string | null;
  chave_pix: string | null;
  contrato_path: string | null;
  status_contrato: string;
  // Add other fields as necessary
}

const EditContractorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true); // Loading existing data
  const [isSaving, setIsSaving] = useState<boolean>(false); // Saving changes
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    razao_social: '',
    cnpj: '',
    funcao: '',
    data_inicio: '',
    nascimento: '',
    email: '',
    telefone_contato: '',
    remuneracao: '',
    endereco_logradouro: '',
    endereco_cidade: '',
    chave_pix: '',
    contractFile: null as File | null,
    contrato_path: null as string | null,
    status_contrato: '',
  });

  // Fetch existing data on mount
  useEffect(() => {
    const fetchContractor = async () => {
      if (!id || !supabase) {
        setError(id ? 'Supabase client não inicializado.' : 'ID do prestador não encontrado na URL.');
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('PrestadorPJ')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          // Pre-populate form state, handling nulls and converting number
          setFormData({
            nome: data.nome || '',
            sobrenome: data.sobrenome || '',
            razao_social: data.razao_social || '',
            cnpj: data.cnpj || '',
            funcao: data.funcao || '',
            data_inicio: data.data_inicio || '',
            nascimento: data.nascimento || '',
            email: data.email || '',
            telefone_contato: data.telefone_contato || '',
            remuneracao: data.remuneracao ? formatCurrency(data.remuneracao) : '', // Now formatCurrency can handle numbers directly
            endereco_logradouro: data.endereco_logradouro || '',
            endereco_cidade: data.endereco_cidade || '',
            chave_pix: data.chave_pix || '',
            contractFile: null,
            contrato_path: data.contrato_path,
            status_contrato: data.status_contrato || '',
          });
        } else {
          setError('Prestador não encontrado para edição.');
        }
      } catch (err: any) {
        console.error('Error fetching contractor for edit:', err);
        setError(`Falha ao carregar dados do prestador: ${err.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchContractor();
  }, [id]);

  // Add useEffect to handle error scrolling
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Apply formatting based on field type
    switch (name) {
      case 'cnpj':
        formattedValue = formatCNPJ(value);
        break;
      case 'telefone_contato':
        formattedValue = formatPhoneNumber(value);
        break;
      case 'remuneracao':
        formattedValue = formatCurrency(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        contractFile: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !supabase) return;

    setError(null);

    // Validate required fields and currency value
    const missingFields = [];
    if (!formData.nome) missingFields.push('Nome');
    if (!formData.sobrenome) missingFields.push('Sobrenome');
    if (!formData.email) missingFields.push('E-mail');
    if (!formData.data_inicio) missingFields.push('Data de Início');
    if (!isValidCurrency(formData.remuneracao)) missingFields.push('Remuneração (deve ser um valor maior que zero)');

    if (missingFields.length > 0) {
      setError(`Por favor, preencha corretamente os seguintes campos: ${missingFields.join(', ')}`);
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data for UPDATE, unformatting the formatted values
      const { contractFile, contrato_path, ...restData } = formData;
      
      const dataToSend = {
        ...restData,
        cnpj: formData.cnpj ? unformatValue(formData.cnpj) : null,
        telefone_contato: formData.telefone_contato ? unformatValue(formData.telefone_contato) : null,
        remuneracao: parseFloat(unformatCurrency(formData.remuneracao))
      };

      // First update the contractor data
      const { error: updateError } = await supabase
        .from('PrestadorPJ')
        .update(dataToSend)
        .eq('id', id);

      if (updateError) {
        if (updateError.code === '23505') { 
          setError(`Falha ao salvar: ${updateError.details || 'Já existe um cadastro com este CNPJ ou e-mail.'}`);
        } else {
          setError(`Falha ao salvar: ${updateError.message}`);
        }
        return;
      }

      // Handle contract file upload if a new file was selected
      if (contractFile) {
        const fileExt = contractFile.name.split('.').pop();
        const fileName = `${id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('contratos')
          .upload(filePath, contractFile);

        if (uploadError) {
          setError(`Falha ao fazer upload do contrato: ${uploadError.message}`);
          return;
        }

        // Update the contract path in the database
        const { error: pathUpdateError } = await supabase
          .from('PrestadorPJ')
          .update({ contrato_path: filePath })
          .eq('id', id);

        if (pathUpdateError) {
          setError(`Falha ao atualizar caminho do contrato: ${pathUpdateError.message}`);
          return;
        }
      }

      // Navigate back to the contractor details page
      window.location.href = `/dashboard/prestador/${id}`;
    } catch (err: any) {
      console.error('Error updating contractor:', err);
      setError(`Falha ao atualizar prestador: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveContract = async () => {
    if (!id || !formData.contrato_path) return;

    try {
      setIsSaving(true);

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('contratos')
        .remove([formData.contrato_path]);

      if (deleteError) {
        setError(`Falha ao remover contrato: ${deleteError.message}`);
        return;
      }

      // Update the database to remove the contract path
      const { error: updateError } = await supabase
        .from('PrestadorPJ')
        .update({ contrato_path: null })
        .eq('id', id);

      if (updateError) {
        setError(`Falha ao atualizar registro do contrato: ${updateError.message}`);
        return;
      }

      // Update local state
      setFormData(prev => ({
        ...prev,
        contrato_path: null
      }));
    } catch (err: any) {
      console.error('Error removing contract:', err);
      setError(`Falha ao remover contrato: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Voltar
      </button>

      <h1 className="text-3xl font-bold mb-8">Editar Prestador</h1>

      {/* Error message */}
      {error && (
        <div
          ref={errorRef}
          className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
            Informações Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
              <input
                type="text"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
              <input
                type="date"
                name="nascimento"
                value={formData.nascimento}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Início</label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BuildingIcon className="h-5 w-5 mr-2 text-gray-500" />
            Informações da Empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Razão Social</label>
              <input
                type="text"
                name="razao_social"
                value={formData.razao_social}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-500" />
            Informações Profissionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Função</label>
              <input
                type="text"
                name="funcao"
                value={formData.funcao}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remuneração</label>
              <input
                type="text"
                name="remuneracao"
                value={formData.remuneracao}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
            Informações de Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                name="telefone_contato"
                value={formData.telefone_contato}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <input
                type="text"
                name="endereco_logradouro"
                value={formData.endereco_logradouro}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade</label>
              <input
                type="text"
                name="endereco_cidade"
                value={formData.endereco_cidade}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
            Informações de Pagamento
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chave PIX</label>
            <input
              type="text"
              name="chave_pix"
              value={formData.chave_pix}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contract Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileIcon className="h-5 w-5 mr-2 text-gray-500" />
            Contrato
          </h2>
          <div className="space-y-4">
            {formData.contrato_path ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Contrato atual</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveContract}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  disabled={isSaving}
                >
                  Remover
                </button>
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.contrato_path ? 'Substituir contrato' : 'Adicionar contrato'}
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`
              px-6 py-2 border border-transparent rounded-md shadow-sm text-white
              ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContractorPage; 