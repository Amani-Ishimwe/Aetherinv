import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Phone, MapPin, Award, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  totalSpent: number;
  outstandingDebt: number;
}

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // CRM database from backend
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialPoints, setInitialPoints] = useState(10);
  const [debt, setDebt] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load customers from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot register new customers.');
      return;
    }

    if (!name || !email || !phone) {
      setErrorMsg('Please enter Customer Name, Email, and Phone number.');
      return;
    }

    const newCustomer: Customer = {
      id: `CST-00${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      address,
      loyaltyPoints: Number(initialPoints),
      totalSpent: 0,
      outstandingDebt: Number(debt)
    };

    try {
      await api.post('/customers', newCustomer);
      fetchCustomers();
      // Clear forms
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setInitialPoints(10);
      setDebt(0);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to save customer to database.');
    }
  };

  const getLoyaltyBadge = (points: number) => {
    if (points >= 1500) return { label: 'Platinum Elite', color: 'text-blue-400 border-blue-400/20 bg-blue-500/5' };
    if (points >= 500) return { label: 'Gold Tier', color: 'text-amber-400 border-amber-400/20 bg-amber-500/5' };
    if (points >= 200) return { label: 'Silver Member', color: 'text-slate-350 border-slate-350/20 bg-slate-500/5' };
    return { label: 'Bronze Partner', color: 'text-brandorange-500 border-brandorange-500/20 bg-brandorange-500/5' };
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Customer CRM Directory</h2>
        <p className="text-slate-400 text-sm mt-1">Manage client profiles, check loyalty tier allocations, and review outstanding accounts receivable.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: CRM Cards */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-darkblue-950/20 border border-darkblue-850 rounded-2xl">
              <Loader2 className="h-10 w-10 text-brandorange-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading customers database...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-darkblue-950/20 border border-dashed border-darkblue-800 rounded-2xl">
              <Users className="h-12 w-12 text-slate-650 mb-3" />
              <p className="text-slate-400 font-semibold">No customers registered</p>
              <p className="text-xs text-slate-500 mt-1">Use the panel on the right to register a new CRM partner.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customers.map(c => {
                const badge = getLoyaltyBadge(c.loyaltyPoints);

                return (
                  <div key={c.id} className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors group">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                          <Users className="h-5.5 w-5.5" />
                        </div>
                        
                        {/* Loyalty Badge */}
                        <span className={`px-2.5 py-1 border text-[9px] font-bold uppercase rounded-full tracking-wider flex items-center space-x-1 ${badge.color}`}>
                          <Award className="h-3 w-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      <h3 className="font-extrabold text-lg text-white group-hover:text-brandorange-400 transition-colors capitalize">{c.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{c.id}</span>
                      
                      {/* Contacts list */}
                      <div className="space-y-2 mt-4 text-xs text-slate-400">
                        <p className="flex items-center space-x-2.5 truncate">
                          <Mail className="h-4 w-4 text-slate-550 shrink-0" />
                          <span>{c.email}</span>
                        </p>
                        <p className="flex items-center space-x-2.5">
                          <Phone className="h-4 w-4 text-slate-550 shrink-0" />
                          <span>{c.phone}</span>
                        </p>
                        <p className="flex items-center space-x-2.5">
                          <MapPin className="h-4 w-4 text-slate-550 shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-5 text-[10px] bg-darkblue-950/45 border border-darkblue-850 p-2.5 rounded-xl">
                        <div>
                          <span className="text-slate-500 block">Total Spent:</span>
                          <strong className="text-slate-200">${c.totalSpent.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Loyalty Points:</span>
                          <strong className="text-brandorange-400">{c.loyaltyPoints} pts</strong>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-darkblue-800/80 pt-3.5 mt-5 flex justify-between items-center text-xs">
                      <span className="text-slate-550">Outstanding Debt:</span>
                      <span className={`font-extrabold text-sm ${c.outstandingDebt > 0 ? 'text-red-400 animate-pulse' : 'text-green-450'}`}>
                        ${c.outstandingDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Register Customer form */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 h-fit">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create CRM Profile</h3>
              <p className="text-xs text-slate-400 mt-0.5">Register a new client account profile</p>
            </div>
          </div>

          <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Customer Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice Uwase"
                className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Email Contact *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@customer.com"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +250..."
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, District, Country"
                className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Outstanding Debt ($)</label>
                <input
                  type="number"
                  value={debt === 0 ? '' : debt}
                  onChange={(e) => setDebt(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Starting Loyalty Points</label>
                <input
                  type="number"
                  value={initialPoints}
                  onChange={(e) => setInitialPoints(Number(e.target.value))}
                  placeholder="10"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 active:scale-95 mt-4"
            >
              Register Customer CRM
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
