import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, Settings, LogOut, ChevronDown, UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      console.log("User detected in Header, fetching role...", user.id);
      fetchUserRole();
    }
  }, [user]);
  
  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching user role for ID:", user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, prestador_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole({ role: 'company', prestador_id: null });
      } else if (data) {
        console.log("User role data received:", data);
        setUserRole(data);
      } else {
        console.log("No user role found, defaulting to company");
        setUserRole({ role: 'company', prestador_id: null });
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole({ role: 'company', prestador_id: null });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Check if the user is a prestador and has a prestador_id
  const isPrestador = userRole?.role === 'prestador' && userRole?.prestador_id;
  
  console.log("Current user role:", userRole, "Is Prestador:", isPrestador);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center">
        <div className="flex-1">
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-medium text-gray-700 text-sm">
              {user?.email || 'Usuário'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
              {isPrestador ? (
                // Prestador option
                <button
                  onClick={() => {
                    console.log("Navigating to prestador details:", userRole?.prestador_id);
                    setIsDropdownOpen(false);
                    navigate(`/dashboard/prestador/${userRole?.prestador_id}`);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Detalhes do Prestador
                </button>
              ) : (
                // Company option
                <button
                  onClick={() => {
                    console.log("Navigating to settings");
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
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;