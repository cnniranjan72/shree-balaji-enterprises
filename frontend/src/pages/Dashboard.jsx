import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesAPI, customersAPI, productsAPI } from '../api';
import { FileText, Users, Package, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentSales: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [salesRes, customersRes, productsRes] = await Promise.all([
        salesAPI.getAll(),
        customersAPI.getAll(),
        productsAPI.getAll(),
      ]);

      setStats({
        totalSales: salesRes.data.length,
        totalCustomers: customersRes.data.length,
        totalProducts: productsRes.data.length,
        recentSales: salesRes.data.slice(0, 5),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    { label: 'Total Sales', value: stats.totalSales, icon: FileText, color: 'bg-blue-500' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'bg-green-500' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
  ];

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Sales</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {stats.recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sales yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{sale.grand_total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/invoice/${sale.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          to="/create-bill"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FileText className="w-5 h-5 mr-2" />
          Create New Bill
        </Link>
      </div>
    </div>
  );
}
