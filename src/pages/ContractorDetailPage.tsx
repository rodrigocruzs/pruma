import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FileTextIcon, DownloadIcon, XCircleIcon, FileIcon, AlertCircleIcon, CheckCircleIcon, RefreshCwIcon, UserXIcon, KeyIcon, BuildingIcon, PhoneIcon, Loader2Icon, UserIcon, PencilIcon, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import InvoiceUpload from '../components/InvoiceUpload';
import InvoiceView from '../components/InvoiceView';
import { useAuth } from '../contexts/AuthContext';

interface Payment {
  id: string;
  valor: number;
  data: string;
  status: string;
  nf_id: string | null;
  comissao: number;
  prestador_id: string;
  created_at: string;
  mes_referente: string | null;
}

interface PrestadorPJDetail {
  id: string;
  created_at: string;
  nome: string;
  sobrenome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string;
  telefone_contato: string | null;
  nascimento: string | null;
  funcao: string | null;
  data_inicio: string;
  remuneracao: number;
  endereco_logradouro: string | null;
  endereco_cidade: string | null;
  chave_pix: string | null;
  status_contrato: string;
  contrato_path: string | null;
  ativo: boolean;
}

const ContractorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<{role: 'company' | 'prestador', prestador_id: string | null} | null>(null);
  const [contractor, setContractor] = useState<PrestadorPJDetail | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRole();
  }, [user]);
  
  const fetchUserRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, prestador_id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole({ role: 'company', prestador_id: null });
      } else if (data) {
        setUserRole(data);
      } else {
        setUserRole({ role: 'company', prestador_id: null });
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole({ role: 'company', prestador_id: null });
    } finally {
      // Continue with loading contract details
      loadContractorDetails();
    }
  };

  const loadContractorDetails = () => {
    if (id) {
      fetchPaymentHistory();
    }
  };

  const fetchPaymentHistory = useCallback(async () => {
    if (!id) return;
    
    // Only fetch payment history for company users
    if (userRole?.role === 'prestador') return;
    
    try {
      const { data, error } = await supabase
        .from('Pagamento')
        .select('*')
        .eq('prestador_id', id)
        .order('data', { ascending: false })
        .order('id', { ascending: true });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      setError(error.message);
    }
  }, [id, userRole]);

  useEffect(() => {
    if (userRole) {
      fetchPaymentHistory();
    }
  }, [fetchPaymentHistory, userRole]);

  useEffect(() => {
    const fetchContractorDetails = async () => {
      if (!id) {
        setError('ID do prestador não encontrado na URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setDownloadError(null);

      if (!supabase) {
        setError('Supabase client não está disponível.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('PrestadorPJ')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Error fetching contractor details:', fetchError);
          setError(`Falha ao carregar detalhes do prestador: ${fetchError.message}`);
          setContractor(null);
        } else if (data) {
          setContractor(data as PrestadorPJDetail);
        } else {
          setError('Prestador não encontrado.');
          setContractor(null);
        }
      } catch (err: any) {
        console.error('Error fetching contractor details:', err);
        setError(`Falha ao carregar detalhes do prestador: ${err.message}`);
        setContractor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContractorDetails();
  }, [id]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMonth = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      const [year, month] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      return `${capitalizedMonth}-${year}`;
    } catch (error) {
      return 'Data inválida';
    }
  };

  const handleActivate = async () => {
    if (!contractor || !supabase) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('PrestadorPJ')
        .update({ ativo: true, status_contrato: 'Ativo' })
        .eq('id', contractor.id);

      if (updateError) {
        console.error('Error activating contractor:', updateError);
        setError(`Falha ao ativar prestador: ${updateError.message}`);
      } else {
        setContractor(prev => prev ? { ...prev, ativo: true, status_contrato: 'Ativo' } : null);
      }
    } catch (err) {
      console.error('Unexpected error activating contractor:', err);
      setError('Ocorreu um erro inesperado ao ativar o prestador.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInactivate = async () => {
    if (!contractor || !supabase) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('PrestadorPJ')
        .update({ ativo: false, status_contrato: 'Inativo' })
        .eq('id', contractor.id);

      if (updateError) throw updateError;

      setContractor(prev => prev ? { ...prev, ativo: false, status_contrato: 'Inativo' } : null);
    } catch (err: any) {
      console.error('Error inactivating contractor:', err);
      setError(`Falha ao inativar prestador: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadContract = async () => {
    if (!contractor?.contrato_path || !supabase) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from('contratos')
        .download(contractor.contrato_path);

      if (downloadError) throw downloadError;
      if (!blob) throw new Error('Arquivo não encontrado ou vazio.');

      const filename = contractor.contrato_path.split('/').pop() || 'contrato.pdf';
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('Error downloading contract:', err);
      setDownloadError(`Falha ao baixar contrato: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditClick = () => {
    if (!contractor) return;
    navigate(`/prestador/${contractor.id}/editar`);
  };

  const getStatusBadgeClass = (status: Payment['status']) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInvoiceError = (error: string) => {
    setInvoiceError(error);
    setTimeout(() => setInvoiceError(null), 5000);
  };

  const handleInvoiceUploadComplete = () => {
    fetchPaymentHistory();
  };

  if (loading) {
    return <div className="container mx-auto p-6 text-center">Carregando detalhes...</div>;
  }

  if (error && !isUpdating) {
    return <div className="container mx-auto p-6 text-red-600">Erro: {error}</div>;
  }

  if (!contractor) {
    return <div className="container mx-auto p-6 text-center">Prestador não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2Icon className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Carregando informações do prestador...</p>
        </div>
      ) : contractor ? (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Only show back button for company users */}
              {userRole?.role === 'company' && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Voltar"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <h1 className="text-2xl font-bold">{contractor.nome} {contractor.sobrenome}</h1>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {contractor.nome}
                  </h2>
                  <p className="text-gray-600">{contractor.funcao ?? 'Função não informada'}</p>
                </div>
                <div className="flex items-center gap-4">
                  {!contractor.contrato_path && (
                    <div className="flex items-center text-amber-600">
                      <AlertCircleIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">Contrato pendente</span>
                    </div>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${contractor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {contractor.ativo ? (
                      <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 mr-1.5" />
                    )}
                    {contractor.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  {!contractor.ativo && userRole?.role === 'company' && (
                    <button
                      onClick={handleActivate}
                      disabled={isUpdating || isDownloading}
                      className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150 ease-in-out"
                      title="Ativar Prestador"
                    >
                      {isUpdating ? (
                        <RefreshCwIcon className="animate-spin h-4 w-4 mr-1.5" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                      )}
                      {isUpdating ? 'Ativando...' : 'Ativar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Contrato</h2>
                <div className="bg-gray-50 border rounded-lg p-4">
                  {contractor.contrato_path ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 truncate max-w-xs" title={contractor.contrato_path.split('/').pop()}>
                            {contractor.contrato_path.split('/').pop() || 'Contrato Anexado'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadContract}
                        disabled={isDownloading}
                        className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
                      >
                        {isDownloading ? (
                          <Loader2Icon className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                          <DownloadIcon className="h-4 w-4 mr-2" />
                        )}
                        {isDownloading ? 'Baixando...' : 'Download'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <AlertCircleIcon className="h-5 w-5 mr-2" />
                      <p>Nenhum contrato anexado.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Informações Pessoais
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <UserIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        Nome
                      </p>
                      <p className="text-gray-800 pl-6">{contractor.nome} {contractor.sobrenome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <BuildingIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        Razão Social
                      </p>
                      <p className="text-gray-800 pl-6">{contractor.razao_social ?? 'Não informada'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">CNPJ</p>
                      <p className="text-gray-800 pl-6">{contractor.cnpj ?? 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                      <p className="text-gray-800 pl-6">{formatDate(contractor.nascimento)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">E-mail</p>
                      <p className="text-gray-800 pl-6">{contractor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        Telefone de Contato
                      </p>
                      <p className="text-gray-800 pl-6">{contractor.telefone_contato ?? 'Não informado'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Informações Profissionais
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Função</p>
                      <p className="text-gray-800">{contractor.funcao ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Início</p>
                      <p className="text-gray-800">{formatDate(contractor.data_inicio)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Remuneração</p>
                      <p className="text-gray-800 font-semibold">{formatCurrency(contractor.remuneracao)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">Endereço</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Logradouro</p>
                      <p className="text-gray-800">{contractor.endereco_logradouro ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cidade</p>
                      <p className="text-gray-800">{contractor.endereco_cidade ?? 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Informações de Pagamento
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Chave PIX</p>
                      <p className="text-gray-800">{contractor.chave_pix ?? 'Não informada'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">
                  Histórico de Pagamentos
                </h2>
                {invoiceError && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {invoiceError}
                  </div>
                )}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2Icon className="animate-spin h-5 w-5 mx-auto mb-2" />
                      Carregando histórico...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nota Fiscal
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mês Referente
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paymentHistory.length > 0 ? (
                            paymentHistory.map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(payment.data)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatCurrency(payment.valor)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status.toLowerCase() === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {payment.status.toLowerCase() === 'pago' ? (
                                      <>
                                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                                        Pago
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircleIcon className="mr-1 h-4 w-4" />
                                        Pendente
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {payment.nf_id ? (
                                    <InvoiceView
                                      nfId={payment.nf_id}
                                      onError={handleInvoiceError}
                                      onRemoveComplete={handleInvoiceUploadComplete}
                                    />
                                  ) : (
                                    <InvoiceUpload
                                      paymentId={payment.id}
                                      onUploadComplete={handleInvoiceUploadComplete}
                                      onError={handleInvoiceError}
                                    />
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatMonth(payment.mes_referente)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-sm text-center bg-gray-50">
                                Não há registros de pagamentos para este prestador.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Only show buttons for company users */}
              {userRole?.role === 'company' && (
                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </button>
                  
                  {contractor.ativo && userRole?.role === 'company' && (
                    <button
                      onClick={handleInactivate}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                    >
                      <UserXIcon className="h-4 w-4" />
                      {isUpdating ? 'Processando...' : 'Inativar'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mx-auto max-w-md">
            <AlertCircleIcon className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-700">Prestador não encontrado.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorDetailPage;