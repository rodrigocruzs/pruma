import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, Receipt, Loader2Icon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Contractor {
  id: string;
  nome: string;
  sobrenome: string;
  funcao: string;
  remuneracao: number;
  chave_pix?: string | null;
  commission?: number;
  discount?: number;
  selected?: boolean;
  mes_referente?: string;
  mes_selecionado?: string;
  ano_selecionado?: string;
}

const BatchPaymentPage = () => {
  const navigate = useNavigate();
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const monthOptions = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i)
  }));

  useEffect(() => {
    const fetchContractors = async () => {
      if (!supabase) {
        setError('Supabase client não está disponível.');
        setInitialLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('PrestadorPJ')
          .select('id, nome, sobrenome, funcao, remuneracao')
          .eq('ativo', true)
          .order('nome');

        if (fetchError) throw fetchError;

        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const currentYear = String(new Date().getFullYear());

        const formattedContractors = data.map(contractor => ({
          ...contractor,
          commission: 0,
          discount: 0,
          mes_selecionado: currentMonth,
          ano_selecionado: currentYear
        }));

        setContractors(formattedContractors);
      } catch (err: any) {
        console.error('Error fetching contractors:', err);
        setError('Falha ao carregar prestadores.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContractors(contractors.map(c => c.id));
    } else {
      setSelectedContractors([]);
    }
  };

  const handleSelectContractor = (id: string) => {
    setSelectedContractors(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  const handleCommissionChange = (id: string, value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanValue;
    const numValue = parseFloat(formattedValue) || 0;
    if (numValue < 0) return;
    setContractors(prev => prev.map(contractor => contractor.id === id ? {
      ...contractor,
      commission: numValue
    } : contractor));
  };

  const handleDiscountChange = (id: string, value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanValue;
    const numValue = parseFloat(formattedValue) || 0;
    if (numValue < 0) return;
    setContractors(prev => prev.map(contractor => contractor.id === id ? {
      ...contractor,
      discount: numValue
    } : contractor));
  };

  const handleMonthChange = (id: string, month: string) => {
    setContractors(prev => prev.map(contractor => 
      contractor.id === id ? {
        ...contractor,
        mes_selecionado: month,
        mes_referente: `${contractor.ano_selecionado}-${month}`
      } : contractor
    ));
  };

  const handleYearChange = (id: string, year: string) => {
    setContractors(prev => prev.map(contractor => 
      contractor.id === id ? {
        ...contractor,
        ano_selecionado: year,
        mes_referente: `${year}-${contractor.mes_selecionado}`
      } : contractor
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalAmount = contractors
    .filter(c => selectedContractors.includes(c.id))
    .reduce((sum, c) => sum + c.remuneracao + (c.commission || 0) - (c.discount || 0), 0);

  const handleCreatePayments = async () => {
    if (selectedContractors.length === 0) {
      setError('Selecione pelo menos um prestador para criar pagamentos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const selectedPayments = contractors
        .filter(c => selectedContractors.includes(c.id))
        .map(c => ({
          prestador_id: c.id,
          valor: c.remuneracao + (c.commission || 0) - (c.discount || 0),
          data: new Date().toISOString(),
          mes_referente: `${c.ano_selecionado}-${c.mes_selecionado}-01`,
          status: 'pendente',
          created_at: new Date().toISOString(),
          created_by: user.id
        }));

      const { error: insertError } = await supabase
        .from('Pagamento')
        .insert(selectedPayments);

      if (insertError) throw insertError;

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error creating payments:', err);
      setError('Falha ao criar pagamentos. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Loader2Icon className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando prestadores...</p>
      </div>
    );
  }

  return <div className="container mx-auto px-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">
            Criar Pagamentos em Lote
          </h1>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" checked={selectedContractors.length === contractors.length} onChange={handleSelectAll} />
              <span className="ml-2 text-gray-700">Selecionar Todos</span>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <span className="sr-only">Selecionar</span>
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remuneração
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comissão
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descontos
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês Referente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractors.map(contractor => <tr key={contractor.id}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" checked={selectedContractors.includes(contractor.id)} onChange={() => handleSelectContractor(contractor.id)} />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {contractor.nome} {contractor.sobrenome}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{contractor.funcao}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      {formatCurrency(contractor.remuneracao)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <input type="text" value={contractor.commission || ''} onChange={e => handleCommissionChange(contractor.id, e.target.value)} className="w-24 p-1 pl-7 border border-gray-300 rounded-md" placeholder="0,00" />
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <input type="text" value={contractor.discount || ''} onChange={e => handleDiscountChange(contractor.id, e.target.value)} className="w-24 p-1 pl-7 border border-gray-300 rounded-md" placeholder="0,00" />
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap font-medium">
                      {formatCurrency(contractor.remuneracao + (contractor.commission || 0) - (contractor.discount || 0))}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          className="p-1 border border-gray-300 rounded-md"
                          value={contractor.mes_selecionado}
                          onChange={(e) => handleMonthChange(contractor.id, e.target.value)}
                        >
                          {monthOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="p-1 border border-gray-300 rounded-md"
                          value={contractor.ano_selecionado}
                          onChange={(e) => handleYearChange(contractor.id, e.target.value)}
                        >
                          {yearOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                Total selecionado: {formatCurrency(totalAmount)}
              </div>
              <button onClick={handleCreatePayments} disabled={selectedContractors.length === 0 || loading} className={`flex items-center px-4 py-2 rounded-md ${selectedContractors.length === 0 || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {loading ? 'Processando...' : <>
                    <Receipt className="h-5 w-5 mr-2" />
                    Criar Pagamentos
                  </>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Pagamentos criados com sucesso!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Os pagamentos foram criados e estão prontos para processamento.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/pagamentos')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir para Pagamentos
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
};

export default BatchPaymentPage;