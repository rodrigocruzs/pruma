import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, UploadIcon, AlertCircleIcon, KeyIcon, BriefcaseIcon, BuildingIcon, PhoneIcon, UserIcon, Loader2Icon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatCNPJ, formatPhoneNumber, formatCurrency, unformatCurrency, unformatValue } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const parseCurrency = (value: string): number => {
  // Remove currency symbol, thousand separators and replace comma with dot
  const numStr = value.replace(/[R$\s.]/g, '').replace(',', '.');
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed;
};

const AddContractorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse the remuneracao value before inserting
      const remuneracaoValue = parseCurrency(formData.remuneracao);
      
      if (remuneracaoValue <= 0) {
        throw new Error('A remuneração deve ser maior que zero');
      }

      // Insert the new contractor
      const { data: prestador, error: insertError } = await supabase
        .from('PrestadorPJ')
        .insert([
          {
            nome: formData.nome,
            sobrenome: formData.sobrenome,
            email: formData.email.toLowerCase(),
            funcao: formData.funcao,
            remuneracao: remuneracaoValue,
            data_inicio: formData.data_inicio,
            cnpj: formData.cnpj,
            razao_social: formData.razao_social,
            chave_pix: formData.chave_pix || null,
            telefone_contato: formData.telefone_contato || null,
            endereco_logradouro: formData.endereco_logradouro || null,
            endereco_cidade: formData.endereco_cidade || null,
            nascimento: formData.nascimento || null,
            created_by: user.id,
            ativo: false,
            status_contrato: 'Pendente'
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Created prestador:', prestador);

      // Send magic link for signup
      const signupURL = new URL(`${window.location.origin}/prestador/signup`);
      signupURL.searchParams.set('prestadorId', prestador.id);
      signupURL.searchParams.set('email', formData.email.toLowerCase());

      console.log('Generated signup URL:', signupURL.toString());

      const { data: otpData, error: inviteError } = await supabase.auth.signInWithOtp({
        email: formData.email.toLowerCase(),
        options: {
          emailRedirectTo: signupURL.toString(),
          data: {
            prestadorId: prestador.id,
            type: 'prestador',
            email: formData.email.toLowerCase()
          }
        }
      });

      console.log('OTP response:', { otpData, inviteError });

      if (inviteError) throw inviteError;

      // Handle contract file upload if a file was selected
      if (formData.contractFile) {
        const fileExt = formData.contractFile.name.split('.').pop();
        const fileName = `${prestador.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('contratos')
          .upload(filePath, formData.contractFile);

        if (uploadError) {
          console.error('Error uploading contract:', uploadError);
          throw new Error(`Falha ao fazer upload do contrato: ${uploadError.message}`);
        }

        // Update the contract path in the database
        const { error: pathUpdateError } = await supabase
          .from('PrestadorPJ')
          .update({ 
            contrato_path: filePath,
            status_contrato: 'Ativo'
          })
          .eq('id', prestador.id);

        if (pathUpdateError) {
          console.error('Error updating contract path:', pathUpdateError);
          throw new Error(`Falha ao atualizar caminho do contrato: ${pathUpdateError.message}`);
        }

        console.log('Contract uploaded successfully:', filePath);
      }

      toast.success('Prestador adicionado com sucesso! Um email de convite foi enviado.');
      navigate(`/dashboard/prestador/${prestador.id}`);
    } catch (err: any) {
      console.error('Error adding contractor:', err);
      setError(err.message || 'Erro ao adicionar prestador');
      toast.error(err.message || 'Erro ao adicionar prestador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Voltar
      </button>
      
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Adicionar Novo Prestador
            </h1>
            {!formData.contractFile && (
              <div className="flex items-center text-amber-600">
                <AlertCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Contrato pendente</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Informações Pessoais
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input type="text" id="nome" name="nome" required value={formData.nome} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome *
                  </label>
                  <input type="text" id="sobrenome" name="sobrenome" required value={formData.sobrenome} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="razao_social" className="block text-sm font-medium text-gray-700 mb-1">
                    Razão Social *
                  </label>
                  <input type="text" id="razao_social" name="razao_social" required value={formData.razao_social} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input type="text" id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <label htmlFor="nascimento" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento (Responsável)
                  </label>
                  <input type="date" id="nascimento" name="nascimento" value={formData.nascimento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="telefone_contato" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone de Contato
                  </label>
                  <input type="text" id="telefone_contato" name="telefone_contato" value={formData.telefone_contato} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" placeholder="(XX) XXXXX-XXXX" />
                </div>
              </div>
            </div>

            {/* Right Column - Professional Info & Address */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Informações Profissionais
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="funcao" className="block text-sm font-medium text-gray-700 mb-1">
                    Função
                  </label>
                  <input type="text" id="funcao" name="funcao" value={formData.funcao} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início *
                  </label>
                  <input type="date" id="data_inicio" name="data_inicio" required value={formData.data_inicio} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="remuneracao" className="block text-sm font-medium text-gray-700 mb-1">
                    Remuneração <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="remuneracao"
                    name="remuneracao"
                    value={formData.remuneracao}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-4 mt-8">
                Endereço
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="endereco_logradouro" className="block text-sm font-medium text-gray-700 mb-1">
                    Logradouro e Número
                  </label>
                  <input type="text" id="endereco_logradouro" name="endereco_logradouro" value={formData.endereco_logradouro} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
                <div>
                  <label htmlFor="endereco_cidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input type="text" id="endereco_cidade" name="endereco_cidade" value={formData.endereco_cidade} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info - Full Width */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">
              Informações de Pagamento
            </h2>
            <div>
              <label htmlFor="chave_pix" className="block text-sm font-medium text-gray-700 mb-1">
                Chave PIX
              </label>
              <input type="text" id="chave_pix" name="chave_pix" value={formData.chave_pix} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#C49A22] focus:border-[#C49A22] shadow-sm" placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" />
            </div>
          </div>

          {/* Contract Section - Full Width */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">
              Contrato
            </h2>
            <div>
              <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                Anexar Contrato (PDF)
              </label>
              <div className="mt-1 flex items-center">
                <label className={`flex items-center px-4 py-2 rounded-md cursor-pointer transition duration-150 ease-in-out ${formData.contractFile ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'}`}>
                  <UploadIcon className="h-5 w-5 mr-2" />
                  <span>{formData.contractFile ? formData.contractFile.name : 'Upload'}</span>
                  <input type="file" id="contractFile" name="contractFile" accept=".pdf" onChange={handleFileChange} className="sr-only" />
                </label>
                {formData.contractFile && <button type="button" onClick={() => setFormData(prev => ({ ...prev, contractFile: null }))} className="ml-3 text-sm text-red-600 hover:text-red-800 transition duration-150 ease-in-out">Remover</button>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-[#C49A22] text-white rounded-md hover:bg-[#A37F1C]"
            >
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Adicionando...
                </>
              ) : (
                <>
                  <SaveIcon className="h-5 w-5 mr-2" />
                  Adicionar Prestador
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddContractorPage;