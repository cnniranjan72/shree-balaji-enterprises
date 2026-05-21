import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customersAPI, productsAPI, salesAPI } from '../api';
import { Plus, Trash2, Save, Search } from 'lucide-react';

export default function CreateBill() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [items, setItems] = useState([
    {
      product_id: null,
      product_search: '',
      description: '',
      hsn_code: '',
      unit: '',
      quantity: 1,
      rate: 0,
      taxable_amount: 0,
      cgst: 0,
      sgst: 0,
      amount: 0,
      gst_percentage: 0,
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    if (isEditMode) {
      loadSale();
    }
  }, [id]);

  useEffect(() => {
    if (customerSearch) {
      searchCustomers(customerSearch);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll('');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const searchCustomers = async (searchTerm) => {
    try {
      const response = await customersAPI.getAll(searchTerm);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
      setFilteredCustomers([]);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadSale = async () => {
    setLoading(true);
    try {
      const response = await salesAPI.getById(id);
      const sale = response.data;
      
      setSelectedCustomer(sale.customer);
      
      const saleItems = sale.items.map(item => ({
        product_id: item.product_id,
        description: item.description,
        hsn_code: item.hsn_code || '',
      unit: item.unit || '',
      quantity: item.quantity,
      rate: item.rate,
      taxable_amount: item.taxable_amount || 0,
      cgst: item.cgst || 0,
      sgst: item.sgst || 0,
        gst_percentage: item.gst_percentage
      }));
      
      setItems(saleItems.length > 0 ? saleItems : [
        { product_id: null, description: '', hsn_code: '', quantity: 1, rate: 0, amount: 0, gst_percentage: 0 }
      ]);
    } catch (error) {
      console.error('Error loading sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const calculateItemValues = (item) => {
    const quantity = parseFloat(item.quantity || 0) || 0;
    const rate = parseFloat(item.rate || 0) || 0;
    const gst = parseFloat(item.gst_percentage || 0) || 0;
    const lineTotal = quantity * rate;
    const taxableAmount = gst > 0 ? lineTotal / (1 + gst / 100) : lineTotal;
    const gstTotal = lineTotal - taxableAmount;
    const cgst = gstTotal / 2;
    const sgst = gstTotal / 2;

    return {
      amount: parseFloat(lineTotal.toFixed(2)),
      taxable_amount: parseFloat(taxableAmount.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
    };
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        product_search: product.name,
        description: product.name,
        hsn_code: product.hsn_code || '',
        unit: product.unit || '',
        rate: product.default_price,
        gst_percentage: product.gst_percentage,
        quantity: newItems[index].quantity || 1,
        ...calculateItemValues({
          ...newItems[index],
          rate: product.default_price,
          gst_percentage: product.gst_percentage,
          quantity: newItems[index].quantity || 1,
        })
      };
      setItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'description') {
      newItems[index].product_search = value;
      newItems[index].product_id = null;
    }

    const updated = {
      ...newItems[index],
      [field]: value,
    };

    if (['quantity', 'rate', 'gst_percentage'].includes(field)) {
      Object.assign(updated, calculateItemValues(updated));
    }

    newItems[index] = updated;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_id: null,
      product_search: '',
      description: '',
      hsn_code: '',
      unit: '',
      quantity: 1,
      rate: 0,
      taxable_amount: 0,
      cgst: 0,
      sgst: 0,
      amount: 0,
      gst_percentage: 0,
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    items.forEach(item => {
      totalAmount += parseFloat(item.taxable_amount || 0);
      totalCGST += parseFloat(item.cgst || 0);
      totalSGST += parseFloat(item.sgst || 0);
    });

    const grandTotal = totalAmount + totalCGST + totalSGST;

    return {
      totalAmount: totalAmount.toFixed(2),
      cgst: totalCGST.toFixed(2),
      sgst: totalSGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const validItems = items.filter(item => item.description && item.quantity > 0 && item.rate > 0);
    
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const saleData = {
        customer_id: selectedCustomer.id,
        items: validItems.map(item => ({
          product_id: item.product_id,
          description: item.description,
          hsn_code: item.hsn_code,
          unit: item.unit,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount),
          taxable_amount: parseFloat(item.taxable_amount),
          cgst: parseFloat(item.cgst),
          sgst: parseFloat(item.sgst),
          gst_percentage: parseFloat(item.gst_percentage)
        }))
      };

      if (isEditMode) {
        await salesAPI.update(id, saleData);
        navigate(`/invoice/${id}`);
      } else {
        const response = await salesAPI.create(saleData);
        navigate(`/invoice/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      alert(`Error ${isEditMode ? 'updating' : 'creating'} bill. Please try again.`);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Bill' : 'Create New Bill'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Select Customer *</label>
              <div className="mt-1 relative" ref={dropdownRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Search customer by name, GSTIN, or phone..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                
                {/* Autocomplete Dropdown */}
                {showCustomerDropdown && (customerSearch || filteredCustomers.length > 0) && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          {customer.gstin && (
                            <div className="text-sm text-gray-500">GSTIN: {customer.gstin}</div>
                          )}
                          {customer.phone && (
                            <div className="text-sm text-gray-500">Phone: {customer.phone}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">
                        No customers found matching your search.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Hidden select for form validation */}
              <input
                type="hidden"
                required
                value={selectedCustomer ? selectedCustomer.id : ''}
              />
              
              {!selectedCustomer && (
                <p className="mt-1 text-sm text-red-500">Please select a customer</p>
              )}
            </div>
            {selectedCustomer && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCustomer.gstin || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCustomer.address || 'N/A'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST%</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxable</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">CGST</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">SGST</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Line Total</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => {
                  const filteredProducts = products.filter(product => {
                    const search = item.product_search.toLowerCase();
                    return (
                      product.name.toLowerCase().includes(search) ||
                      (product.hsn_code || '').toLowerCase().includes(search)
                    );
                  });

                  return (
                    <tr key={index}>
                      <td className="px-3 py-2 align-top">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.product_search}
                            onChange={(e) => handleItemChange(index, 'product_search', e.target.value)}
                            placeholder="Search or enter product"
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          {item.product_search && filteredProducts.length > 0 && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {filteredProducts.slice(0, 6).map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleProductSelect(index, product.id)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                >
                                  <span className="font-medium">{product.name}</span>
                                  <div className="text-xs text-gray-500">HSN: {product.hsn_code || 'N/A'} • {product.unit || 'Unit'} • ₹{product.default_price.toFixed(2)} • GST {product.gst_percentage}%</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          value={item.hsn_code}
                          onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                          placeholder="HSN"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="block w-20 ml-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="block w-24 ml-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.gst_percentage}
                          onChange={(e) => handleItemChange(index, 'gst_percentage', e.target.value)}
                          className="block w-20 ml-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top text-right text-sm font-medium">
                        ₹{parseFloat(item.taxable_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-sm font-medium">
                        ₹{parseFloat(item.cgst || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-sm font-medium">
                        ₹{parseFloat(item.sgst || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-sm font-medium">
                        ₹{parseFloat(item.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">₹{totals.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CGST:</span>
              <span className="font-medium">₹{totals.cgst}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SGST:</span>
              <span className="font-medium">₹{totals.sgst}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span>₹{totals.grandTotal}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="w-5 h-5 mr-2" />
            Create Bill
          </button>
        </div>
      </form>
    </div>
  );
}
