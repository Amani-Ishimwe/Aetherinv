import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationPanel } from './NotificationPanel';
import api from '../services/api';

export type ActiveView =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'warehouses'
  | 'assets'
  | 'suppliers'
  | 'purchases'
  | 'sales'
  | 'customers'
  | 'scanner'
  | 'auditing'
  | 'reports'
  | 'security';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ActiveView;
  setView: (view: ActiveView) => void;
}

// ── Human-readable page titles & descriptions ─────────────────────────────
const viewMeta: Record<ActiveView, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Overview',           subtitle: 'Your business snapshot for today' },
  products:   { title: 'Products',           subtitle: 'View and manage every item you sell or stock' },
  inventory:  { title: 'Stock Movements',    subtitle: 'Record items coming in, going out, or returned' },
  warehouses: { title: 'Storage Locations',  subtitle: 'Manage your shops, stores, and warehouses' },
  assets:     { title: 'Equipment Register', subtitle: 'Track office devices and their assigned staff' },
  suppliers:  { title: 'Suppliers',          subtitle: 'View and manage your supply partners' },
  purchases:  { title: 'Purchase Orders',    subtitle: 'Order from suppliers and track deliveries' },
  sales:      { title: 'Sales & Invoices',   subtitle: 'Record sales, issue invoices, and track payments' },
  customers:  { title: 'Customers',          subtitle: 'Store client details and track loyalty points' },
  scanner:    { title: 'Barcode Scanner',    subtitle: 'Scan product barcodes using your camera' },
  auditing:   { title: 'Stock Take',         subtitle: 'Count your stock and fix any differences found' },
  reports:    { title: 'Reports & Insights', subtitle: 'See revenue, profits, and best-selling products' },
  security:   { title: 'Permissions',        subtitle: 'Control what each team member can access' },
};

// ── Navigation definition ─────────────────────────────────────────────────
const navGroups = [
  {
    title: 'Home',
    items: [
      { id: 'dashboard' as ActiveView, name: 'Overview',          icon: 'fa-solid fa-gauge-high' },
    ],
  },
  {
    title: 'Products & Stock',
    items: [
      { id: 'products'   as ActiveView, name: 'Products',          icon: 'fa-solid fa-tag' },
      { id: 'inventory'  as ActiveView, name: 'Stock Movements',   icon: 'fa-solid fa-arrow-right-arrow-left' },
      { id: 'warehouses' as ActiveView, name: 'Storage Locations', icon: 'fa-solid fa-warehouse' },
      { id: 'assets'     as ActiveView, name: 'Equipment',         icon: 'fa-solid fa-laptop' },
    ],
  },
  {
    title: 'Sales & Purchasing',
    items: [
      { id: 'suppliers'  as ActiveView, name: 'Suppliers',         icon: 'fa-solid fa-truck-fast' },
      { id: 'purchases'  as ActiveView, name: 'Purchase Orders',   icon: 'fa-solid fa-cart-flatbed' },
      { id: 'sales'      as ActiveView, name: 'Sales & Invoices',  icon: 'fa-solid fa-receipt' },
      { id: 'customers'  as ActiveView, name: 'Customers',         icon: 'fa-solid fa-users' },
    ],
  },
  {
    title: 'Tools & Reports',
    items: [
      { id: 'scanner'    as ActiveView, name: 'Barcode Scanner',   icon: 'fa-solid fa-barcode' },
      { id: 'auditing'   as ActiveView, name: 'Stock Take',        icon: 'fa-solid fa-clipboard-check' },
      { id: 'reports'    as ActiveView, name: 'Reports',           icon: 'fa-solid fa-chart-pie' },
      { id: 'security'   as ActiveView, name: 'Permissions',       icon: 'fa-solid fa-shield-halved' },
    ],
  },
];

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/products/low-stock?threshold=5');
      if (res.data) setLowStockCount(res.data.length);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchLowStock();
    const t = setInterval(fetchLowStock, 30000);
    return () => clearInterval(t);
  }, []);

  const meta = viewMeta[currentView];
  const userDisplayName = user?.firstname
    ? `${user.firstname} ${user?.lastname || ''}`.trim()
    : user?.email?.split('@')[0] ?? 'User';
  const userInitials = userDisplayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // ── Sidebar inner content (shared between desktop & mobile) ─────────────
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center shadow-lg shadow-brandorange-500/30">
          <i className="fa-solid fa-boxes-stacked text-white text-sm"></i>
        </div>
        <span className="text-lg font-black tracking-widest text-white">
          AETHER<span className="text-brandorange-500">INV</span>
        </span>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white transition-colors p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6 pb-4 pr-2">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 px-3 mb-2">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setView(item.id); onClose?.(); }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                      transition-all duration-200 group relative
                      ${active
                        ? 'bg-brandorange-500 text-white shadow-lg shadow-brandorange-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-darkblue-800/70'
                      }
                    `}
                  >
                    {/* Active left indicator */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full opacity-60" />
                    )}
                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs shrink-0 transition-all duration-200 ${
                      active ? 'bg-white/20' : 'bg-darkblue-800/50 group-hover:bg-darkblue-700/80'
                    }`}>
                      <i className={item.icon}></i>
                    </span>
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-darkblue-800/60 p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-xl hover:bg-darkblue-800/50 transition-colors">
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brandorange-600/30 to-brandorange-400/10 border border-brandorange-500/30 flex items-center justify-center text-brandorange-400 text-xs font-black shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{userDisplayName}</p>
            <span className="text-[10px] text-brandorange-400 font-bold capitalize">{user?.role || 'Admin'}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-darkblue-800/50 text-xs shrink-0">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkblue-950 text-slate-100 flex flex-col md:flex-row" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>

      {/* ── Mobile top bar ────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-darkblue-900 border-b border-darkblue-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center">
            <i className="fa-solid fa-boxes-stacked text-white text-xs"></i>
          </div>
          <span className="font-black text-base tracking-widest text-white">
            AETHER<span className="text-brandorange-500">INV</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNotifOpen(true)} className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-darkblue-800 transition-colors">
            <i className="fa-solid fa-bell text-sm"></i>
            {lowStockCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brandorange-500 border-2 border-darkblue-900 animate-ping" />
            )}
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-darkblue-800 transition-colors">
            <i className="fa-solid fa-bars text-sm"></i>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer overlay ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-darkblue-900 border-r border-darkblue-800/80 flex flex-col z-10 shadow-2xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 shrink-0 sticky top-0 h-screen bg-darkblue-900 border-r border-darkblue-800/60 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Desktop top header bar */}
        <header className="hidden md:flex items-center justify-between bg-darkblue-900/40 backdrop-blur border-b border-darkblue-800/50 px-8 py-4 sticky top-0 z-30 shrink-0">
          <div>
            <h1 className="text-xl font-black text-white">{meta.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-xs font-bold text-brandorange-400 capitalize">
              <i className="fa-solid fa-user-tie text-xs"></i>
              {user?.role || 'Admin'}
            </span>

            {/* Notification bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2.5 border border-darkblue-800 hover:border-brandorange-500/40 bg-darkblue-900 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
              title="Notifications"
            >
              <i className="fa-solid fa-bell text-sm"></i>
              {lowStockCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brandorange-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full ring-2 ring-darkblue-950 animate-bounce">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Notification slide-over */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        lowStockCount={lowStockCount}
      />
    </div>
  );
};
