import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Truck, Mail, Phone, MapPin, Star, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[];
  rating: number; 
  outstandingBalance: number;
}

export const Suppliers: React.FC = () => {
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [productsSupplied, setProductsSupplied] = useState('');
  const [rating, setRating] = useState(4);
  const [balance, setBalance] = useState(0);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load suppliers from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleRegisterSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isViewer = user?.role === 'Viewer';
    if (isViewer) {
      setErrorMsg('Permission Denied: Viewers cannot register new suppliers.');
      return;
    }

    if (!name || !email || !phone) {
      setErrorMsg('Please enter Name, Email, and Phone contact info.');
      return;
    }

    const newSupplier: Supplier = {
      id: `SUP-00${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      address,
      productsSupplied: productsSupplied.split(',').map(s => s.trim()).filter(Boolean),
      rating,
      outstandingBalance: Number(balance)
    };

    try {
      await api.post('/suppliers', newSupplier);
      fetchSuppliers();
      
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setProductsSupplied('');
      setRating(4);
      setBalance(0);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to save supplier to database.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Partner Suppliers Directory</h2>
        <p className="text-slate-400 text-sm mt-1">Manage vendor contact logs, rating scorecards, and monitor accounts payable balances.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-darkblue-950/20 border border-darkblue-850 rounded-2xl">
              <Loader2 className="h-10 w-10 text-brandorange-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading suppliers database...</span>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-darkblue-950/20 border border-dashed border-darkblue-800 rounded-2xl">
              <Truck className="h-12 w-12 text-slate-650 mb-3" />
              <p className="text-slate-400 font-semibold">No suppliers registered</p>
              <p className="text-xs text-slate-500 mt-1">Establish your first vendor contract using the form on the right.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suppliers.map(sup => (
                <div key={sup.id} className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors group">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                        <Truck className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < sup.rating ? 'fill-brandorange-500 text-brandorange-500' : 'text-slate-650'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-lg text-white group-hover:text-brandorange-400 transition-colors capitalize">{sup.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{sup.id}</span>
                    
                    
                    <div className="space-y-2 mt-4 text-xs text-slate-400">
                      <p className="flex items-center space-x-2.5 truncate">
                        <Mail className="h-4 w-4 text-slate-550 shrink-0" />
                        <span>{sup.email}</span>
                      </p>
                      <p className="flex items-center space-x-2.5">
                        <Phone className="h-4 w-4 text-slate-550 shrink-0" />
                        <span>{sup.phone}</span>
                      </p>
                      <p className="flex items-center space-x-2.5">
                        <MapPin className="h-4 w-4 text-slate-550 shrink-0" />
                        <span className="truncate">{sup.address}</span>
                      </p>
                    </div>

                    
                    {sup.productsSupplied && sup.productsSupplied.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {sup.productsSupplied.map(p => (
                          <span key={p} className="text-[9px] font-bold bg-darkblue-800 text-slate-400 px-2 py-0.5 rounded border border-darkblue-750">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-darkblue-800/80 pt-4 mt-6 flex justify-between items-center text-xs">
                    <span className="text-slate-550">Outstanding Balance:</span>
                    <span className={`font-extrabold text-sm ${sup.outstandingBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ${sup.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="glass-card rounded-2xl p-6 border border-white/5 h-fit">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-brandorange-50/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Register Vendor</h3>
              <p className="text-xs text-slate-400 mt-0.5">Establish a new supply contract partnership</p>
            </div>
          </div>

          <form onSubmit={handleRegisterSupplier} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Supplier Company Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Tech Distribution"
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
                  placeholder="name@vendor.com"
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

            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Products Supplied (comma separated)</label>
              <input
                type="text"
                value={productsSupplied}
                onChange={(e) => setProductsSupplied(e.target.value)}
                placeholder="e.g. Laptops, RAM sticks, Adapters"
                className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Initial Balance Payable ($)</label>
                <input
                  type="number"
                  value={balance === 0 ? '' : balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Supplier Rating Score</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3.5 text-slate-350 outline-none"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 active:scale-95 mt-4"
            >
              Add Supplier Partner
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
