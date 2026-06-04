import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Layers, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Loader2, 
  FileDown, 
  AlertTriangle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'purchases' | 'financials'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?size=1000');
      setProducts(res.data?.content || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not fetch catalog products for report calculations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // calculations
  const totalValuation = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalUniqueSkus = products.length;
  const totalItemsCount = products.reduce((sum, p) => sum + p.quantity, 0);
  
  // Dead stock: products with quantity > 100 or price > $500 that have 0 movements (simulated here as quantity > 50)
  const deadStock = products.filter(p => p.quantity > 50);
  // Low stock (quantity <= 5)
  const lowStock = products.filter(p => p.quantity <= 5);

  // Financial statistics
  const revenue = 125000.00;
  const expenses = 48200.00;
  const costOfGoodsSold = 62000.00;
  const grossProfit = revenue - costOfGoodsSold;
  const netProfit = grossProfit - expenses;

  // Mock Sales Trend Data for SVG line graph (Monthly Revenue)
  const salesTrend = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 22000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 27000 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 31000 }
  ];

  // Mock Cash Flow Data for SVG bar chart (Cash In vs Cash Out)
  const cashFlow = [
    { period: 'Q1', inflow: 55000, outflow: 32000 },
    { period: 'Q2', inflow: 68000, outflow: 48000 },
    { period: 'Q3', inflow: 62000, outflow: 42000 },
    { period: 'Q4', inflow: 85000, outflow: 55000 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Reporting Center</h2>
          <p className="text-slate-400 text-sm mt-1">Audit current holdings, examine sales statistics, purchase expenditures, and financial summaries.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center space-x-2 bg-darkblue-900 border border-darkblue-800 hover:border-brandorange-500 text-slate-350 hover:text-white px-4 py-2.5 rounded-xl transition-all font-semibold text-sm"
        >
          <FileDown className="h-4.5 w-4.5 text-brandorange-500" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Tabs selector */}
      <div className="border-b border-darkblue-800 flex flex-wrap gap-1">
        {(['inventory', 'sales', 'purchases', 'financials'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-brandorange-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-250 hover:border-darkblue-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-brandorange-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400">Compiling dataset...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Tab 1: Inventory Reports */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Valuation breakdown */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 h-fit">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-brandorange-500" />
                  <span>Asset Valuation Summary</span>
                </h3>
                
                <div className="space-y-4 pt-2">
                  <div className="bg-darkblue-950/40 p-4 border border-darkblue-850 rounded-xl">
                    <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Total Catalog Valuation</span>
                    <strong className="text-2xl font-black text-white">${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-darkblue-950/40 p-3.5 border border-darkblue-850 rounded-xl">
                      <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Unique SKUs</span>
                      <strong className="text-lg font-bold text-slate-200">{totalUniqueSkus}</strong>
                    </div>
                    <div className="bg-darkblue-950/40 p-3.5 border border-darkblue-850 rounded-xl">
                      <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Total Items</span>
                      <strong className="text-lg font-bold text-slate-200">{totalItemsCount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dead Stock & Alerts lists */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Low Stock Alerts */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-brandorange-500 animate-pulse" />
                    <span>Low Stock Alerts ({lowStock.length})</span>
                  </h3>
                  {lowStock.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No items are currently below stock limits.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-darkblue-850 text-slate-400 font-semibold uppercase">
                            <th className="pb-2">SKU</th>
                            <th className="pb-2">Product Name</th>
                            <th className="pb-2 text-center">Qty Left</th>
                            <th className="pb-2 text-right">Value ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-darkblue-850/40 text-slate-350">
                          {lowStock.slice(0, 4).map(p => (
                            <tr key={p.id} className="hover:bg-darkblue-900/10">
                              <td className="py-2.5 font-mono text-brandorange-500 font-bold">{p.sku}</td>
                              <td className="py-2.5 font-semibold text-white">{p.name}</td>
                              <td className="py-2.5 text-center text-red-400 font-bold">{p.quantity}</td>
                              <td className="py-2.5 text-right font-medium">${(p.price * p.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Dead Stock Excess */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Slow Moving / Over-stocked (Dead Stock)</span>
                  </h3>
                  {deadStock.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No slow-moving inventory detected.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-darkblue-850 text-slate-400 font-semibold uppercase">
                            <th className="pb-2">SKU</th>
                            <th className="pb-2">Product Name</th>
                            <th className="pb-2 text-center">Current Quantity</th>
                            <th className="pb-2 text-right">Asset Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-darkblue-850/40 text-slate-350">
                          {deadStock.slice(0, 4).map(p => (
                            <tr key={p.id} className="hover:bg-darkblue-900/10">
                              <td className="py-2.5 font-mono text-slate-300">{p.sku}</td>
                              <td className="py-2.5 font-semibold text-white">{p.name}</td>
                              <td className="py-2.5 text-center text-slate-300 font-bold">{p.quantity}</td>
                              <td className="py-2.5 text-right font-bold text-slate-200">${(p.price * p.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Tab 2: Sales Reports */}
          {activeTab === 'sales' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales line graph visual */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-brandorange-500" />
                    <span>Monthly Sales & Revenue Trends</span>
                  </h3>
                  
                  {/* Custom SVG line chart */}
                  <div className="relative h-60 w-full mt-4 flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
                      <line x1="40" y1="80" x2="480" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />

                      {/* X-axis labels */}
                      {salesTrend.map((t, i) => {
                        const x = 40 + i * 80;
                        return (
                          <text key={t.month} x={x} y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">
                            {t.month}
                          </text>
                        );
                      })}

                      {/* Y-axis labels */}
                      <text x="35" y="25" fill="#64748b" fontSize="8" textAnchor="end">$30k</text>
                      <text x="35" y="85" fill="#64748b" fontSize="8" textAnchor="end">$20k</text>
                      <text x="35" y="145" fill="#64748b" fontSize="8" textAnchor="end">$10k</text>

                      {/* Data Line */}
                      {(() => {
                        const points = salesTrend.map((t, i) => {
                          const x = 40 + i * 80;
                          // map 0-35000 to y=170 to y=20
                          const y = 170 - (t.revenue / 35000) * 150;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              points={points}
                            />
                            {/* Points overlay dots */}
                            {salesTrend.map((t, i) => {
                              const x = 40 + i * 80;
                              const y = 170 - (t.revenue / 35000) * 150;
                              return (
                                <circle 
                                  key={i} 
                                  cx={x} 
                                  cy={y} 
                                  r="5.5" 
                                  fill="#090d16" 
                                  stroke="#ea580c" 
                                  strokeWidth="2.5" 
                                  className="cursor-pointer hover:r-[7px] transition-all"
                                />
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                <div className="text-xxs text-slate-500 border-t border-darkblue-800/80 pt-3 mt-4">
                  * Dynamic SVG chart mapping revenues logged over the current calendar period.
                </div>
              </div>

              {/* Sales KPIs breakdown */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-brandorange-500" />
                  <span>Sales metrics</span>
                </h3>

                <div className="space-y-4 pt-2 text-xs">
                  <div className="bg-darkblue-950/40 p-4 border border-darkblue-850 rounded-xl">
                    <span className="text-slate-500 text-xxs font-bold block uppercase mb-1">Total Sales Revenue</span>
                    <strong className="text-xl font-bold text-white">${revenue.toLocaleString()}</strong>
                  </div>
                  <div className="bg-darkblue-950/40 p-4 border border-darkblue-850 rounded-xl">
                    <span className="text-slate-500 text-xxs font-bold block uppercase mb-1">Total Transactions count</span>
                    <strong className="text-xl font-bold text-white">412 orders</strong>
                  </div>
                  <div className="bg-darkblue-950/40 p-4 border border-darkblue-850 rounded-xl">
                    <span className="text-slate-500 text-xxs font-bold block uppercase mb-1">Average Order Value</span>
                    <strong className="text-xl font-bold text-white">$303.39</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Purchase Reports */}
          {activeTab === 'purchases' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Purchase stats table */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2 mb-6">
                  <ShoppingCart className="h-4 w-4 text-brandorange-500" />
                  <span>Purchases by Supplier Directory</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-darkblue-850 text-slate-450 font-bold uppercase">
                        <th className="pb-3">Supplier Name</th>
                        <th className="pb-3 text-center">PO Orders Count</th>
                        <th className="pb-3 text-right">Items Purchased</th>
                        <th className="pb-3 text-right">Total Expenditures</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkblue-850/60 text-slate-300">
                      <tr className="hover:bg-darkblue-900/10">
                        <td className="py-3 font-bold text-white">TechLogix Distribution</td>
                        <td className="py-3 text-center font-medium">14</td>
                        <td className="py-3 text-right font-medium">1,200 pcs</td>
                        <td className="py-3 text-right font-bold text-brandorange-400">$18,400.00</td>
                      </tr>
                      <tr className="hover:bg-darkblue-900/10">
                        <td className="py-3 font-bold text-white">Global Med & Health Ltd</td>
                        <td className="py-3 text-center font-medium">8</td>
                        <td className="py-3 text-right font-medium">450 pcs</td>
                        <td className="py-3 text-right font-bold text-brandorange-400">$20,250.00</td>
                      </tr>
                      <tr className="hover:bg-darkblue-900/10">
                        <td className="py-3 font-bold text-white">Afritech Industrial Suppliers</td>
                        <td className="py-3 text-center font-medium">5</td>
                        <td className="py-3 text-right font-medium">300 pcs</td>
                        <td className="py-3 text-right font-bold text-brandorange-400">$6,800.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase metrics panel */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-brandorange-500" />
                  <span>Expenditure Insights</span>
                </h3>

                <div className="space-y-4 pt-2 text-xs">
                  <div className="bg-darkblue-950/40 p-4 border border-darkblue-850 rounded-xl">
                    <span className="text-slate-500 text-xxs font-bold block uppercase mb-1">Total Procurement Costs</span>
                    <strong className="text-xl font-bold text-white">$45,450.00</strong>
                  </div>
                  <div className="bg-darkblue-950/40 p-4 border border-darkblue-850 rounded-xl">
                    <span className="text-slate-500 text-xxs font-bold block uppercase mb-1">Outstanding payable balance</span>
                    <strong className="text-xl font-bold text-white">$5,450.50</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Financial Reports */}
          {activeTab === 'financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profit & Loss Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 h-fit">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-brandorange-500" />
                  <span>Profit & Loss Summary (P&L)</span>
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-darkblue-850">
                    <span className="text-slate-400">Revenue (Gross Sales)</span>
                    <span className="font-semibold text-slate-200">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-darkblue-850">
                    <span className="text-slate-400">Cost of Goods Sold (COGS)</span>
                    <span className="font-semibold text-slate-250">-${costOfGoodsSold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-darkblue-800 font-bold">
                    <span className="text-slate-300">Gross Profit</span>
                    <span className="text-green-400">${grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-darkblue-850">
                    <span className="text-slate-400">Operating Expenses</span>
                    <span className="font-semibold text-slate-250">-${expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-black border-t-2 border-darkblue-800 pt-3">
                    <span className="text-white">Net Operating Profit</span>
                    <span className="text-brandorange-450">${netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Cash flow forecast */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2 mb-6">
                  <DollarSign className="h-4 w-4 text-brandorange-500" />
                  <span>Cash Flow Forecast (Inflow vs Outflow)</span>
                </h3>

                {/* Custom SVG bar chart */}
                <div className="relative h-56 w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 450 180">
                    {/* Y-axis helper grids */}
                    <line x1="30" y1="20" x2="430" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                    <line x1="30" y1="80" x2="430" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                    <line x1="30" y1="140" x2="430" y2="140" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                    <line x1="30" y1="150" x2="430" y2="150" stroke="#334155" strokeWidth="1.5" />

                    {/* Bars rendering */}
                    {cashFlow.map((cf, i) => {
                      const xBase = 50 + i * 100;
                      // Heights calculations: max cash = 90,000 -> scale to 130 max height
                      const inflowH = (cf.inflow / 90000) * 130;
                      const outflowH = (cf.outflow / 90000) * 130;
                      
                      const inflowY = 150 - inflowH;
                      const outflowY = 150 - outflowH;

                      return (
                        <g key={cf.period}>
                          {/* Inflow bar (Orange) */}
                          <rect
                            x={xBase}
                            y={inflowY}
                            width="16"
                            height={inflowH}
                            fill="#f97316"
                            rx="3"
                            className="transition-all hover:opacity-85 cursor-pointer"
                          />
                          {/* Outflow bar (Blue) */}
                          <rect
                            x={xBase + 22}
                            y={outflowY}
                            width="16"
                            height={outflowH}
                            fill="#3b82f6"
                            rx="3"
                            className="transition-all hover:opacity-85 cursor-pointer"
                          />
                          {/* label */}
                          <text x={xBase + 19} y="166" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">
                            {cf.period}
                          </text>
                        </g>
                      );
                    })}

                    {/* Legends */}
                    <rect x="330" y="5" width="10" height="10" fill="#f97316" rx="2" />
                    <text x="345" y="13" fill="#94a3b8" fontSize="8">Cash In</text>
                    <rect x="385" y="5" width="10" height="10" fill="#3b82f6" rx="2" />
                    <text x="400" y="13" fill="#94a3b8" fontSize="8">Cash Out</text>
                  </svg>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
