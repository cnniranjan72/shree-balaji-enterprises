import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customersAPI, productsAPI, salesAPI } from '../api';
import { Plus, Trash2, Save, Search, ChevronDown } from 'lucide-react';

const ALLOWED_UNITS = ['Pieces', 'Boxes', 'Dozen', 'Sheets', 'Packets', 'Tubes'];

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
  const [activeProductDropdown, setActiveProductDropdown] = useState(null);
  const [productHighlightIndex, setProductHighlightIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const productDropdownRefs = useRef({});
  const [items, setItems] = useState([
    {
      product_id: null,
      product_search: '',
      description: '',
      hsn_code: '',
      unit: 'Pieces',
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
      // Close product dropdown if clicking outside
      if (activeProductDropdown !== null) {
        const ref = productDropdownRefs.current[activeProductDropdown];
        if (ref && !ref.contains(event.target)) {
          setActiveProductDropdown(null);
          setProductHighlightIndex(-1);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeProductDropdown]);

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
      setCustomerSearch(sale.customer.name);
      
      const saleItems = sale.items.map(item => ({
        product_id: item.product_id,
        product_search: item.description || '',
        description: item.description,
        hsn_code: item.hsn_code || '',
        unit: item.unit || 'Pieces',
        quantity: item.quantity,
        rate: item.rate,
        taxable_amount: item.taxable_amount || 0,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        amount: item.amount || 0,
        gst_percentage: item.gst_percentage
      }));
      
      setItems(saleItems.length > 0 ? saleItems : [
        { product_id: null, product_search: '', description: '', hsn_code: '', unit: 'Pieces', quantity: 1, rate: 0, taxable_amount: 0, cgst: 0, sgst: 0, amount: 0, gst_percentage: 0 }
      ]);
    } catch (error) {
      console.error('Error loading sale:', error);
    } finally {
      setLoading(false);
    }
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
      // Map product unit to allowed units, default to Pieces
      let unit = product.unit || 'Pieces';
      if (!ALLOWED_UNITS.includes(unit)) {
        unit = 'Pieces';
      }
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        product_search: product.name,
        description: product.name,
        hsn_code: product.hsn_code || '',
        unit: unit,
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
    setActiveProductDropdown(null);
    setProductHighlightIndex(-1);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'product_search') {
      newItems[index].description = value;
      newItems[index].product_id = null;
      setActiveProductDropdown(index);
      setProductHighlightIndex(-1);
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

  const handleProductKeyDown = (e, index, filteredProducts) => {
    if (!filteredProducts || filteredProducts.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setProductHighlightIndex(prev => 
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setProductHighlightIndex(prev => 
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === 'Enter' && productHighlightIndex >= 0) {
      e.preventDefault();
      handleProductSelect(index, filteredProducts[productHighlightIndex].id);
    } else if (e.key === 'Escape') {
      setActiveProductDropdown(null);
      setProductHighlightIndex(-1);
    }
  };

  const addItem = () => {
    setItems([...items, {
      product_id: null,
      product_search: '',
      description: '',
      hsn_code: '',
      unit: 'Pieces',
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

  // Items typed by hand (no product picked from the dropdown) are added to the
  // product catalog so they're searchable next time. Returns the items with
  // product_id filled in wherever we could match or create one.
  const resolveProductIds = async (validItems) => {
    const byName = new Map(
      products.map(p => [p.name.trim().toLowerCase(), p])
    );
    let createdAny = false;

    const resolved = [];
    for (const item of validItems) {
      if (item.product_id) {
        resolved.push(item);
        continue;
      }

      const name = (item.description || '').trim();
      const key = name.toLowerCase();
      if (!name) {
        resolved.push(item);
        continue;
      }

      const existing = byName.get(key);
      if (existing) {
        resolved.push({ ...item, product_id: existing.id });
        continue;
      }

      try {
        const response = await productsAPI.create({
          name,
          hsn_code: item.hsn_code || null,
          unit: ALLOWED_UNITS.includes(item.unit) ? item.unit : 'Pieces',
          default_price: parseFloat(item.rate) || 0,
          gst_percentage: parseFloat(item.gst_percentage) || 0,
        });
        byName.set(key, response.data);
        createdAny = true;
        resolved.push({ ...item, product_id: response.data.id });
      } catch (error) {
        // Never block saving the bill just because the catalog write failed.
        console.error('Could not add product to catalog:', name, error);
        resolved.push(item);
      }
    }

    if (createdAny) {
      loadProducts();
    }
    return resolved;
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
      const itemsToSave = await resolveProductIds(validItems);

      const saleData = {
        customer_id: selectedCustomer.id,
        items: itemsToSave.map(item => ({
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
        {/* Customer Details */}
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
                
                {showCustomerDropdown && (customerSearch || filteredCustomers.length > 0) && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
                      <div className="px-4 py-3 text-gray-500">No customers found.</div>
                    )}
                  </div>
                )}
              </div>
              
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

        {/* Items */}
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

          {/* Item Cards - better for complex inputs than cramped table */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const tokens = (item.product_search || '').toLowerCase().split(/\s+/).filter(Boolean);
              const filteredProducts = tokens.length
                ? products.filter(product => {
                    const haystack = `${product.name} ${product.hsn_code || ''}`.toLowerCase();
                    return tokens.every(token => haystack.includes(token));
                  })
                : [];
              const showDropdown = activeProductDropdown === index && filteredProducts.length > 0;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {/* Row header */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-500">Item #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product search + HSN row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                    {/* Product Search */}
                    <div className="sm:col-span-8 relative" ref={el => productDropdownRefs.current[index] = el}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          value={item.product_search || ''}
                          onChange={(e) => handleItemChange(index, 'product_search', e.target.value)}
                          onFocus={() => {
                            if (item.product_search) setActiveProductDropdown(index);
                          }}
                          onKeyDown={(e) => handleProductKeyDown(e, index, filteredProducts)}
                          placeholder="Search product or type name..."
                          className="pl-8 pr-3 py-2 w-full border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Product Dropdown - overlay style */}
                      {showDropdown && (
                        <div className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-1.5 text-xs text-gray-500">
                            {filteredProducts.length} matching product{filteredProducts.length === 1 ? '' : 's'}
                          </div>
                          {filteredProducts.map((product, pIdx) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleProductSelect(index, product.id)}
                              className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors ${
                                pIdx === productHighlightIndex
                                  ? 'bg-blue-50 border-l-2 border-l-blue-500'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="font-medium text-sm text-gray-900">{product.name}</div>
                              <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                                <span>HSN: {product.hsn_code || '—'}</span>
                                <span>₹{product.default_price.toFixed(2)}</span>
                                <span>GST {product.gst_percentage}%</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* HSN */}
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">HSN Code</label>
                      <input
                        type="text"
                        value={item.hsn_code}
                        onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                        placeholder="HSN"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Qty, Unit, Rate, GST row */}
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 mb-3">
                    {/* Quantity */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Unit - Fixed dropdown */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                      <div className="relative">
                        <select
                          value={item.unit || 'Pieces'}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full appearance-none border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {ALLOWED_UNITS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Rate */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* GST % */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">GST %</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.gst_percentage}
                        onChange={(e) => handleItemChange(index, 'gst_percentage', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Line Total (display) */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Line Total</label>
                      <div className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm font-semibold text-gray-900">
                        ₹{parseFloat(item.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* GST breakdown row */}
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-md p-2">
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Taxable</span>
                      <p className="text-sm font-medium">₹{parseFloat(item.taxable_amount || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">CGST</span>
                      <p className="text-sm font-medium">₹{parseFloat(item.cgst || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">SGST</span>
                      <p className="text-sm font-medium">₹{parseFloat(item.sgst || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxable Amount:</span>
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
            {isEditMode ? 'Update Bill' : 'Create Bill'}
          </button>
        </div>
      </form>
    </div>
  );
}
