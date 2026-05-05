import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesAPI } from '../api';
import { Eye, Trash2, Edit, Search, Filter, X, CheckSquare, Square } from 'lucide-react';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSales, setSelectedSales] = useState([]);
  const [filters, setFilters] = useState({
    customer: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, searchTerm, filters]);

  const loadSales = async () => {
    try {
      const response = await salesAPI.getAll();
      setSales(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sales:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sales];

    // Search by invoice number
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by customer
    if (filters.customer) {
      filtered = filtered.filter(sale =>
        sale.customer.name.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(sale =>
        new Date(sale.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(sale =>
        new Date(sale.date) <= new Date(filters.dateTo)
      );
    }

    // Filter by amount range
    if (filters.minAmount) {
      filtered = filtered.filter(sale =>
        sale.grand_total >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(sale =>
        sale.grand_total <= parseFloat(filters.maxAmount)
      );
    }

    setFilteredSales(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      customer: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await salesAPI.delete(id);
        loadSales();
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const handleSelectSale = (saleId) => {
    setSelectedSales(prev => 
      prev.includes(saleId) 
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSales.length === filteredSales.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(filteredSales.map(s => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSales.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedSales.length} sale(s)?`)) {
      try {
        await Promise.all(selectedSales.map(id => salesAPI.delete(id)));
        setSelectedSales([]);
        loadSales();
      } catch (error) {
        console.error('Error deleting sales:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
        <Link
          to="/create-bill"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Bill
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              showFilters || hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />}
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input
                  type="text"
                  placeholder="Customer name..."
                  value={filters.customer}
                  onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="₹999999"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count and Bulk Actions */}
      <div className="flex justify-between items-center mb-4">
        {hasActiveFilters && (
          <div className="text-sm text-gray-600">
            Showing {filteredSales.length} of {sales.length} sales
          </div>
        )}
        {selectedSales.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedSales.length})
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sales found</p>
            <Link
              to="/create-bill"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create First Bill
            </Link>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sales match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {selectedSales.length === filteredSales.length && filteredSales.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CGST
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SGST
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grand Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className={selectedSales.includes(sale.id) ? 'bg-blue-50 hover:bg-gray-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleSelectSale(sale.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedSales.includes(sale.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {sale.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{sale.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{sale.cgst.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{sale.sgst.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{sale.grand_total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/invoice/${sale.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                      <Link
                        to={`/create-bill/${sale.id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
