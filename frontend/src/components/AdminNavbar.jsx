import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: '📊' },
    { name: 'Questions', path: '/admin/questions', icon: '📝' },
    { name: 'Contests', path: '/admin/contests', icon: '🏆' }
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
<path>Frontend src components_</path>
