import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, Users, Package, FileText, Download } from 'lucide-react';
import { businessAPI } from '../api';
import { useAuth } from '../contexts/AuthContext.jsx';
import PinOverlay from './PinOverlay';

export default function Layout({ children }) {
  const location = useLocation();
  const [businessName, setBusinessName] = useState('Shree Balaji Enterprises');
  const { showPinOverlay } = useAuth();

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await businessAPI.getInfo();
        setBusinessName(response.data.name);
      } catch (error) {
        console.error('Error fetching business info:', error);
      }
    };
    fetchBusinessInfo();
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/create-bill', icon: FileText, label: 'Create Bill' },
    { path: '/sales', icon: FileText, label: 'Sales' },
    { path: '/export', icon: Download, label: 'Export' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-600">{businessName}</span>
                  <h1 className="text-xl font-bold text-gray-900">GST Billing System</h1>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <PinOverlay />
    </div>
  );
}
