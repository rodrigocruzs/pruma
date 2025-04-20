import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, CreditCardIcon } from 'lucide-react';
const Sidebar = () => {
  return <aside className="w-64 bg-white shadow-md hidden md:block">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Sistema PJ</h1>
      </div>
      <nav className="mt-6">
        <NavLink to="/" className={({
        isActive
      }) => `flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${isActive ? 'bg-gray-100 border-l-4 border-blue-500' : ''}`} end>
          <HomeIcon className="h-5 w-5 mr-3" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/pagamentos" className={({
        isActive
      }) => `flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${isActive ? 'bg-gray-100 border-l-4 border-blue-500' : ''}`}>
          <CreditCardIcon className="h-5 w-5 mr-3" />
          <span>Pagamentos</span>
        </NavLink>
      </nav>
    </aside>;
};
export default Sidebar;