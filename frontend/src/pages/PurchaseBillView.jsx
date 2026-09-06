import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { purchasesAPI, businessAPI } from '../api';
import { Printer, ArrowLeft, Wallet } from 'lucide-react';

export default function PurchaseBillView() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [savingPayment, setSavingPayment] = useState(false);
  const [printTimestamp] = useState(new Date());

  useEffect(() => {
    loadPurchase();
    loadBusiness();
  }, [id]);

  const loadPurchase = async () => {
    try {
      const response = await purchasesAPI.getById(id);
      setPurchase(response.data);
      setPaymentAmount(response.data.amount_paid || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading purchase:', error);
      setLoading(false);
    }
  };

  const loadBusiness = async () => {
    try {
      const response = await businessAPI.getInfo();
      setBusiness(response.data);
    } catch (error) {
      console.error('Error loading business info:', error);
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      const amount = parseFloat(paymentAmount || 0);
      if (amount > (purchase?.grand_total || 0)) {
        alert('Amount paid cannot exceed grand total');
        setSavingPayment(false);
        return;
      }
      await purchasesAPI.updatePayment(id, amount);
      setShowPaymentForm(false);
      await loadPurchase();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment. Please try again.');
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!purchase) {
    return <div className="text-center text-red-600">Purchase bill not found</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="no-print mb-4 flex justify-between">
        <Link
          to="/purchases-history"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Update Payment
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Bill
          </button>
        </div>
      </div>

      {showPaymentForm && (
        <div className="no-print mb-4 bg-white shadow rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Payment</h3>
          <form onSubmit={handlePaymentUpdate} className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (₹) — Grand Total ₹{purchase.grand_total.toFixed(2)}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={purchase.grand_total}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={savingPayment}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {savingPayment ? 'Saving...' : 'Save Payment'}
            </button>
          </form>
        </div>
      )}

      <div className="print-area bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto" style={{ fontSize: '12px' }}>
        <div className="border-2 border-gray-800 p-6">
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
            <h1 className="text-2xl font-bold uppercase">{business?.name || 'Business Name'}</h1>
            <p className="text-sm mt-2">{business?.address || 'Business Address'}</p>
            <p className="text-sm">Phone: {business?.phone || 'N/A'} | GSTIN: {business?.gstin || 'N/A'}</p>
          </div>

          <div className="text-center border-b border-gray-800 pb-2 mb-4">
            <h2 className="text-xl font-bold">PURCHASE BILL</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-bold">Bill No: {purchase.bill_number}</p>
              <p>Date: {new Date(purchase.invoice_date).toLocaleDateString('en-IN')}</p>
              <p>Printed on: {printTimestamp.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-bold">Supply From:</p>
              <p className="font-semibold">{purchase.supplier.name}</p>
              {purchase.supplier.gstin && <p>GSTIN: {purchase.supplier.gstin}</p>}
              {purchase.supplier.address && <p>{purchase.supplier.address}</p>}
              {purchase.supplier.phone && <p>Phone: {purchase.supplier.phone}</p>}
            </div>
          </div>

          <table className="w-full border border-gray-800 mb-4">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-800">
                <th className="border-r border-gray-800 px-2 py-2 text-left" style={{ width: '4%' }}>Sr.</th>
                <th className="border-r border-gray-800 px-2 py-2 text-left" style={{ width: '22%' }}>Description</th>
                <th className="border-r border-gray-800 px-2 py-2 text-left" style={{ width: '8%' }}>HSN</th>
                <th className="border-r border-gray-800 px-2 py-2 text-center" style={{ width: '11%' }}>Qty</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '9%' }}>Rate</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '10%' }}>Taxable</th>
                <th className="border-r border-gray-800 px-2 py-2 text-center" style={{ width: '7%' }}>GST%</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '9%' }}>CGST</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '9%' }}>SGST</th>
                <th className="px-2 py-2 text-right" style={{ width: '11%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="border-r border-gray-800 px-2 py-2">{index + 1}</td>
                  <td className="border-r border-gray-800 px-2 py-2">{item.description}</td>
                  <td className="border-r border-gray-800 px-2 py-2">{item.hsn_code || '-'}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-center">{item.quantity} {item.unit || ''}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">₹{(item.taxable_amount || 0).toFixed(2)}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-center">{item.gst_percentage || 0}%</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">₹{(item.cgst || 0).toFixed(2)}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">₹{(item.sgst || 0).toFixed(2)}</td>
                  <td className="px-2 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-4">
            <div className="w-64">
              <div className="flex justify-between py-1 border-b">
                <span>Taxable Amount:</span>
                <span className="font-semibold">₹{purchase.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>CGST:</span>
                <span className="font-semibold">₹{purchase.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>SGST:</span>
                <span className="font-semibold">₹{purchase.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Amount Paid:</span>
                <span className="font-semibold">₹{purchase.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Balance Due:</span>
                <span className={`font-bold ${purchase.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{purchase.balance_due.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b items-center">
                <span>Status:</span>
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
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-base">
                <span>Grand Total:</span>
                <span>₹{purchase.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mt-8 pt-4">
            <div>
              <p className="text-sm">Supplier Signature</p>
              <div className="border-t border-gray-800 w-48 mt-12"></div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{business?.name || 'Business Name'}</p>
              <div className="border-t border-gray-800 w-48 mt-12 ml-auto"></div>
              <p className="text-sm mt-1">Authorized Signatory</p>
            </div>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-gray-800 text-xs">
            <p>This is a computer generated purchase bill</p>
          </div>
        </div>
      </div>
    </div>
  );
}