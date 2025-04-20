import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

// Define the expected shape of a contractor object
interface PrestadorPJ {
  id: string;
  nome: string;
  sobrenome: string;
  funcao: string | null;
  data_inicio: string;
  ativo: boolean;
}

// Define the props for the component
interface ContractorsListProps {
  contractors: PrestadorPJ[];
}

const ContractorsList: React.FC<ContractorsListProps> = ({ contractors }) => {
  const navigate = useNavigate();

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
    navigate(`/prestador/${id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
          {contractors.map(contractor => (
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
    </div>
  );
};

export default ContractorsList;