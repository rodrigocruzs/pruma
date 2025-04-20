import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ChevronDown } from 'lucide-react';

const PrestadorLayout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-800">Portal do Prestador</h1>
            </div>

            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>Usuário</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PrestadorLayout; 