import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0">
            Онлайн ҳарита лойиҳалари
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">{user?.name}</span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
