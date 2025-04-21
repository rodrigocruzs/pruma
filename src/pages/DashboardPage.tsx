import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContractorsList from '../components/Dashboard/ContractorsList';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2Icon, PlusIcon } from 'lucide-react';

interface UserRole {
  role: 'company' | 'prestador';
  prestador_id: string | null;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, prestador_id')
          .eq('id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          // Assume company role as default
          setUserRole({ role: 'company', prestador_id: null });
        } else if (data && data.length > 0) {
          setUserRole(data[0] as UserRole);
          
          // If user is a prestador, redirect them to the payments page instead of details page
          if (data[0].role === 'prestador' && data[0].prestador_id) {
            // Navigate to the payments page
            navigate('/dashboard/pagamentos', { replace: true });
          }
        } else {
          // No role found, create a default company role
          console.log('No role found for user in Dashboard, using default company role');
          
          // Try to create a company role
          try {
            const { error: createError } = await supabase
              .from('user_roles')
              .insert([
                { id: user.id, role: 'company', prestador_id: null }
              ]);
              
            if (createError) {
              console.error('Error creating user role:', createError);
            }
          } catch (createErr) {
            console.error('Failed to create user role:', createErr);
          }
          
          // Use company role as default
          setUserRole({ role: 'company', prestador_id: null });
        }
      } catch (err) {
        console.error('Unexpected error fetching user role:', err);
        // Assume company role as default
        setUserRole({ role: 'company', prestador_id: null });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="animate-spin h-8 w-8 text-blue-600" />
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

  // For company users or unknown roles, show the contractors list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prestadores</h1>
        <button
          onClick={() => navigate('/dashboard/adicionar-prestador')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Adicionar Prestador
        </button>
      </div>
      <ContractorsList />
    </div>
  );
};

export default DashboardPage;