import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { salesAPI, businessAPI } from '../api';
import { Printer } from 'lucide-react';

export default function Invoice() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
    loadBusiness();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const response = await salesAPI.getById(id);
      setSale(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading invoice:', error);
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

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero';
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim() + ' Rupees Only';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!sale) {
    return <div className="text-center text-red-600">Invoice not found</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="no-print mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </button>
      </div>

      <div className="print-area bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto" style={{ fontSize: '12px' }}>
        <div className="border-2 border-gray-800 p-6">
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
            <h1 className="text-2xl font-bold uppercase">{business?.name || 'Business Name'}</h1>
            <p className="text-sm mt-2">{business?.address || 'Business Address'}</p>
            <p className="text-sm">Phone: {business?.phone || 'N/A'} | GSTIN: {business?.gstin || 'N/A'}</p>
          </div>

          <div className="text-center border-b border-gray-800 pb-2 mb-4">
            <h2 className="text-xl font-bold">TAX INVOICE</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-bold">Invoice No: {sale.invoice_number}</p>
              <p>Date: {new Date(sale.date).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Bill To:</p>
              <p className="font-semibold">{sale.customer.name}</p>
              {sale.customer.gstin && <p>GSTIN: {sale.customer.gstin}</p>}
              {sale.customer.address && <p>{sale.customer.address}</p>}
              {sale.customer.phone && <p>Phone: {sale.customer.phone}</p>}
            </div>
          </div>

          <table className="w-full border border-gray-800 mb-4">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-800">
                <th className="border-r border-gray-800 px-2 py-2 text-left" style={{ width: '5%' }}>Sr.</th>
                <th className="border-r border-gray-800 px-2 py-2 text-left" style={{ width: '35%' }}>Description</th>
                <th className="border-r border-gray-800 px-2 py-2 text-left" style={{ width: '10%' }}>HSN</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '10%' }}>Qty</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '12%' }}>Rate</th>
                <th className="border-r border-gray-800 px-2 py-2 text-right" style={{ width: '8%' }}>GST%</th>
                <th className="px-2 py-2 text-right" style={{ width: '20%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="border-r border-gray-800 px-2 py-2">{index + 1}</td>
                  <td className="border-r border-gray-800 px-2 py-2">{item.description}</td>
                  <td className="border-r border-gray-800 px-2 py-2">{item.hsn_code || '-'}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">{item.quantity}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="border-r border-gray-800 px-2 py-2 text-right">{item.gst_percentage}%</td>
                  <td className="px-2 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-4">
            <div className="w-64">
              <div className="flex justify-between py-1 border-b">
                <span>Taxable Amount:</span>
                <span className="font-semibold">₹{sale.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>CGST:</span>
                <span className="font-semibold">₹{sale.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>SGST:</span>
                <span className="font-semibold">₹{sale.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-base">
                <span>Grand Total:</span>
                <span>₹{sale.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-800 p-2 mb-4">
            <p className="font-semibold">Amount in Words:</p>
            <p className="uppercase">{numberToWords(Math.floor(sale.grand_total))}</p>
          </div>

          {business && (
            <div className="mb-4 text-sm">
              <p className="font-semibold">Bank Details:</p>
              <p>Bank: {business.bank_name}</p>
              <p>A/C No: {business.account_number}</p>
              <p>IFSC: {business.ifsc}</p>
              <p>Branch: {business.branch}</p>
            </div>
          )}

          <div className="flex justify-between items-end mt-8 pt-4">
            <div>
              <p className="text-sm">Customer Signature</p>
              <div className="border-t border-gray-800 w-48 mt-12"></div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{business?.name || 'Business Name'}</p>
              <div className="border-t border-gray-800 w-48 mt-12 ml-auto"></div>
              <p className="text-sm mt-1">Authorized Signatory</p>
            </div>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-gray-800 text-xs">
            <p>This is a computer generated invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
