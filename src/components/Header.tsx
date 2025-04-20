import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, Settings, LogOut, ChevronDown } from 'lucide-react';

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  };

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
              A
            </div>
            <span className="font-medium text-gray-700 text-sm">
              Admin
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // TODO: Navigate to settings
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </button>
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