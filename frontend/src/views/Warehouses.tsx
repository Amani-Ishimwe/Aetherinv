import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addAuditLog } from '../services/auditLogger';
import { 
  Home, 
  ArrowRightLeft, 
  ClipboardCheck, 
  MapPin, 
  Loader2, 
  Check, 
  X as CloseIcon,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacity: string;
}

interface TransferRequest {
  id: string;
  productId: number;
  productName: string;
  sku: string;
  from: string;
  to: string;
  qty: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export const Warehouses: React.FC = () => {
  const { user } = useAuth();
  
  // Real products list
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form states
  const [fromWarehouse, setFromWarehouse] = useState('WH-01');
  const [toWarehouse, setToWarehouse] = useState('WH-02');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [transferQty, setTransferQty] = useState<number>(0);

  // Warehouses list from backend
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Transfer approvals queue from backend
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products?size=1000');
      const prodList = prodRes.data?.content || [];
      setProducts(prodList);

      const whRes = await api.get('/warehouses');
      setWarehouses(whRes.data || []);

      const transferRes = await api.get('/transfers');
      const mappedTransfers = (transferRes.data || []).map((t: any) => ({
        id: t.id,
        productId: prodList.find((p: any) => p.sku === t.sku)?.id || 0,
        productName: t.productName,
        sku: t.sku,
        from: t.fromWarehouse,
        to: t.toWarehouse,
        qty: t.quantity,
        status: t.status as any,
        date: t.date
      }));
      setTransfers(mappedTransfers);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load logistics database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot initiate transfer requests.');
      return;
    }

    if (fromWarehouse === toWarehouse) {
      setErrorMsg('Origin and Destination warehouses must be different.');
      return;
    }

    if (!selectedProductId || transferQty <= 0) {
      setErrorMsg('Select a product and enter a valid quantity.');
      return;
    }

    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    if (prod.quantity < transferQty) {
      setErrorMsg(`Insufficient stock in origin warehouse. SKU has only ${prod.quantity} units available.`);
      return;
    }

    const newTransfer = {
      id: `TR-${Math.floor(100 + Math.random() * 900)}`,
      sku: prod.sku,
      productName: prod.name,
      fromWarehouse: fromWarehouse,
      toWarehouse: toWarehouse,
      quantity: transferQty,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await api.post('/transfers', newTransfer);
      addAuditLog('UPDATE', prod.sku, `${prod.name}: Requested transfer of ${transferQty} pcs (${fromWarehouse} → ${toWarehouse})`, user?.email || 'System');
      
      setTransferQty(0);
      setSelectedProductId('');
      
      loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit transfer request.');
    }
  };

  const handleApprove = async (transfer: TransferRequest) => {
    setErrorMsg(null);
    const hasAdminRights = ['Super Admin', 'Admin', 'Inventory Manager', 'Warehouse Staff'].includes(user?.role || '');
    if (!hasAdminRights) {
      setErrorMsg('Permission Denied: Only Admins, Inventory Managers, or Warehouse Staff can approve transfers.');
      return;
    }

    setTransferLoading(true);
    try {
      // Find current stock
      const prod = products.find(p => p.id === transfer.productId);
      if (!prod) throw new Error('Product not found in current inventory database.');

      if (prod.quantity < transfer.qty) {
        throw new Error(`Insufficient stock left to approve this transfer. Only ${prod.quantity} units remaining.`);
      }

      // Deduct stock from the central product record
      const updatedProduct = {
        ...prod,
        quantity: prod.quantity - transfer.qty
      };
      await api.put(`/products/${prod.id}`, updatedProduct);

      // Update transfer status
      const updatedTransfer = {
        sku: transfer.sku,
        productName: transfer.productName,
        fromWarehouse: transfer.from,
        toWarehouse: transfer.to,
        quantity: transfer.qty,
        status: 'APPROVED',
        date: transfer.date
      };
      await api.put(`/transfers/${transfer.id}`, updatedTransfer);

      // Audit Log
      addAuditLog('UPDATE', prod.sku, `Approved Stock Transfer ${transfer.id}: Moved ${transfer.qty} pcs (${transfer.from} → ${transfer.to})`, user?.email || 'System');

      loadData(); // reload
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while approving stock transfer.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setErrorMsg(null);
    const hasAdminRights = ['Super Admin', 'Admin', 'Inventory Manager', 'Warehouse Staff'].includes(user?.role || '');
    if (!hasAdminRights) {
      setErrorMsg('Permission Denied: Only Admins, Inventory Managers, or Warehouse Staff can reject transfers.');
      return;
    }

    const transfer = transfers.find(t => t.id === id);
    if (!transfer) return;

    setTransferLoading(true);
    try {
      const updatedTransfer = {
        sku: transfer.sku,
        productName: transfer.productName,
        fromWarehouse: transfer.from,
        toWarehouse: transfer.to,
        quantity: transfer.qty,
        status: 'REJECTED',
        date: transfer.date
      };
      await api.put(`/transfers/${id}`, updatedTransfer);
      addAuditLog('UPDATE', 'N/A', `Rejected Stock Transfer request ${id}`, user?.email || 'System');
      loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to reject transfer.');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Warehouse Locations & Logistics</h2>
        <p className="text-slate-400 text-sm mt-1">Manage multiple branches, initialize stock transfers, and approve logistics requests.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Warehouses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map(w => (
          <div key={w.id} className="glass-card rounded-2xl p-6 border border-white/5 relative group hover:border-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <Home className="h-5.5 w-5.5" />
              </div>
              <span className="px-2 py-0.5 bg-darkblue-800 border border-darkblue-750 text-slate-300 font-mono text-xs rounded-md">
                {w.code}
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-white mb-1 group-hover:text-brandorange-400 transition-colors">{w.name}</h3>
            <p className="text-xs text-slate-450 flex items-center space-x-1 mb-4">
              <MapPin className="h-3.5 w-3.5 text-slate-550 shrink-0" />
              <span className="truncate">{w.location}</span>
            </p>
            <div className="border-t border-darkblue-800/80 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-550">Manager: <strong className="text-slate-350">{w.manager}</strong></span>
              <span className="font-bold text-brandorange-400">Cap: {w.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Stock Transfer Draft form */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Draft Stock Transfer</h3>
              <p className="text-xs text-slate-400 mt-0.5">Move inventory between regional branches</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-brandorange-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading catalog...</span>
            </div>
          ) : (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">From Warehouse (Origin)</label>
                <select
                  value={fromWarehouse}
                  onChange={(e) => setFromWarehouse(e.target.value)}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-300 outline-none text-xs"
                >
                  {warehouses.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">To Warehouse (Destination)</label>
                <select
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-300 outline-none text-xs"
                >
                  {warehouses.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-300 outline-none text-xs"
                  required
                >
                  <option value="">-- Choose Product SKU --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={transferQty === 0 ? '' : transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-200 outline-none text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 mt-4"
              >
                Request Dispatch Transfer
              </button>
            </form>
          )}
        </div>

        {/* Right Columns: Transfer Approvals Queue */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
          <div className="mb-6 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5 text-brandorange-500" />
              <span>Logistics Approvals Queue</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Stock transfer approvals pending or executed</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {transfers.map(tr => (
              <div 
                key={tr.id} 
                className="bg-darkblue-950/20 border border-darkblue-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xxs font-extrabold px-1.5 py-0.5 bg-darkblue-800 text-brandorange-400 rounded">
                      {tr.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      tr.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse' :
                      tr.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {tr.status}
                    </span>
                    <span className="text-xxs text-slate-500">{tr.date}</span>
                  </div>

                  <h4 className="font-extrabold text-white text-sm mt-1">{tr.productName} <span className="text-slate-400 font-normal">({tr.sku})</span></h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2 font-medium">
                    <span>From: <strong className="text-slate-300 font-semibold">{tr.from}</strong></span>
                    <span className="text-brandorange-500">→</span>
                    <span>To: <strong className="text-slate-300 font-semibold">{tr.to}</strong></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    <span>Qty: <strong className="text-slate-300 font-semibold">{tr.qty} pcs</strong></span>
                  </p>
                </div>

                {tr.status === 'PENDING' && (
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleReject(tr.id)}
                      disabled={transferLoading}
                      className="p-2 border border-darkblue-850 hover:border-red-500 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Reject Transfer Request"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleApprove(tr)}
                      disabled={transferLoading}
                      className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center space-x-1"
                      title="Approve & Dispatch Stock"
                    >
                      {transferLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
