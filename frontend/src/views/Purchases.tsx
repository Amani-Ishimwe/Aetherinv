import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addAuditLog } from '../services/auditLogger';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Upload, 
  FileCheck, 
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

interface PurchaseOrder {
  id: string;
  supplierName: string;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  status: 'DRAFT' | 'APPROVED' | 'DELIVERED';
  invoiceUploaded: boolean;
  date: string;
}

export const Purchases: React.FC = () => {
  const { user } = useAuth();
  
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [procureLoading, setProcureLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  
  const [supplierName, setSupplierName] = useState('TechLogix Distribution');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [purchaseQty, setPurchaseQty] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);

  
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products?size=1000');
      setProducts(prodRes.data?.content || []);
      const poRes = await api.get('/purchase-orders');
      setOrders(poRes.data || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to retrieve data from backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setMessage({ type: 'error', text: 'Permission Denied: Viewers cannot create purchase orders.' });
      return;
    }

    if (!selectedProductId || purchaseQty <= 0 || unitCost <= 0) {
      setMessage({ type: 'error', text: 'Select a product and enter correct quantity/unit cost specs.' });
      return;
    }

    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    const newPO: PurchaseOrder = {
      id: `PO-${Math.floor(903 + Math.random() * 900)}`,
      supplierName,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: purchaseQty,
      unitCost,
      status: 'DRAFT',
      invoiceUploaded: false,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await api.post('/purchase-orders', newPO);
      addAuditLog('CREATE', prod.sku, `Drafted Purchase Order ${newPO.id} for ${purchaseQty} pcs from ${supplierName}`, user?.email || 'System');
      
      setPurchaseQty(0);
      setUnitCost(0);
      setSelectedProductId('');
      setMessage({ type: 'success', text: `Purchase Order ${newPO.id} created as DRAFT.` });
      
      const poRes = await api.get('/purchase-orders');
      setOrders(poRes.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save purchase order to backend.' });
    }
  };

  const handleApprovePO = async (id: string) => {
    setMessage(null);
    const hasAdminRights = ['Super Admin', 'Admin', 'Inventory Manager'].includes(user?.role || '');
    if (!hasAdminRights) {
      setMessage({ type: 'error', text: 'Permission Denied: Only Admins or Inventory Managers can approve purchase orders.' });
      return;
    }

    const order = orders.find(o => o.id === id);
    if (!order) return;

    try {
      const updatedPO = { ...order, status: 'APPROVED' };
      await api.put(`/purchase-orders/${id}`, updatedPO);
      addAuditLog('UPDATE', 'N/A', `Approved Purchase Order ${id}`, user?.email || 'System');
      
      const poRes = await api.get('/purchase-orders');
      setOrders(poRes.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to approve purchase order.' });
    }
  };

  const handleReceiveGoods = async (order: PurchaseOrder) => {
    setMessage(null);
    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setMessage({ type: 'error', text: 'Permission Denied: Viewers cannot trigger goods receipt.' });
      return;
    }

    setProcureLoading(true);
    try {
      
      const prod = products.find(p => p.id === order.productId);
      if (!prod) throw new Error('Product not found in current inventory catalog.');

      
      const updatedProduct = {
        ...prod,
        quantity: prod.quantity + order.quantity
      };

      await api.put(`/products/${prod.id}`, updatedProduct);

      
      const updatedPO = { ...order, status: 'DELIVERED' };
      await api.put(`/purchase-orders/${order.id}`, updatedPO);

      
      addAuditLog('UPDATE', prod.sku, `Received Goods for PO ${order.id}: Restocked +${order.quantity} units to database`, user?.email || 'System');

      setMessage({ type: 'success', text: `Received stock for PO ${order.id}. Central database updated successfully!` });
      loadData(); 
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update database stock during receipt.' });
    } finally {
      setProcureLoading(false);
    }
  };

  const handleUploadInvoice = async (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    try {
      const updatedPO = { ...order, invoiceUploaded: true };
      await api.put(`/purchase-orders/${id}`, updatedPO);
      alert(`Invoice uploaded successfully for order ${id}!`);
      
      const poRes = await api.get('/purchase-orders');
      setOrders(poRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to upload invoice.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Purchase Orders & Receipts</h2>
        <p className="text-slate-400 text-sm mt-1">Draft procurement orders, track supplier deliveries, and ingest stock straight to the database upon arrival.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm flex items-start space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/35 text-green-400' 
            : 'bg-red-500/10 border-red-500/35 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Procurement Pipeline Workflow</h3>
        <div className="grid grid-cols-4 gap-4 text-center text-xs relative">
          <div className="flex flex-col items-center">
            <span className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-2">1</span>
            <span className="font-semibold text-white">Create PO</span>
            <span className="text-[10px] text-slate-500 mt-1">Draft specs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold mb-2">2</span>
            <span className="font-semibold text-white">Manager Approval</span>
            <span className="text-[10px] text-slate-500 mt-1">Check budgets</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="h-8 w-8 rounded-full bg-brandorange-500/20 text-brandorange-400 flex items-center justify-center font-bold mb-2">3</span>
            <span className="font-semibold text-white">Supplier Delivery</span>
            <span className="text-[10px] text-slate-500 mt-1">Await transit</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="h-8 w-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold mb-2">4</span>
            <span className="font-semibold text-white">Stock Ingested</span>
            <span className="text-[10px] text-slate-500 mt-1">Auto-increment DB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 h-fit">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Draft New PO</h3>
              <p className="text-xs text-slate-400 mt-0.5">Procure inventory from verified suppliers</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-brandorange-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading catalog...</span>
            </div>
          ) : (
            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Supplier Partner</label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-355 outline-none"
                >
                  <option value="TechLogix Distribution">TechLogix Distribution</option>
                  <option value="Afritech Industrial Suppliers">Afritech Industrial Suppliers</option>
                  <option value="Global Med & Health Ltd">Global Med & Health Ltd</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Select Product SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-355 outline-none"
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
                    value={purchaseQty === 0 ? '' : purchaseQty}
                    onChange={(e) => setPurchaseQty(Number(e.target.value))}
                    placeholder="e.g. 100"
                    className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Supplier Cost ($/unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={unitCost === 0 ? '' : unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    placeholder="e.g. 15.00"
                    className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-200 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 active:scale-95 mt-4"
              >
                Generate Purchase Order
              </button>
            </form>
          )}
        </div>

        
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
          <div className="mb-6 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-brandorange-500" />
              <span>Purchase Orders Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Procurement orders, approvals, invoice uploads and arrivals</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {orders.map(order => {
              const totalCost = order.quantity * order.unitCost;

              return (
                <div 
                  key={order.id} 
                  className="bg-darkblue-950/20 border border-darkblue-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xxs font-extrabold px-1.5 py-0.5 bg-darkblue-800 text-slate-350 rounded border border-darkblue-750">
                        {order.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        order.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                        order.status === 'APPROVED' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-xxs text-slate-500">{order.date}</span>
                    </div>

                    <h4 className="font-extrabold text-white text-sm mt-1">{order.productName} <span className="text-slate-400 font-normal">({order.sku})</span></h4>
                    <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                      Vendor: <strong className="text-slate-300 font-semibold">{order.supplierName}</strong>
                      <span className="mx-2 text-slate-700">|</span>
                      Qty: <strong className="text-slate-300 font-semibold">{order.quantity} units</strong>
                      <span className="mx-2 text-slate-700">|</span>
                      Total: <strong className="text-brandorange-400 font-bold">${totalCost.toLocaleString()}</strong>
                    </p>
                  </div>

                  
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                    {order.status === 'DRAFT' && (
                      <button
                        onClick={() => handleApprovePO(order.id)}
                        className="px-3.5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xxs font-bold uppercase rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Approve PO</span>
                      </button>
                    )}

                    {order.status === 'APPROVED' && (
                      <button
                        onClick={() => handleReceiveGoods(order)}
                        disabled={procureLoading}
                        className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white text-xxs font-bold uppercase rounded-lg transition-colors flex items-center space-x-1"
                      >
                        {procureLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Truck className="h-3.5 w-3.5" />
                            <span>Receive Goods</span>
                          </>
                        )}
                      </button>
                    )}

                    {order.status === 'DELIVERED' && !order.invoiceUploaded && (
                      <button
                        onClick={() => handleUploadInvoice(order.id)}
                        className="px-3.5 py-2 border border-darkblue-800 hover:border-slate-650 text-slate-300 hover:text-white text-xxs font-bold uppercase rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Invoice</span>
                      </button>
                    )}

                    {order.status === 'DELIVERED' && order.invoiceUploaded && (
                      <span className="px-3 py-2 text-slate-500 text-xxs font-bold uppercase tracking-wider flex items-center space-x-1">
                        <FileCheck className="h-4 w-4 text-green-500" />
                        <span>Invoice Saved</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
