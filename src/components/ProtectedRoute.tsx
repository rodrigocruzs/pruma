import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import FullScreenLoading from './FullScreenLoading';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('company' | 'prestador')[];  // Make it optional for now
}

interface UserRole {
  role: 'company' | 'prestador';
  prestador_id: string | null;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async (user: Session['user']) => {
      try {
        console.log('Fetching user role for ID:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, prestador_id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          // If there was an error fetching the role, create a default role
          try {
            console.log('Creating default company role for user:', user.id);
            const { error: createError } = await supabase
              .from('user_roles')
              .insert([
                { id: user.id, role: 'company', prestador_id: null }
              ]);
            
            if (createError) {
              console.error('Error creating default role:', createError);
              return { role: 'company', prestador_id: null };
            }
            
            return { role: 'company', prestador_id: null };
          } catch (createErr) {
            console.error('Exception creating default role:', createErr);
            return { role: 'company', prestador_id: null };
          }
        }

        if (!data) {
          console.log('No role found for user, creating default role');
          // If no role was found, create a default role
          try {
            const { error: createError } = await supabase
              .from('user_roles')
              .insert([
                { id: user.id, role: 'company', prestador_id: null }
              ]);
            
            if (createError) {
              console.error('Error creating default role:', createError);
            }
            
            return { role: 'company', prestador_id: null };
          } catch (createErr) {
            console.error('Exception creating default role:', createErr);
            return { role: 'company', prestador_id: null };
          }
        }

        console.log('User role data:', data);
        return data;
      } catch (err) {
        console.error('Exception in fetchUserRole:', err);
        return { role: 'company', prestador_id: null };
      }
    };

    const handleUserRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const roleData = await fetchUserRole(user);
        setUserRole(roleData as UserRole);
      } catch (err) {
        console.error('Error handling user role:', err);
        setUserRole({ role: 'company', prestador_id: null });
      } finally {
        setRoleLoading(false);
      }
    };

    handleUserRole();
  }, [user]);

  // Show loading state while checking authentication or role
  if (loading || roleLoading) {
    return <FullScreenLoading />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If no role check is required or user has allowed role, render the children
  if (!allowedRoles || !allowedRoles.length || (userRole && allowedRoles.includes(userRole.role))) {
    return <>{children}</>;
  }

  // If user doesn't have a required role, redirect to home page
  return <Navigate to="/" />;
}; 