import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addAuditLog } from '../services/auditLogger';
import { 
  ClipboardCheck, 
  FileWarning, 
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

interface AuditSession {
  id: string;
  title: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  date: string;
  auditor: string;
}

interface DiscrepancyItem {
  id: string;
  productId: number;
  productName: string;
  sku: string;
  systemQty: number;
  physicalQty: number;
  discrepancy: number; // physicalQty - systemQty
  notes: string;
  resolved: boolean;
}

export const Auditing: React.FC = () => {
  const { user } = useAuth();
  
  // Real products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sessions state from backend
  const [sessions, setSessions] = useState<AuditSession[]>([]);

  // Discrepancy reports worksheet from backend
  const [worksheet, setWorksheet] = useState<DiscrepancyItem[]>([]);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [physicalCount, setPhysicalCount] = useState<number | ''>('');
  const [auditNotes, setAuditNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products?size=1000');
      setProducts(prodRes.data?.content || []);
      const sessionRes = await api.get('/audit-sessions');
      setSessions(sessionRes.data || []);
      const discrepancyRes = await api.get('/discrepancies');
      setWorksheet(discrepancyRes.data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load auditing data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartAuditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot initialize audit sessions.');
      return;
    }

    const newSession: AuditSession = {
      id: `AUD-0${sessions.length + 1}`,
      title: `Stock Count Session #${sessions.length + 1}`,
      status: 'IN_PROGRESS',
      date: new Date().toISOString().split('T')[0],
      auditor: user?.firstname || 'System Auditor'
    };

    try {
      await api.post('/audit-sessions', newSession);
      addAuditLog('CREATE', 'N/A', `Started Audit Session ${newSession.title}`, user?.email || 'System');
      
      const sessionRes = await api.get('/audit-sessions');
      setSessions(sessionRes.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create count cycle.');
    }
  };

  const handleWorksheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot record discrepancy counts.');
      return;
    }

    if (!selectedProductId || physicalCount === '') {
      setErrorMsg('Please select a product and enter the physically counted quantity.');
      return;
    }

    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    const systemQty = prod.quantity;
    const physicalQty = Number(physicalCount);
    const discrepancy = physicalQty - systemQty;

    const newItem: DiscrepancyItem = {
      id: `DIS-${Math.floor(10 + Math.random() * 90)}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      systemQty,
      physicalQty,
      discrepancy,
      notes: auditNotes || 'Physical inventory check',
      resolved: discrepancy === 0
    };

    try {
      await api.post('/discrepancies', newItem);
      addAuditLog('UPDATE', prod.sku, `Audited SKU: Counted ${physicalQty} units (Discrepancy: ${discrepancy})`, user?.email || 'System');
      
      setSelectedProductId('');
      setPhysicalCount('');
      setAuditNotes('');
      
      const discrepancyRes = await api.get('/discrepancies');
      setWorksheet(discrepancyRes.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to record counting sheet.');
    }
  };

  const handleResolveDiscrepancy = async (item: DiscrepancyItem) => {
    setErrorMsg(null);
    const hasAdminRights = ['Super Admin', 'Admin', 'Inventory Manager'].includes(user?.role || '');
    if (!hasAdminRights) {
      setErrorMsg('Permission Denied: Only Admins or Inventory Managers can resolve stock discrepancies.');
      return;
    }

    setAuditLoading(true);
    try {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) throw new Error('Product SKU no longer exists in current catalog.');

      // Update database product stock (PUT) to match counted physical stock
      const updatedProduct = {
        ...prod,
        quantity: item.physicalQty
      };

      await api.put(`/products/${prod.id}`, updatedProduct);

      // Update discrepancy resolved flag (PUT)
      const updatedItem = {
        ...item,
        resolved: true
      };
      await api.put(`/discrepancies/${item.id}`, updatedItem);

      // Audit Log
      addAuditLog('UPDATE', prod.sku, `Resolved Audit Discrepancy ${item.id}: Adjusted system stock from ${item.systemQty} to ${item.physicalQty}`, user?.email || 'System');

      loadData(); // reload
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to adjust system stock.');
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Inventory Auditing & Reconciliation</h2>
        <p className="text-slate-400 text-sm mt-1">Audit physical warehouse quantities, evaluate discrepancies, and reconcile databases with counting sheets.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Audit Sessions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <ClipboardCheck className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Stock Audit Sessions</h3>
          </div>
          <p className="text-xxs text-slate-450 leading-relaxed mb-4">
            Initialize a physical count session to compare warehouse assets against system values.
          </p>
          <button
            onClick={handleStartAuditSession}
            className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2 rounded-xl text-xxs uppercase tracking-wider transition-all"
          >
            Start Count Cycle
          </button>
        </div>

        {sessions.slice(0, 2).map(s => (
          <div key={s.id} className="glass-card rounded-2xl p-6 border border-white/5 relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xxs font-extrabold px-1.5 py-0.5 bg-darkblue-800 text-brandorange-400 rounded">
                {s.id}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                s.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse' : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {s.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
              </span>
            </div>
            <h4 className="font-extrabold text-white text-base truncate mb-3">{s.title}</h4>
            <div className="border-t border-darkblue-800/80 pt-3 flex justify-between items-center text-xxs text-slate-500">
              <span>Auditor: <strong>{s.auditor}</strong></span>
              <span>{s.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Discrepancy Drafter */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 h-fit">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <FileWarning className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Physical Count</h3>
              <p className="text-xs text-slate-400 mt-0.5">Input physical counts to detect discrepancies</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-brandorange-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading catalog...</span>
            </div>
          ) : (
            <form onSubmit={handleWorksheetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Select Target SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-darkblue-950 border border-darkblue-800 rounded-xl py-2 px-3 text-slate-350 outline-none"
                  required
                >
                  <option value="">-- Choose Product SKU --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (System: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Physical Quantity Counted</label>
                <input
                  type="number"
                  min="0"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(e.target.value !== '' ? Number(e.target.value) : '')}
                  placeholder="Counted units"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Observation Notes</label>
                <input
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="e.g. Damaged box or missing item"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all"
              >
                Log Counting Sheet
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Count Discrepancy Worksheet */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
          <div className="mb-6 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileWarning className="h-5 w-5 text-brandorange-500" />
              <span>Stock Discrepancy Sheet</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Physical counts sheet comparing counted vs system quantities</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {worksheet.map(item => {
              return (
                <div 
                  key={item.id} 
                  className={`bg-darkblue-950/20 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.resolved ? 'border-darkblue-850' : 'border-red-500/10 bg-red-500/2'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xxs font-extrabold px-1.5 py-0.5 bg-darkblue-800 text-slate-350 rounded border border-darkblue-750">
                        {item.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.resolved ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                      }`}>
                        {item.resolved ? 'Resolved' : 'Reconciliation Pending'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-white text-sm mt-1">{item.productName} <span className="text-slate-400 font-normal">({item.sku})</span></h4>
                    <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                      System: <strong className="text-slate-300 font-semibold">{item.systemQty} units</strong>
                      <span className="mx-2 text-slate-700">|</span>
                      Counted: <strong className="text-slate-300 font-semibold">{item.physicalQty} units</strong>
                      <span className="mx-2 text-slate-700">|</span>
                      Discrepancy: <span className={`font-black ${item.discrepancy < 0 ? 'text-red-400' : item.discrepancy > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                        {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                      </span>
                    </p>
                    {item.notes && <p className="text-xxs text-slate-500 italic mt-1">"{item.notes}"</p>}
                  </div>

                  {!item.resolved && (
                    <div className="flex items-center shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleResolveDiscrepancy(item)}
                        disabled={auditLoading}
                        className="px-3.5 py-2 bg-brandorange-500 hover:bg-brandorange-450 text-white text-xxs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center space-x-1"
                        title="Deduct/Add system counts to match audit"
                      >
                        {auditLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>Reconcile System Qty</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
