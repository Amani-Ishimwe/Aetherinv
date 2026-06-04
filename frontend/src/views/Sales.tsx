import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addAuditLog } from '../services/auditLogger';
import { 
  BarChart3, 
  FileText, 
  Receipt, 
  Printer, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface SalesOrder {
  id: string;
  customerName: string;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percent e.g. 10 for 10%
  taxRate: number; // e.g. 18 for 18% VAT
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

export const Sales: React.FC = () => {
  const { user } = useAuth();
  
  // Real products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('Alice Uwase');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [salesQty, setSalesQty] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxRate] = useState<number>(18); // 18% VAT standard

  // Sales Orders List from backend
  const [salesList, setSalesList] = useState<SalesOrder[]>([]);

  // Invoice modal
  const [inspectInvoice, setInspectInvoice] = useState<SalesOrder | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products?size=1000');
      setProducts(prodRes.data?.content || []);
      const salesRes = await api.get('/sales-orders');
      setSalesList(salesRes.data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot create sales orders.');
      return;
    }

    if (!selectedProductId || salesQty <= 0) {
      setErrorMsg('Select a product and enter a valid quantity.');
      return;
    }

    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    if (prod.quantity < salesQty) {
      setErrorMsg(`Insufficient stock! ${prod.name} has only ${prod.quantity} units available.`);
      return;
    }

    setSalesLoading(true);
    try {
      // Calculate subtotals
      const rawSubtotal = salesQty * prod.price;
      const discountVal = rawSubtotal * (discountPercent / 100);
      const subtotal = rawSubtotal - discountVal;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      // Update backend database (PUT) to deduct stock
      const updatedProduct = {
        ...prod,
        quantity: prod.quantity - salesQty
      };

      await api.put(`/products/${prod.id}`, updatedProduct);

      const invoiceId = `INV-${103 + salesList.length}`;

      const newOrder: SalesOrder = {
        id: invoiceId,
        customerName,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: salesQty,
        unitPrice: prod.price,
        discount: discountPercent,
        taxRate,
        subtotal,
        tax,
        total,
        date: new Date().toISOString().split('T')[0]
      };

      await api.post('/sales-orders', newOrder);

      // Audit Log
      addAuditLog('UPDATE', prod.sku, `Created Invoice ${invoiceId}: Sold ${salesQty} pcs to ${customerName}`, user?.email || 'System');

      setSalesQty(0);
      setDiscountPercent(0);
      setSelectedProductId('');
      loadData(); // reload
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving sales order.');
    } finally {
      setSalesLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Sales Orders & Invoicing</h2>
        <p className="text-slate-400 text-sm mt-1">Issue customer invoices, calculate taxes and discounts, and deduct items from database stock on order placement.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Sales Order */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 h-fit">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-brandorange-55/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">New Sales Order</h3>
              <p className="text-xs text-slate-400 mt-0.5">Deduct stock and draft customer invoice</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-brandorange-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading catalog...</span>
            </div>
          ) : (
            <form onSubmit={handleCreateSalesOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alice Uwase"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Select Product SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-350 outline-none"
                  required
                >
                  <option value="">-- Choose Product SKU --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={salesQty === 0 ? '' : salesQty}
                    onChange={(e) => setSalesQty(Number(e.target.value))}
                    placeholder="e.g. 5"
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Discount Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Displaying tax rate info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 bg-darkblue-950/40 p-2 rounded-lg border border-darkblue-850">
                <span>Standard VAT applied:</span>
                <span className="font-bold text-brandorange-400">18% VAT</span>
              </div>

              <button
                type="submit"
                disabled={salesLoading}
                className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 active:scale-95 mt-4"
              >
                {salesLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <span>Place Sales Order</span>}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Sales Orders list */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
          <div className="mb-6 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-brandorange-500" />
              <span>Invoiced Orders Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Completed transactions with invoice download options</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {salesList.map(sales => (
              <div 
                key={sales.id} 
                className="bg-darkblue-950/20 border border-darkblue-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xxs font-extrabold px-1.5 py-0.5 bg-darkblue-800 text-brandorange-400 rounded">
                      {sales.id}
                    </span>
                    <span className="text-xxs text-slate-500">{sales.date}</span>
                  </div>

                  <h4 className="font-extrabold text-white text-sm mt-1">{sales.productName} <span className="text-slate-400 font-normal">({sales.sku})</span></h4>
                  <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                    Client: <strong className="text-slate-300 font-semibold">{sales.customerName}</strong>
                    <span className="mx-2 text-slate-700">|</span>
                    Qty: <strong className="text-slate-300 font-semibold">{sales.quantity} units</strong>
                    {sales.discount > 0 && (
                      <>
                        <span className="mx-2 text-slate-700">|</span>
                        <span>Discount: <strong className="text-green-450 font-semibold">-{sales.discount}%</strong></span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-black text-brandorange-450 block">
                      ${sales.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Invoiced</span>
                  </div>

                  <button
                    onClick={() => setInspectInvoice(sales)}
                    className="p-2 border border-darkblue-850 hover:border-brandorange-500/40 hover:text-white text-slate-400 bg-darkblue-900 rounded-lg transition-all"
                    title="Generate PDF-style Invoice"
                  >
                    <FileText className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Invoice Inspector Drawer modal */}
      {inspectInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-darkblue-950/80 backdrop-blur-sm" onClick={() => setInspectInvoice(null)} />
          
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 p-8 flex flex-col font-sans max-h-[90vh] overflow-y-auto">
            {/* Logo and company info */}
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <h3 className="text-xl font-black tracking-wider text-slate-900">AETHER<span className="text-brandorange-600">INV</span></h3>
                <p className="text-xxs text-slate-500">KG 11 Ave, Kigali, Rwanda</p>
                <p className="text-xxs text-slate-550">system@aetherinv.com</p>
              </div>
              <div className="text-right">
                <h4 className="text-lg font-bold text-slate-900">TAX INVOICE</h4>
                <p className="text-xs font-semibold text-slate-500">ID: {inspectInvoice.id}</p>
                <p className="text-xxs text-slate-400">Date: {inspectInvoice.date}</p>
              </div>
            </div>

            {/* Customer info */}
            <div className="mb-6 text-xs bg-slate-50 p-4 rounded-xl">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1">Invoiced To:</p>
              <p className="font-extrabold text-slate-950 text-sm">{inspectInvoice.customerName}</p>
              <p className="text-slate-500 mt-1">Status: Paid in Full</p>
            </div>

            {/* Items Table */}
            <div className="flex-1 min-h-[100px] mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 pb-2 text-slate-500 uppercase tracking-widest text-[9px]">
                    <th className="pb-2">SKU / Item</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  <tr>
                    <td className="py-3">
                      <p className="font-semibold text-slate-950">{inspectInvoice.productName}</p>
                      <p className="text-[10px] text-slate-500">{inspectInvoice.sku}</p>
                    </td>
                    <td className="py-3 text-right font-mono">${inspectInvoice.unitPrice.toFixed(2)}</td>
                    <td className="py-3 text-center">{inspectInvoice.quantity}</td>
                    <td className="py-3 text-right font-bold text-slate-950 font-mono">
                      ${(inspectInvoice.quantity * inspectInvoice.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations breakdown */}
            <div className="border-t pt-4 text-xs space-y-2 max-w-xs ml-auto w-full font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="text-slate-950 font-semibold">${(inspectInvoice.quantity * inspectInvoice.unitPrice).toFixed(2)}</span>
              </div>
              {inspectInvoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (-{inspectInvoice.discount}%):</span>
                  <span>-${((inspectInvoice.quantity * inspectInvoice.unitPrice) * (inspectInvoice.discount / 100)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Taxable Value:</span>
                <span className="text-slate-950 font-semibold">${inspectInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VAT (18%):</span>
                <span className="text-slate-950 font-semibold">${inspectInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 pt-2 text-sm">
                <span className="font-extrabold text-slate-900">Total Paid:</span>
                <span className="font-black text-brandorange-600">${inspectInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Printer Button */}
            <div className="border-t pt-6 mt-6 flex justify-between items-center shrink-0">
              <button
                onClick={() => setInspectInvoice(null)}
                className="px-4 py-2 border border-slate-300 hover:border-slate-550 rounded-xl text-xs font-bold uppercase text-slate-650 transition-colors"
              >
                Close Invoice
              </button>
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
