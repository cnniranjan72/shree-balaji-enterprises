import { useState } from 'react';
import { exportAPI } from '../api';
import { Download, Calendar } from 'lucide-react';

export default function Export() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleMonthlyExport = async () => {
    setLoading(true);
    try {
      const response = await exportAPI.monthly(month, year);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_${year}_${month.toString().padStart(2, '0')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('No sales found for the selected month');
    } finally {
      setLoading(false);
    }
  };

  const handleAllExport = async () => {
    setLoading(true);
    try {
      const response = await exportAPI.all();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_sales_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('No sales found');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Sales Data</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Export Monthly Sales</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Export sales data for a specific month in Excel format
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleMonthlyExport}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Exporting...' : 'Export Monthly Data'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Download className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Export All Sales</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Export all sales data in Excel format
          </p>
          <div className="mt-16">
            <button
              onClick={handleAllExport}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Exporting...' : 'Export All Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Export Format</h4>
        <p className="text-sm text-blue-700">
          The exported Excel file will contain the following columns:
        </p>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
          <li>Invoice Number</li>
          <li>Date</li>
          <li>Customer Name & GSTIN</li>
          <li>Product Name & HSN Code</li>
          <li>Quantity, Rate, Amount</li>
          <li>GST Percentage, CGST, SGST</li>
          <li>Total Amount</li>
        </ul>
      </div>
    </div>
  );
}
