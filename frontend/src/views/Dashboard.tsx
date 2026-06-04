import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getAuditLogs, clearAuditLogs } from '../services/auditLogger';
import type { AuditLog } from '../services/auditLogger';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

interface CategoryMetric {
  skuCount: number;
  totalQuantity: number;
  valuation: number;
  avgPrice: number;
}

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState<number>(5);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (currentThreshold: number) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch category stats
      const statsRes = await api.get('/products/stats');
      setStats(statsRes.data || {});

      // 2. Fetch low stock with dynamic threshold
      const lowStockRes = await api.get(`/products/low-stock?threshold=${currentThreshold}`);
      setLowStock(lowStockRes.data || []);

      // 3. Fetch all products to calculate total valuation and category asset metrics
      const productsRes = await api.get('/products?size=1000');
      const productsList = productsRes.data?.content || [];
      setAllProducts(productsList);

    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not retrieve database statistics. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(threshold);
  }, [threshold]);

  // Load audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      const data = await getAuditLogs();
      setLogs(data);
    };
    fetchLogs();
    const handleUpdate = () => {
      fetchLogs();
    };
    window.addEventListener('audit-log-updated', handleUpdate);
    return () => {
      window.removeEventListener('audit-log-updated', handleUpdate);
    };
  }, []);

  // Calculate Metrics
  const totalValuation = allProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalItems = allProducts.reduce((sum, p) => sum + p.quantity, 0);
  const uniqueItemsCount = allProducts.length;
  const categoriesCount = Object.keys(stats).length;

  // Calculate Category Assets Metrics dynamically
  const categoryMetrics: Record<string, CategoryMetric> = {};
  allProducts.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!categoryMetrics[cat]) {
      categoryMetrics[cat] = { skuCount: 0, totalQuantity: 0, valuation: 0, avgPrice: 0 };
    }
    categoryMetrics[cat].skuCount += 1;
    categoryMetrics[cat].totalQuantity += p.quantity;
    categoryMetrics[cat].valuation += (p.price * p.quantity);
  });

  Object.keys(categoryMetrics).forEach(cat => {
    const countInCat = allProducts.filter(p => (p.category || 'Uncategorized') === cat).length;
    const priceSum = allProducts.filter(p => (p.category || 'Uncategorized') === cat).reduce((sum, p) => sum + p.price, 0);
    categoryMetrics[cat].avgPrice = countInCat > 0 ? priceSum / countInCat : 0;
  });

  const kpis = [
    {
      title: 'Total Stock',
      value: totalItems.toLocaleString(),
      subtitle: `${uniqueItemsCount} unique products`,
      faIcon: 'fa-solid fa-boxes-stacked',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Total Stock Value',
      value: `$${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Combined value of all items',
      faIcon: 'fa-solid fa-sack-dollar',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      title: 'Low Stock Alerts',
      value: lowStock.length,
      subtitle: `${threshold} units or fewer remaining`,
      faIcon: 'fa-solid fa-triangle-exclamation',
      color: 'text-brandorange-400',
      bgColor: 'bg-brandorange-500/10 border-brandorange-500/20',
      highlight: lowStock.length > 0
    },
    {
      title: 'Product Categories',
      value: categoriesCount,
      subtitle: 'Groups of products',
      faIcon: 'fa-solid fa-layer-group',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Business Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Live snapshot of your stock, sales alerts, and product performance.</p>
        </div>
        <button
          onClick={() => fetchData(threshold)}
          disabled={loading}
          className="flex items-center gap-2 bg-darkblue-900 border border-darkblue-800 hover:border-brandorange-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all font-medium text-sm"
        >
          <i className={`fa-solid fa-rotate-right text-brandorange-500 ${loading ? 'fa-spin' : ''}`}></i>
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <i className="fa-solid fa-circle-exclamation text-lg shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`glass-card rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              kpi.highlight
                ? 'border-brandorange-500/30 ring-1 ring-brandorange-500/15 shadow-brandorange-500/5'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider">{kpi.title}</p>
                {loading ? (
                  <div className="h-9 w-24 bg-darkblue-800/80 rounded-lg animate-pulse mt-2" />
                ) : (
                  <h3 className="text-3xl font-black text-white mt-2 tracking-tight">{kpi.value}</h3>
                )}
                <p className="text-slate-500 text-xs mt-1.5">{kpi.subtitle}</p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border ${kpi.bgColor} ${kpi.color} text-lg shrink-0 ml-3`}>
                <i className={kpi.faIcon}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Low Stock & Category Asset Table */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Low Stock Warnings */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-brandorange-500"></i>
                  <span>Running Low on Stock</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Products with very few units remaining</p>
              </div>

              {/* Range Slider for Threshold */}
              <div className="flex items-center gap-3 bg-darkblue-900 border border-darkblue-800 rounded-xl px-4 py-2 text-xs">
                <i className="fa-solid fa-sliders text-brandorange-500 shrink-0"></i>
                <span className="text-slate-300 font-medium">Alert at: <strong>{threshold}</strong> units</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-24 accent-brandorange-500 cursor-pointer h-1 bg-darkblue-800 rounded-lg appearance-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-16 bg-darkblue-900/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-darkblue-900/20 rounded-2xl border border-dashed border-darkblue-800/60">
                <i className="fa-solid fa-circle-check text-4xl text-green-500/60 mb-3"></i>
                <p className="text-slate-400 font-medium">All products are well stocked</p>
                <p className="text-xs text-slate-500 mt-1">No products are below the {threshold} units limit.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {lowStock.map((prod) => (
                  <div 
                    key={prod.id}
                    className="bg-darkblue-900/55 border border-brandorange-500/20 hover:border-brandorange-500/40 rounded-xl p-4 flex items-center justify-between transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-darkblue-800 text-slate-300 border border-darkblue-700 rounded-md">
                          {prod.sku}
                        </span>
                        <h4 className="font-bold text-white truncate text-sm sm:text-base group-hover:text-brandorange-400 transition-colors">
                          {prod.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 flex items-center space-x-3">
                        <span>Category: <strong className="text-slate-300 font-medium">{prod.category || 'General'}</strong></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-darkblue-800"></span>
                        <span>Price: <strong className="text-slate-300 font-medium">${prod.price.toFixed(2)}</strong></span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-brandorange-500 block">
                        {prod.quantity}
                      </span>
                      <span className="text-xxs uppercase tracking-wider font-semibold text-brandorange-500/70">
                        Units left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Category Insights */}
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-brandorange-500"></i>
                <span>Stock Value by Category</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">How much each product group is worth in total</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-10 bg-darkblue-900/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : Object.keys(categoryMetrics).length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No inventory logs available to calculate metrics.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-darkblue-850 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Category Name</th>
                      <th className="pb-3 px-4 text-center">Unique SKUs</th>
                      <th className="pb-3 px-4 text-right">Total Units</th>
                      <th className="pb-3 px-4 text-right">Avg Unit Price</th>
                      <th className="pb-3 pl-4 text-right">Total Asset Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkblue-850/60">
                    {Object.entries(categoryMetrics).map(([catName, metric]) => (
                      <tr key={catName} className="hover:bg-darkblue-900/10">
                        <td className="py-3 pr-4 font-bold text-white capitalize">{catName}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{metric.skuCount}</td>
                        <td className="py-3 px-4 text-right text-slate-300 font-semibold">{metric.totalQuantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-slate-300">${metric.avgPrice.toFixed(2)}</td>
                        <td className="py-3 pl-4 text-right text-brandorange-400 font-bold">
                          ${metric.valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Chart & Audit Logs */}
        <div className="space-y-8">
          
          {/* Allocation Donut Chart */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-brandorange-500"></i>
                <span>Stock by Category</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">How your products are split across groups</p>
            </div>

            {loading ? (
              <div className="h-44 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-darkblue-800 border-t-brandorange-500 animate-spin"></div>
              </div>
            ) : Object.keys(stats).length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-slate-600">
                <i className="fa-solid fa-chart-pie text-3xl mb-3 opacity-40"></i>
                <p className="text-xs font-semibold">No category data yet</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* SVG Visualizer */}
                <div className="relative flex items-center justify-center h-40 my-3">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="54" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                    {(() => {
                      const totalVal = Object.values(stats).reduce((a, b) => a + b, 0);
                      let accumulatedPercent = 0;
                      const strokeDasharray = 2 * Math.PI * 54; // ~339.3
                      
                      return Object.entries(stats).map(([cat, val], idx) => {
                        const pct = val / totalVal;
                        const offset = strokeDasharray - (pct * strokeDasharray);
                        const rotateOffset = (accumulatedPercent * 360);
                        accumulatedPercent += pct;
                        const hue = (idx * 55 + 20) % 360;
                        const strokeColor = `hsl(${hue}, 85%, 55%)`;

                        return (
                          <circle
                            key={cat}
                            cx="72"
                            cy="72"
                            r="54"
                            stroke={strokeColor}
                            strokeWidth="10"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={offset}
                            fill="transparent"
                            transform={`rotate(${rotateOffset} 72 72)`}
                            strokeLinecap="round"
                            className="transition-all duration-300 hover:stroke-[13px] cursor-pointer"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{totalItems}</span>
                    <span className="text-xxs text-slate-400 uppercase tracking-widest font-bold">Total Pcs</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {Object.entries(stats).map(([category, count], idx) => {
                    const hue = (idx * 55 + 20) % 360;
                    const dotColor = `hsl(${hue}, 85%, 55%)`;
                    const pct = ((count / totalItems) * 100).toFixed(0);

                    return (
                      <div key={category} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                          <span className="text-slate-300 truncate capitalize font-medium">{category || 'General'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-right">
                          <span className="text-slate-400 font-semibold">{count}</span>
                          <span className="text-slate-500 text-xxs font-bold">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Audit Logs / Activity Feed */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-brandorange-500"></i>
                  <span>Recent Activity</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Latest actions taken on products and stock</p>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={clearAuditLogs}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/25"
                  title="Clear History"
                >
                  <i className="fa-solid fa-trash text-sm"></i>
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-darkblue-900/10 rounded-xl border border-dashed border-darkblue-800/40">
                <i className="fa-solid fa-clock-rotate-left text-2xl text-slate-700 mb-2"></i>
                <p className="text-xs text-slate-400 font-semibold">No recent activity yet</p>
                <p className="text-xxs text-slate-500 mt-0.5">Actions on products and stock will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                {logs.map((log) => {
                  let badgeColor = '';
                  let actionLabel = '';

                  switch (log.action) {
                    case 'CREATE':
                      badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
                      actionLabel = 'Created';
                      break;
                    case 'UPDATE':
                      badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      actionLabel = 'Updated';
                      break;
                    case 'DELETE':
                      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                      actionLabel = 'Removed';
                      break;
                  }

                  const timeString = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={log.id} className="border-b border-darkblue-850/50 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 border text-xxs font-bold rounded-md ${badgeColor}`}>
                          {actionLabel}
                        </span>
                        <span className="text-slate-500 text-xxs font-medium">{timeString}</span>
                      </div>
                      <p className="text-slate-200 font-semibold truncate">
                        {log.productName} <span className="text-slate-400 font-normal">({log.sku})</span>
                      </p>
                      <p className="text-slate-500 text-xxs truncate mt-0.5">By: {log.userEmail}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
