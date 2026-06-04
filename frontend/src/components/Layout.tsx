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

const navGroups = [
  {
    title: 'Main',
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
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Sidebar ───────────────────────────────────────────────────────────
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>

      {/* ── Logo strip ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 shrink-0 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center shadow-lg shadow-brandorange-600/40 shrink-0">
          <i className="fa-solid fa-boxes-stacked text-white text-sm"></i>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-black tracking-[0.18em] text-white">
            AETHER<span className="text-brandorange-500">INV</span>
          </span>
          <span className="text-[9px] font-semibold text-slate-600 tracking-widest uppercase mt-0.5">Business Management</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {/* ── Nav groups ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.title}>
            {/* Section label */}
            <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-600 px-3 mb-1.5">
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
                      transition-all duration-200 group relative overflow-hidden text-left
                      ${active
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }
                    `}
                  >
                    {/* Active background glow */}
                    {active && (
                      <span className="absolute inset-0 bg-gradient-to-r from-brandorange-600 to-brandorange-500 rounded-xl shadow-lg shadow-brandorange-600/30" />
                    )}

                    {/* Icon box */}
                    <span className={`
                      relative z-10 w-8 h-8 flex items-center justify-center rounded-lg text-sm shrink-0 transition-all duration-200
                      ${active
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'
                      }
                    `}>
                      <i className={item.icon}></i>
                    </span>

                    {/* Label */}
                    <span className="relative z-10 truncate">{item.name}</span>

                    {/* Active chevron */}
                    {active && (
                      <i className="fa-solid fa-chevron-right relative z-10 text-[10px] text-white/50 ml-auto shrink-0"></i>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User card ─────────────────────────────────────────────────── */}
      <div className="shrink-0 p-3 border-t border-white/5">
        {/* Profile row */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5 mb-2">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-brandorange-600/30">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate leading-tight">{userDisplayName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-semibold capitalize truncate">{user?.role || 'Admin'}</span>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 shadow-sm shadow-green-500/50"></div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-red-500/15 text-sm transition-colors duration-200 shrink-0">
            <i className="fa-solid fa-right-from-bracket"></i>
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-darkblue-950 text-slate-100 flex flex-col md:flex-row"
      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
    >
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-darkblue-900/95 backdrop-blur border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center shadow-md shadow-brandorange-600/30">
            <i className="fa-solid fa-boxes-stacked text-white text-xs"></i>
          </div>
          <span className="font-black text-[14px] tracking-widest text-white">
            AETHER<span className="text-brandorange-500">INV</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <i className="fa-solid fa-bell text-sm"></i>
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brandorange-500 ring-2 ring-darkblue-900" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <i className="fa-solid fa-bars text-sm"></i>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-darkblue-900 border-r border-white/5 flex flex-col z-10 shadow-2xl shadow-black/50">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 shrink-0 sticky top-0 h-screen bg-darkblue-900 border-r border-white/5 flex-col shadow-xl shadow-black/30">
        <SidebarContent />
      </aside>

      {/* ── Main content area ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Desktop top header */}
        <header className="hidden md:flex items-center justify-between bg-darkblue-950/80 backdrop-blur-md border-b border-white/5 px-8 py-4 sticky top-0 z-30 shrink-0">
          {/* Page title */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">{meta.title}</h1>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{meta.subtitle}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-bold text-brandorange-400 capitalize">{user?.role || 'Admin'}</span>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 border border-white/5 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                {userInitials}
              </div>
              <span className="text-sm font-semibold text-slate-300">{userDisplayName}</span>
            </div>

            {/* Notification bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center border border-white/10 hover:border-brandorange-500/40 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
              title="Notifications"
            >
              <i className="fa-solid fa-bell text-sm"></i>
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brandorange-600 text-white font-black text-[9px] rounded-full ring-2 ring-darkblue-950 flex items-center justify-center">
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
