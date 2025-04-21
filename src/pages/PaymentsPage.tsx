import React, { useState, useEffect } from 'react';
import { CreditCardIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon, FileTextIcon, Loader2Icon, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import InvoiceUpload from '../components/InvoiceUpload';
import InvoiceView from '../components/InvoiceView';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: string;
  prestador_id: string;
  prestador_nome: string;
  prestador_sobrenome: string;
  data: string;
  mes_referente: string;
  valor: number;
  status: 'pago' | 'pendente';
  nf_id: string | null;
}

interface PaymentResponse {
  id: string;
  prestador_id: string;
  data: string;
  mes_referente: string;
  valor: number;
  status: 'pago' | 'pendente';
  nf_id: string | null;
  PrestadorPJ: {
    nome: string;
    sobrenome: string;
  };
}

const PaymentsPage = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<{role: 'company' | 'prestador', prestador_id: string | null} | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [processingPayments, setProcessingPayments] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Define pendingPayments at the beginning
  const pendingPayments = payments.filter(payment => payment.status === 'pendente');
  
  useEffect(() => {
    fetchUserRole();
  }, []);

  // Reset selected payments when component mounts
  useEffect(() => {
    setSelectedPayments([]);
  }, []);

  // Clear selections when pendingPayments becomes empty
  useEffect(() => {
    if (pendingPayments.length === 0) {
      setSelectedPayments([]);
    }
  }, [pendingPayments.length]);

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
      fetchPayments();
    }
  };

  const fetchPayments = async () => {
    if (!supabase) {
      setError('Supabase client não está disponível.');
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('Pagamento')
        .select(`
          id,
          prestador_id,
          data,
          mes_referente,
          valor,
          status,
          nf_id,
          PrestadorPJ!inner (
            nome,
            sobrenome
          )
        `);
      
      // Filter by prestador_id if user is a prestador
      if (userRole?.role === 'prestador' && userRole?.prestador_id) {
        query = query.eq('prestador_id', userRole.prestador_id);
      }
      
      // Order by created_at
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!data) {
        setPayments([]);
        return;
      }

      const formattedPayments = data.map((payment: any) => ({
        id: payment.id,
        prestador_id: payment.prestador_id,
        prestador_nome: payment.PrestadorPJ.nome,
        prestador_sobrenome: payment.PrestadorPJ.sobrenome,
        data: payment.data,
        mes_referente: payment.mes_referente,
        valor: payment.valor,
        status: payment.status,
        nf_id: payment.nf_id
      }));

      setPayments(formattedPayments);
      // Reset selected payments when loading new data
      setSelectedPayments([]);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError('Falha ao carregar pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatCurrency = (value: number): string => {
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
      // Capitalize first letter of month
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      return `${capitalizedMonth}-${year}`;
    } catch (error) {
      return 'Data inválida';
    }
  };

  const handleProcessSelected = async () => {
    if (!supabase) return;
    
    setProcessingPayments(true);
    try {
      const { error: updateError } = await supabase
        .from('Pagamento')
        .update({ status: 'pago' })
        .in('id', selectedPayments);

      if (updateError) throw updateError;

      // Refresh payments after update
      await fetchPayments();
      setSelectedPayments([]);
    } catch (err: any) {
      console.error('Error processing payments:', err);
      setError('Falha ao processar pagamentos.');
    } finally {
      setProcessingPayments(false);
    }
  };

  const handleSelectPayment = (id: string) => {
    setSelectedPayments(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    // If all pending payments are currently selected, deselect all
    if (pendingPayments.length > 0 && selectedPayments.length === pendingPayments.length) {
      setSelectedPayments([]);
    } else {
      // Otherwise, select all pending payments
      setSelectedPayments(pendingPayments.map(p => p.id));
    }
  };

  const selectedTotal = payments
    .filter(payment => selectedPayments.includes(payment.id))
    .reduce((sum, payment) => sum + payment.valor, 0);

  const currentMonthPaymentsWithoutInvoice = payments.filter(p => {
    const paymentDate = new Date(p.data);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && 
           paymentDate.getFullYear() === now.getFullYear() && 
           !p.nf_id;
  });

  const handleInvoiceError = (error: string) => {
    setInvoiceError(error);
    setTimeout(() => setInvoiceError(null), 5000);
  };

  const handleInvoiceUploadComplete = () => {
    fetchPayments();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Loader2Icon className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando pagamentos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}
      
      {invoiceError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {invoiceError}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
        <div className="flex items-center gap-4">
          {userRole?.role === 'company' && (
            <button
              onClick={() => navigate('/dashboard/folha')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Folha PJ
            </button>
          )}
          {selectedPayments.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedPayments.length} pagamento
                {selectedPayments.length !== 1 ? 's' : ''} selecionado
                {selectedPayments.length !== 1 ? 's' : ''} (
                {formatCurrency(selectedTotal)})
              </span>
              <button 
                onClick={handleProcessSelected} 
                disabled={processingPayments} 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                {processingPayments ? 'Processando...' : 'Processar Selecionados'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Mês Atual</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pagamentos Realizados</p>
            <p className="text-xl font-semibold">
              {payments.filter(p => {
                const paymentDate = new Date(p.data);
                const now = new Date();
                return p.status === 'pago' && 
                       paymentDate.getMonth() === now.getMonth() && 
                       paymentDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-full bg-amber-100">
              <FileTextIcon className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500">Mês Atual</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Notas Fiscais Pendentes</p>
            <p className="text-xl font-semibold">
              {currentMonthPaymentsWithoutInvoice.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-700">
            Todos os Pagamentos
          </h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <label className="flex items-center">
                  {pendingPayments.length > 0 ? (
                    <input 
                      type="checkbox" 
                      checked={selectedPayments.length === pendingPayments.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600"
                    />
                  ) : (
                    <input 
                      type="checkbox" 
                      disabled
                      className="rounded border-gray-300 text-gray-400 cursor-not-allowed"
                    />
                  )}
                </label>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prestador
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mês Referente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data do Pagamento
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.status === 'pendente' && (
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => handleSelectPayment(payment.id)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.prestador_nome} {payment.prestador_sobrenome}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatMonth(payment.mes_referente)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(payment.data)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(payment.valor)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'pago' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'pago' ? 'Pago' : 'Pendente'}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;