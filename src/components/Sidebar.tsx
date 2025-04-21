import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, CreditCardIcon, Loader2Icon, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import prumaIcon from '../assets/images/pruma-icon.svg';

const Sidebar = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<{role: 'company' | 'prestador', prestador_id: string | null} | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch user role when component mounts or user changes
    if (user) {
      console.log("User detected in Sidebar, fetching role...", user.id);
      setLoading(true);
      fetchUserRole();
    }
  }, [user]);
  
  const fetchUserRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log("Sidebar: Fetching user role for ID:", user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, prestador_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Sidebar: Error fetching user role:', error);
        setUserRole({ role: 'company', prestador_id: null });
      } else if (data) {
        console.log("Sidebar: User role data received:", data);
        setUserRole(data);
      } else {
        console.log("Sidebar: No user role found, defaulting to company");
        setUserRole({ role: 'company', prestador_id: null });
      }
    } catch (err) {
      console.error('Sidebar: Error fetching user role:', err);
      setUserRole({ role: 'company', prestador_id: null });
    } finally {
      setLoading(false);
    }
  };
  
  // Check if the user is a prestador
  const isPrestador = userRole?.role === 'prestador';
  
  console.log("Sidebar: Current user role:", userRole, "Is Prestador:", isPrestador, "Loading:", loading);

  return (
    <aside className="w-64 bg-[#FCF8EE] shadow-md hidden md:block">
      <div className="p-6 flex items-center">
        <img src={prumaIcon} alt="Pruma" className="h-6 w-6 text-[#C49A22] mr-2" />
        <h1 className="text-xl font-bold text-[#C49A22]">Pruma</h1>
      </div>
      <nav className="mt-6">
        {/* Only render nav items once we've determined the role */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2Icon className="animate-spin h-5 w-5 text-[#C49A22]" />
          </div>
        ) : (
          <>
            {/* Only show Dashboard for Company users */}
            {!isPrestador && (
              <NavLink 
                to="/dashboard" 
                className={({isActive}) => 
                  `flex items-center px-6 py-3 text-gray-600 hover:bg-white ${
                    isActive ? 'bg-white border-l-4 border-[#C49A22]' : ''
                  }`
                } 
                end
              >
                <HomeIcon className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </NavLink>
            )}
            
            {!isPrestador && (
              <NavLink 
                to="/dashboard/folha" 
                className={({isActive}) => 
                  `flex items-center px-6 py-3 text-gray-600 hover:bg-white ${
                    isActive ? 'bg-white border-l-4 border-[#C49A22]' : ''
                  }`
                }
              >
                <Receipt className="h-5 w-5 mr-3" />
                <span>Folha PJ</span>
              </NavLink>
            )}
            
            <NavLink 
              to="/dashboard/pagamentos" 
              className={({isActive}) => 
                `flex items-center px-6 py-3 text-gray-600 hover:bg-white ${
                  isActive ? 'bg-white border-l-4 border-[#C49A22]' : ''
                }`
              }
            >
              <CreditCardIcon className="h-5 w-5 mr-3" />
              <span>Pagamentos</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;