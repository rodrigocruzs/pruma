import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, Loader2Icon, FileTextIcon } from 'lucide-react';
import ContractorsList from '../components/Dashboard/ContractorsList';
import { supabase } from '../lib/supabaseClient';

interface Contractor {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  funcao: string | null;
  remuneracao: number;
  ativo: boolean;
  data_inicio: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');

  useEffect(() => {
    const fetchContractors = async () => {
      if (!supabase) {
        setError('Supabase client não está disponível.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('PrestadorPJ')
          .select('*')
          .order('nome');

        if (fetchError) throw fetchError;

        setContractors(data || []);
      } catch (err: any) {
        console.error('Error fetching contractors:', err);
        setError('Falha ao carregar prestadores.');
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const activeContractors = contractors.filter(c => c.ativo);
  const inactiveContractors = contractors.filter(c => !c.ativo);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Loader2Icon className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando prestadores...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Prestadores de Serviços
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/pagamentos/lote')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FileTextIcon className="h-5 w-5 mr-2" />
            Iniciar Folha PJ
          </button>
          <button
            onClick={() => navigate('/adicionar-prestador')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Prestador
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ativos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ativos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ativos ({activeContractors.length})
              </button>
              <button
                onClick={() => setActiveTab('inativos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inativos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inativos ({inactiveContractors.length})
              </button>
            </nav>
          </div>

          <div className="mt-6">
            <ContractorsList
              contractors={activeTab === 'ativos' ? activeContractors : inactiveContractors}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;