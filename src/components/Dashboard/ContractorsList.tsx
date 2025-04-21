import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// Define the expected shape of a contractor object
interface PrestadorPJ {
  id: string;
  nome: string;
  sobrenome: string;
  funcao: string | null;
  data_inicio: string;
  ativo: boolean;
}

const ContractorsList = () => {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<PrestadorPJ[]>([]);
  const [activeContractors, setActiveContractors] = useState<PrestadorPJ[]>([]);
  const [inactiveContractors, setInactiveContractors] = useState<PrestadorPJ[]>([]);
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractors = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('PrestadorPJ')
          .select('*')
          .order('nome');

        if (fetchError) throw fetchError;

        setContractors(data || []);
        setActiveContractors(data?.filter(c => c.ativo) || []);
        setInactiveContractors(data?.filter(c => !c.ativo) || []);
      } catch (err: any) {
        console.error('Error fetching contractors:', err);
        setError('Falha ao carregar prestadores.');
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      // Supabase dates might be YYYY-MM-DD
      const date = new Date(dateString + 'T00:00:00'); // Add time part to avoid timezone issues
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Data inválida';
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/dashboard/prestador/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="animate-spin h-8 w-8 text-[#C49A22]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );
  }

  const displayContractors = activeTab === 'ativos' ? activeContractors : inactiveContractors;

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('ativos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ativos'
                ? 'border-[#C49A22] text-[#C49A22]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ativos ({activeContractors.length})
          </button>
          <button
            onClick={() => setActiveTab('inativos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inativos'
                ? 'border-[#C49A22] text-[#C49A22]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inativos ({inactiveContractors.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {displayContractors.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum prestador {activeTab === 'ativos' ? 'ativo' : 'inativo'} encontrado.
          </div>
        ) : (
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-[35%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th scope="col" className="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Início
                </th>
                <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayContractors.map(contractor => (
                <tr
                  key={contractor.id}
                  onClick={() => handleRowClick(contractor.id)}
                  className="hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap truncate">
                    <div className="font-medium text-gray-900">
                      {contractor.nome} {contractor.sobrenome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate">
                    <div className="text-sm text-gray-500">{contractor.funcao ?? 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate">
                    <div className="text-sm text-gray-500">
                      {formatDate(contractor.data_inicio)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contractor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {contractor.ativo ? (
                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                      ) : (
                        <XCircleIcon className="mr-1 h-4 w-4" />
                      )}
                      {contractor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ContractorsList;