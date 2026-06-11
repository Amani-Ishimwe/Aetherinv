import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cpu, UserCheck, ShieldAlert, History, Plus } from 'lucide-react';

interface CorporateAsset {
  id: string;
  tag: string;
  name: string;
  assignedTo: string;
  department: string;
  purchasePrice: number;
  purchaseDate: string;
  depreciationRate: number; 
  maintenanceStatus: 'GOOD' | 'NEEDS_SERVICE' | 'UNDER_MAINTENANCE';
  maintenanceHistory: { date: string; note: string }[];
}

export const Assets: React.FC = () => {
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  
  const [assets, setAssets] = useState<CorporateAsset[]>([]);

  
  const [tagName, setTagName] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [department, setDepartment] = useState('IT Support');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [depreciationRate, setDepreciationRate] = useState<number>(20);

  
  const [inspectAsset, setInspectAsset] = useState<CorporateAsset | null>(null);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      const mapped = (res.data || []).map((a: any) => ({
        id: a.id,
        tag: a.id,
        name: a.name,
        assignedTo: a.assignedTo,
        department: a.department,
        purchasePrice: Number(a.purchaseValue),
        purchaseDate: a.purchaseDate,
        depreciationRate: Number(a.depreciationRate) / 100,
        maintenanceStatus: (a.status || 'GOOD') as any,
        maintenanceHistory: a.id === 'AST-101' ? [
          { date: '2025-11-10', note: 'OS re-installation & SSD upgrade' },
          { date: '2026-02-14', note: 'Battery health assessment passed' }
        ] : a.id === 'AST-102' ? [
          { date: '2026-03-01', note: 'RAM diagnostic check complete' }
        ] : []
      }));
      setAssets(mapped);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load assets from backend.');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  
  const calculateBookValue = (asset: CorporateAsset) => {
    const elapsedMs = new Date().getTime() - new Date(asset.purchaseDate).getTime();
    const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);
    const depreciatedValue = asset.purchasePrice * (asset.depreciationRate * elapsedYears);
    const currentValue = asset.purchasePrice - depreciatedValue;
    return Math.max(0, currentValue);
  };

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot register new assets.');
      return;
    }

    if (!tagName || !assetName || purchasePrice <= 0 || !purchaseDate) {
      setErrorMsg('Please complete all asset specifications.');
      return;
    }

    const newAssetId = tagName.toUpperCase();
    const newAsset = {
      id: newAssetId,
      name: assetName,
      category: 'Hardware',
      department: department,
      assignedTo: assignedTo || 'Unassigned (In Storage)',
      purchaseValue: Number(purchasePrice),
      currentValue: Number(purchasePrice),
      depreciationRate: Number(depreciationRate),
      purchaseDate: purchaseDate,
      status: 'GOOD'
    };

    try {
      await api.post('/assets', newAsset);
      fetchAssets();
      setSuccessMsg(`Registered hardware asset "${newAsset.name}" successfully!`);
      
      
      setTagName('');
      setAssetName('');
      setAssignedTo('');
      setPurchasePrice(0);
      setPurchaseDate('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save asset to database.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Asset & Equipment Register</h2>
        <p className="text-slate-400 text-sm mt-1">Assign hardware to employees, track office depreciation models, and log equipment maintenance.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-4 text-green-400 text-xs">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
          <div className="mb-6 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-brandorange-500" />
              <span>Office Hardware Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Asset listings with straight-line depreciation tracking</p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-darkblue-850 bg-darkblue-900/15 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tag</th>
                  <th className="py-3.5 px-4">Asset Details</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-right">Original Cost</th>
                  <th className="py-3.5 px-4 text-right">Book Value</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkblue-850/60">
                {assets.map(asset => {
                  const bookVal = calculateBookValue(asset);
                  const depreciationPercent = ((asset.purchasePrice - bookVal) / asset.purchasePrice) * 100;

                  return (
                    <tr key={asset.id} className="hover:bg-darkblue-900/10">
                      <td className="py-4 px-4 font-mono font-bold text-brandorange-500">{asset.tag}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-white text-sm">{asset.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-darkblue-800 text-slate-400 rounded-md border border-darkblue-750 inline-block mt-0.5 uppercase">
                          {asset.department}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <UserCheck className="h-4 w-4 text-slate-500" />
                          <span>{asset.assignedTo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 font-medium">${asset.purchasePrice}</td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-green-400">${bookVal.toFixed(2)}</p>
                        <span className="text-[9px] text-slate-550 block mt-0.5">-{depreciationPercent.toFixed(0)}% Depreciated</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setInspectAsset(asset)}
                          className="px-2.5 py-1 bg-darkblue-950/50 border border-darkblue-800 hover:border-brandorange-500 text-slate-400 hover:text-white rounded-lg text-xxs font-bold uppercase transition-all"
                        >
                          Audit Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        
        <div className="space-y-8">
          
          
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Register Asset</h3>
                <p className="text-xs text-slate-400 mt-0.5">Log new school/corporate equipment</p>
              </div>
            </div>

            <form onSubmit={handleRegisterAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Asset Tag ID *</label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="e.g. LAP-044"
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-350 outline-none"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="Product Design">Product Design</option>
                    <option value="HR & Admin">HR & Admin</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Equipment Name *</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Dell Latitude 5440"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Custodian (Assign To)</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Unassigned (In Storage)"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Purchase Cost ($) *</label>
                  <input
                    type="number"
                    value={purchasePrice === 0 ? '' : purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    placeholder="e.g. 1500"
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Depreciation (% / yr)</label>
                  <input
                    type="number"
                    value={depreciationRate}
                    onChange={(e) => setDepreciationRate(Number(e.target.value))}
                    placeholder="e.g. 20"
                    className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Purchase Date *</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-350 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 active:scale-95 mt-4"
              >
                Register Hardware Asset
              </button>
            </form>
          </div>

          
          {inspectAsset && (
            <div className="glass-card rounded-2xl p-6 border border-brandorange-500/20 flex flex-col relative animate-slideIn">
              <button 
                onClick={() => setInspectAsset(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ×
              </button>
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="p-2 bg-darkblue-800 rounded-lg text-brandorange-500">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">{inspectAsset.tag} Maintenance Record</h4>
              </div>

              <div className="space-y-3 text-xxs">
                <div className="bg-darkblue-950/40 p-3 rounded-lg border border-darkblue-850">
                  <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Assigned Custodian</p>
                  <p className="text-slate-200 font-semibold">{inspectAsset.assignedTo} ({inspectAsset.department})</p>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-550 font-bold uppercase tracking-widest flex items-center space-x-1">
                    <History className="h-3.5 w-3.5 text-slate-650" />
                    <span>Diagnostics History</span>
                  </p>
                  
                  {inspectAsset.maintenanceHistory.length === 0 ? (
                    <p className="text-slate-600 italic">No maintenance sessions logged for this asset.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {inspectAsset.maintenanceHistory.map((h, i) => (
                        <div key={i} className="border-l border-brandorange-500/50 pl-2.5 py-0.5">
                          <span className="text-[9px] text-slate-500 font-medium block">{h.date}</span>
                          <span className="text-slate-300">{h.note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
