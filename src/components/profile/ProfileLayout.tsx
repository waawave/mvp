import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  path: string;
}

interface ProfileLayoutProps {
  items: MenuItem[];
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ items, children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Mobile menu */}
      <div className="lg:hidden bg-gray-50">
        <nav className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 ${
                location.pathname === item.path
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <nav className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === item.path
                      ? 'text-gray-900 font-semibold bg-gray-100'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <main className="flex-1 lg:ml-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;