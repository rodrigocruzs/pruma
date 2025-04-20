import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOutIcon, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Sidebar from './Sidebar';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<{role: 'company' | 'prestador', prestador_id: string | null} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    // Fetch user role when component mounts or user changes
    if (user) {
      console.log("User detected in Layout, fetching role...", user.id);
      fetchUserRole();
    }
  }, [user]);
  
  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      console.log("Layout: Fetching user role for ID:", user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, prestador_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Layout: Error fetching user role:', error);
        setUserRole({ role: 'company', prestador_id: null });
      } else if (data) {
        console.log("Layout: User role data received:", data);
        setUserRole(data);
      } else {
        console.log("Layout: No user role found, defaulting to company");
        setUserRole({ role: 'company', prestador_id: null });
      }
    } catch (err) {
      console.error('Layout: Error fetching user role:', err);
      setUserRole({ role: 'company', prestador_id: null });
    }
  };
  
  // Check if the user is a prestador and has a prestador_id
  const isPrestador = userRole?.role === 'prestador' && userRole?.prestador_id;
  
  console.log("Layout: Current user role:", userRole, "Is Prestador:", isPrestador);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  {/* Folha PJ text removed */}
                </div>
              </div>
              <div className="flex items-center">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center p-2"
                  >
                    <UserCircle className="h-6 w-6 text-gray-600 stroke-[1.5]" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                      {isPrestador ? (
                        // Prestador option
                        <button
                          onClick={() => {
                            console.log("Layout: Navigating to prestador details:", userRole?.prestador_id);
                            setIsDropdownOpen(false);
                            navigate(`/prestador/${userRole?.prestador_id}`);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Detalhes do Prestador
                        </button>
                      ) : (
                        // Company option
                        <button
                          onClick={() => {
                            console.log("Layout: Navigating to settings");
                            setIsDropdownOpen(false);
                            navigate('/dashboard/configuracoes');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOutIcon className="h-4 w-4 mr-2" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;