import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchasesAPI, purchaseSuppliersAPI, purchaseProductsAPI } from '../api';
import { ShoppingCart, Truck, Package, FileText, IndianRupee } from 'lucide-react';

export default function PurchaseDashboard() {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    outstandingBalance: 0,
    recentPurchases: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        purchasesAPI.getAll(),
        purchaseSuppliersAPI.getAll(),
        purchaseProductsAPI.getAll(),
      ]);

      const outstandingBalance = purchasesRes.data.reduce(
        (sum, p) => sum + (p.balance_due || 0),
        0
      );

      setStats({
        totalPurchases: purchasesRes.data.length,
        totalSuppliers: suppliersRes.data.length,
        totalProducts: productsRes.data.length,
        outstandingBalance,
        recentPurchases: purchasesRes.data.slice(0, 5),
      });
    } catch (error) {
      console.error('Error loading purchase stats:', error);
    }
  };

  const statCards = [
    { label: 'Total Purchases', value: stats.totalPurchases, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Suppliers', value: stats.totalSuppliers, icon: Truck, color: 'bg-green-500' },
    { label: 'Purchase Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
    { label: 'Outstanding Balance', value: `₹${stats.outstandingBalance.toFixed(2)}`, icon: IndianRupee, color: 'bg-orange-500' },
  ];

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchases Dashboard</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                      <dd className="text-xl font-semibold text-gray-900 truncate">{stat.value}</dd>
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
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Purchases</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {stats.recentPurchases.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No purchases yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentPurchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.bill_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(purchase.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{purchase.grand_total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{purchase.balance_due.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            purchase.payment_status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : purchase.payment_status === 'Partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {purchase.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/purchase-view/${purchase.id}`}
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
          to="/create-purchase"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FileText className="w-5 h-5 mr-2" />
          Create New Purchase
        </Link>
      </div>
    </div>
  );
}