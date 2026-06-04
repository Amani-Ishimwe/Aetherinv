import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import type { ActiveView } from './components/Layout';
import { LandingPage } from './views/LandingPage';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { Dashboard } from './views/Dashboard';
import { Products } from './views/Products';
import { Inventory } from './views/Inventory';
import { Warehouses } from './views/Warehouses';
import { Assets } from './views/Assets';
import { Suppliers } from './views/Suppliers';
import { Purchases } from './views/Purchases';
import { Sales } from './views/Sales';
import { Customers } from './views/Customers';
import { Scanner } from './views/Scanner';
import { Auditing } from './views/Auditing';
import { Reports } from './views/Reports';
import { Security } from './views/Security';
import './App.css';

type AuthScreen = 'landing' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-darkblue-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-16 h-16 bg-gradient-to-br from-brandorange-500 to-brandorange-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-brandorange-500/40 mb-6 animate-pulse">
          <i className="fa-solid fa-boxes-stacked text-white text-2xl"></i>
        </div>
        <p className="text-sm font-semibold tracking-widest uppercase text-slate-400">Loading System...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return (
        <Register
          onToggleView={() => setAuthScreen('login')}
          onBackToLanding={() => setAuthScreen('landing')}
        />
      );
    }
    if (authScreen === 'login') {
      return (
        <Login
          onToggleView={() => setAuthScreen('register')}
          onBackToLanding={() => setAuthScreen('landing')}
        />
      );
    }
    // Default: landing
    return (
      <LandingPage
        onLogin={() => setAuthScreen('login')}
        onRegister={() => setAuthScreen('register')}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':   return <Dashboard />;
      case 'products':    return <Products />;
      case 'inventory':   return <Inventory />;
      case 'warehouses':  return <Warehouses />;
      case 'assets':      return <Assets />;
      case 'suppliers':   return <Suppliers />;
      case 'purchases':   return <Purchases />;
      case 'sales':       return <Sales />;
      case 'customers':   return <Customers />;
      case 'scanner':     return <Scanner />;
      case 'auditing':    return <Auditing />;
      case 'reports':     return <Reports />;
      case 'security':    return <Security />;
      default:            return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
