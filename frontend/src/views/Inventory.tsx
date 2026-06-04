import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addAuditLog } from '../services/auditLogger';
import { 
  Archive, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
}

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  
  // Products from backend
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [actionType, setActionType] = useState<'stock-in' | 'stock-out' | 'adjust' | 'damage-return'>('stock-in');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [changeQty, setChangeQty] = useState<number>(0);
  const [reason, setReason] = useState('Purchase replenishment');
  
  // Damage/Return Sub-type
  const [damageOrReturn, setDamageOrReturn] = useState<'DAMAGE' | 'RETURN'>('DAMAGE');

  // Logs
  const [damagedLogs, setDamagedLogs] = useState([
    { id: 1, sku: 'ELC-LPT-01', name: 'EliteBook Laptop', qty: 2, type: 'DAMAGE', reason: 'Cracked screen during transit', date: '2026-06-03' },
    { id: 2, sku: 'MED-KIT-05', name: 'First Aid Kit', qty: 5, type: 'RETURN', reason: 'Customer returned: wrong variant', date: '2026-06-02' },
  ]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/products?size=1000');
      setProducts(res.data?.content || []);
    } catch (e) {
      console.error('Error fetching products for adjustment:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setMessage({ type: 'error', text: 'Permission Denied: Viewers cannot execute stock actions.' });
      return;
    }

    if (!selectedProductId || changeQty <= 0) {
      setMessage({ type: 'error', text: 'Please select a product and enter a valid quantity.' });
      return;
    }

    const targetProduct = products.find(p => p.id === Number(selectedProductId));
    if (!targetProduct) return;

    let newQty = targetProduct.quantity;
    let actionLogType: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE';

    if (actionType === 'stock-in') {
      newQty += changeQty;
    } else if (actionType === 'stock-out') {
      if (targetProduct.quantity < changeQty) {
        setMessage({ type: 'error', text: `Insufficient stock! SKU has only ${targetProduct.quantity} units.` });
        return;
      }
      newQty -= changeQty;
    } else if (actionType === 'adjust') {
      newQty = changeQty; // Direct set
    } else if (actionType === 'damage-return') {
      if (damageOrReturn === 'DAMAGE') {
        if (targetProduct.quantity < changeQty) {
          setMessage({ type: 'error', text: 'Cannot flag more damaged units than available in current stock.' });
          return;
        }
        newQty -= changeQty;
      } else {
        newQty += changeQty; // returned items back to shelf
      }
    }

    setSubmitLoading(true);
    try {
      // Execute Real Put to backend
      const updatedProduct = {
        ...targetProduct,
        quantity: newQty
      };
      
      await api.put(`/products/${targetProduct.id}`, updatedProduct);

      // Audit Log
      const auditMsg = `${actionType.toUpperCase()}: ${reason} (Qty: ${changeQty})`;
      addAuditLog(actionLogType, targetProduct.sku, `${targetProduct.name} - ${auditMsg}`, user?.email || 'System');

      // Update Damage/Return logs locally if applicable
      if (actionType === 'damage-return') {
        const newLog = {
          id: Math.random(),
          sku: targetProduct.sku,
          name: targetProduct.name,
          qty: changeQty,
          type: damageOrReturn,
          reason: reason,
          date: new Date().toISOString().split('T')[0]
        };
        setDamagedLogs([newLog, ...damagedLogs]);
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully executed stock transaction! Quantity of ${targetProduct.name} is now ${newQty}.`
      });

      // Clear input
      setChangeQty(0);
      setReason('');
      
      // Reload products list
      loadProducts();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Backend submission failed. Check database logs.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Stock Actions Manager</h2>
        <p className="text-slate-400 text-sm mt-1">Receive, dispatch, adjust, or flag damaged items directly inside the database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Transaction Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Action selector */}
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => { setActionType('stock-in'); setReason('Purchase replenishment'); setMessage(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all border ${
                  actionType === 'stock-in'
                    ? 'bg-green-500/10 text-green-400 border-green-500/25'
                    : 'bg-darkblue-900 border-darkblue-800 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Stock-In</span>
              </button>

              <button
                onClick={() => { setActionType('stock-out'); setReason('Dispatch sales order'); setMessage(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all border ${
                  actionType === 'stock-out'
                    ? 'bg-red-500/10 text-red-400 border-red-500/25'
                    : 'bg-darkblue-900 border-darkblue-800 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Stock-Out</span>
              </button>

              <button
                onClick={() => { setActionType('adjust'); setReason('Physical stock audit adjustment'); setMessage(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all border ${
                  actionType === 'adjust'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                    : 'bg-darkblue-900 border-darkblue-800 text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Adjust Count</span>
              </button>

              <button
                onClick={() => { setActionType('damage-return'); setReason('Flag damaged units'); setMessage(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all border ${
                  actionType === 'damage-return'
                    ? 'bg-brandorange-500/10 text-brandorange-400 border-brandorange-500/25'
                    : 'bg-darkblue-900 border-darkblue-800 text-slate-400 hover:text-white'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Damaged / Returns</span>
              </button>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl border text-sm flex items-start space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/35 text-green-400' 
                  : 'bg-red-500/10 border-red-500/35 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Main Form */}
            {loadingProducts ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-brandorange-500 animate-spin mb-3" />
                <span className="text-xs text-slate-400">Loading catalog...</span>
              </div>
            ) : (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Product */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Inventory Item</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2.5 px-3.5 text-slate-300 outline-none text-xs cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Product SKU --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity to Alter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {actionType === 'adjust' ? 'Set Total Stock Count' : 'Quantity Units'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={changeQty === 0 ? '' : changeQty}
                      onChange={(e) => setChangeQty(Number(e.target.value))}
                      placeholder="e.g. 50"
                      className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none text-xs"
                      required
                    />
                  </div>
                </div>

                {actionType === 'damage-return' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Disposition Type</label>
                    <div className="flex items-center space-x-6 bg-darkblue-950/40 p-3 rounded-xl border border-darkblue-850">
                      <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="disposition"
                          checked={damageOrReturn === 'DAMAGE'}
                          onChange={() => { setDamageOrReturn('DAMAGE'); setReason('Flag damaged units'); }}
                          className="accent-brandorange-500"
                        />
                        <span>Flag as Damaged (Reduces Available Stock)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="disposition"
                          checked={damageOrReturn === 'RETURN'}
                          onChange={() => { setDamageOrReturn('RETURN'); setReason('Customer return restocking'); }}
                          className="accent-brandorange-500"
                        />
                        <span>Restock Returned Item (Increases Stock)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Reason Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transaction Notes / Reference</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Supplier invoice ref #401"
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none text-xs"
                    required
                  />
                </div>

                <div className="border-t border-darkblue-800/40 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <span>Commit Transaction</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Right Column: Damaged & Returned Stock Logs */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
          <div className="mb-5 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Archive className="h-5 w-5 text-brandorange-500" />
              <span>Damaged & Returned Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Recent flagged damages and customer return events</p>
          </div>

          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 text-xs">
            {damagedLogs.map(log => (
              <div 
                key={log.id} 
                className={`bg-darkblue-950/20 border rounded-xl p-3.5 ${
                  log.type === 'DAMAGE' ? 'border-red-500/10' : 'border-green-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200">{log.name}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${
                    log.type === 'DAMAGE' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {log.type === 'DAMAGE' ? `Damaged: ${log.qty}` : `Returned: ${log.qty}`}
                  </span>
                </div>
                <p className="text-slate-400 leading-normal mb-1">{log.reason}</p>
                <div className="flex justify-between items-center text-xxs text-slate-550 mt-2">
                  <span>SKU: {log.sku}</span>
                  <span>Date: {log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
