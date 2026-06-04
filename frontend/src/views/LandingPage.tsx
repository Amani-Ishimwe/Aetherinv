import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const features = [
  {
    icon: 'fa-solid fa-boxes-stacked',
    title: 'Track All Your Products',
    desc: 'See every item you sell or store — with photos, prices, and current stock levels — all in one easy place.',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/15 text-blue-400',
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Understand Your Sales',
    desc: 'Watch your daily and monthly revenue, see which products sell the most, and never miss a trend.',
    color: 'from-brandorange-500/20 to-brandorange-600/10',
    border: 'border-brandorange-500/30',
    iconBg: 'bg-brandorange-500/15 text-brandorange-400',
  },
  {
    icon: 'fa-solid fa-truck-fast',
    title: 'Manage Suppliers & Orders',
    desc: 'Send orders to your suppliers, track deliveries, and keep a full record of everything you purchase.',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/15 text-purple-400',
  },
  {
    icon: 'fa-solid fa-users',
    title: 'Know Your Customers',
    desc: 'Store customer details, track loyalty points, and see who owes outstanding balances at a glance.',
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    iconBg: 'bg-green-500/15 text-green-400',
  },
  {
    icon: 'fa-solid fa-warehouse',
    title: 'Multiple Storage Locations',
    desc: 'Manage stock across different warehouses or shops, and move items between locations with ease.',
    color: 'from-cyan-500/20 to-cyan-600/10',
    border: 'border-cyan-500/30',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Control Who Sees What',
    desc: 'Assign different access levels to your team — cashiers, managers, and accountants each see only what they need.',
    color: 'from-rose-500/20 to-rose-600/10',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/15 text-rose-400',
  },
  {
    icon: 'fa-solid fa-clipboard-list',
    title: 'Stock-Take & Counting',
    desc: 'Run stock checks to compare what you have versus what the system shows, and fix any differences instantly.',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  {
    icon: 'fa-solid fa-file-invoice',
    title: 'Professional Reports',
    desc: 'Get clear, beautiful reports on revenue, profit margins, best-sellers, and low-stock alerts — ready to share.',
    color: 'from-indigo-500/20 to-indigo-600/10',
    border: 'border-indigo-500/30',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
  },
];

const stats = [
  { value: '360°', label: 'Complete Business View', icon: 'fa-solid fa-eye' },
  { value: 'Real‑Time', label: 'Live Stock Updates', icon: 'fa-solid fa-bolt' },
  { value: 'Multi‑Site', label: 'Warehouse Support', icon: 'fa-solid fa-location-dot' },
  { value: 'Secure', label: 'Role‑Based Access', icon: 'fa-solid fa-lock' },
];

const modules = [
  { icon: 'fa-solid fa-gauge-high', name: 'Overview Dashboard', desc: 'Your business at a glance — revenue, stock levels, low-stock alerts, and top sellers.' },
  { icon: 'fa-solid fa-tag', name: 'Product Catalogue', desc: 'Add, edit, and organise every product with photos, barcodes, categories, and variants.' },
  { icon: 'fa-solid fa-arrow-right-arrow-left', name: 'Stock Movements', desc: 'Record items coming in, going out, returned, or damaged — always know what you have.' },
  { icon: 'fa-solid fa-receipt', name: 'Sales & Invoicing', desc: 'Create sales records, apply discounts, and track what has been paid or still outstanding.' },
  { icon: 'fa-solid fa-cart-flatbed', name: 'Purchase Orders', desc: 'Order from suppliers, track delivery status, and manage your purchase history.' },
  { icon: 'fa-solid fa-laptop', name: 'Equipment Register', desc: 'Keep a list of office devices and tools, who has them, and their current value.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-darkblue-950 text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>

      {/* ── Sticky Nav ───────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-darkblue-950/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-darkblue-850' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center shadow-lg shadow-brandorange-500/30">
              <i className="fa-solid fa-boxes-stacked text-white text-base"></i>
            </div>
            <span className="text-xl font-black tracking-widest text-white">
              AETHER<span className="text-brandorange-500">INV</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-5 py-2 text-sm font-bold text-slate-300 hover:text-white border border-darkblue-800 hover:border-brandorange-500/50 rounded-xl transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-brandorange-600 to-brandorange-500 hover:from-brandorange-500 hover:to-brandorange-400 rounded-xl shadow-lg shadow-brandorange-500/25 transition-all duration-200 active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brandorange-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brandorange-500/30 bg-brandorange-500/10 text-brandorange-400 text-xs font-bold tracking-widest uppercase mb-8 animate-pulse">
          <i className="fa-solid fa-circle-check text-xs"></i>
          Designed for African Businesses
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight max-w-4xl mx-auto mb-6">
          Run Your Business
          <span className="block bg-gradient-to-r from-brandorange-400 via-brandorange-500 to-amber-400 bg-clip-text text-transparent">
            With Full Confidence
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AetherInv gives every business owner — big or small — a complete picture of their stock, sales, and suppliers. No technical knowledge needed.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={onRegister}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brandorange-600 to-brandorange-500 hover:from-brandorange-500 hover:to-brandorange-400 text-white font-bold text-base rounded-2xl shadow-xl shadow-brandorange-500/30 transition-all duration-300 active:scale-95"
          >
            <i className="fa-solid fa-rocket group-hover:translate-x-0.5 transition-transform"></i>
            Start Managing Your Stock
          </button>
          <button
            onClick={onLogin}
            className="flex items-center gap-3 px-8 py-4 bg-darkblue-900/60 border border-darkblue-800 hover:border-brandorange-500/40 text-slate-300 hover:text-white font-bold text-base rounded-2xl transition-all duration-300"
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i>
            Sign In to My Account
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full mx-auto">
          {stats.map((s, i) => (
            <div key={i} className="bg-darkblue-900/60 border border-darkblue-800/80 rounded-2xl p-4 flex flex-col items-center gap-2 backdrop-blur">
              <i className={`${s.icon} text-brandorange-500 text-xl`}></i>
              <span className="text-2xl font-black text-white">{s.value}</span>
              <span className="text-[11px] text-slate-500 text-center font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brandorange-500 text-xs font-bold uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
              Built for the way you work
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Every tool has been designed to be simple, fast, and useful — even if you have never used business software before.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className={`group relative bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                  <i className={`${f.icon} text-xl`}></i>
                </div>
                <h3 className="text-white font-bold text-base mb-2 leading-snug">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules Showcase ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-darkblue-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brandorange-500 text-xs font-bold uppercase tracking-widest">What's Inside</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
              Every section, explained simply
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Your team gets clear, plain-English screens — no confusing jargon, just what they need to do their job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <div key={i} className="group flex gap-5 bg-darkblue-900/60 border border-darkblue-800/80 rounded-2xl p-6 hover:border-brandorange-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brandorange-500/10 border border-brandorange-500/20 flex items-center justify-center text-brandorange-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <i className={`${m.icon} text-lg`}></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1">{m.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          {/* glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-brandorange-600/20 to-blue-600/10 rounded-3xl blur-2xl" />
          <div className="relative bg-darkblue-900/80 border border-brandorange-500/20 rounded-3xl p-12 text-center backdrop-blur">
            <div className="w-16 h-16 bg-gradient-to-br from-brandorange-500 to-brandorange-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brandorange-500/30">
              <i className="fa-solid fa-boxes-stacked text-white text-2xl"></i>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Ready to take control?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of business owners who have replaced messy spreadsheets with AetherInv — the smarter, faster way to manage stock.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onRegister}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brandorange-600 to-brandorange-500 hover:from-brandorange-500 hover:to-brandorange-400 text-white font-bold text-base rounded-2xl shadow-xl shadow-brandorange-500/30 transition-all duration-300 active:scale-95"
              >
                <i className="fa-solid fa-user-plus"></i>
                Create Your Free Account
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-3 px-8 py-4 border border-darkblue-700 hover:border-brandorange-500/40 text-slate-300 hover:text-white font-bold text-base rounded-2xl transition-all duration-300"
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-darkblue-850 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brandorange-500 to-brandorange-700 flex items-center justify-center">
            <i className="fa-solid fa-boxes-stacked text-white text-xs"></i>
          </div>
          <span className="font-black tracking-widest text-white text-sm">
            AETHER<span className="text-brandorange-500">INV</span>
          </span>
        </div>
        <p className="text-slate-600 text-xs">
          © 2026 AetherInv. Inventory & Business Management System.
        </p>
      </footer>
    </div>
  );
};
