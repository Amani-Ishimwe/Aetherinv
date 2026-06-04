import React, { useState } from 'react';
import { X, Bell, Mail, MessageSquare, AlertCircle, ShoppingCart, TrendingUp } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockCount: number;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, lowStockCount }) => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  if (!isOpen) return null;

  const mockAlerts = [
    {
      id: '1',
      type: 'stock',
      title: 'Low Stock Level Warnings',
      message: `${lowStockCount} inventory items have fallen below threshold.`,
      time: 'Just now',
      urgent: true,
    },
    {
      id: '2',
      type: 'purchase',
      title: 'New Purchase Order PO-901',
      message: 'Pending approval from Procurement Office.',
      time: '15 mins ago',
      urgent: false,
    },
    {
      id: '3',
      type: 'transfer',
      title: 'Transfer Request Approved',
      message: '50 laptops moved: Kigali Warehouse → Musanze.',
      time: '2 hours ago',
      urgent: false,
    },
    {
      id: '4',
      type: 'sales',
      title: 'SaaS Invoice Raised #INV-104',
      message: 'Payment received from Customer: John Doe.',
      time: '5 hours ago',
      urgent: false,
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-slate-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-darkblue-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-darkblue-900 border-l border-darkblue-800 shadow-2xl flex flex-col h-full transform transition-all duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-darkblue-800 flex items-center justify-between shrink-0 bg-darkblue-950/30">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-brandorange-500" />
              <h2 className="text-lg font-bold text-white">Alert Notifications</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkblue-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Delivery Channels Toggle */}
            <div className="bg-darkblue-950/50 border border-darkblue-800/80 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alert Delivery Channels</h3>
              
              <div className="space-y-3 text-sm">
                {/* Email Channel */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-brandorange-500" />
                    <span>Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailEnabled} 
                      onChange={() => setEmailEnabled(!emailEnabled)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-darkblue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandorange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {/* SMS Channel */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <span>SMS / Text Alerts</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsEnabled} 
                      onChange={() => setSmsEnabled(!smsEnabled)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-darkblue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandorange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {/* In-app Channel */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-purple-400" />
                    <span>In-App Popups</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={inAppEnabled} 
                      onChange={() => setInAppEnabled(!inAppEnabled)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-darkblue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandorange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Feeds */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity & Warning Feeds</h3>
              
              <div className="space-y-3">
                {mockAlerts.map((alert) => {
                  let icon = <Bell className="h-4 w-4" />;
                  let iconBg = 'bg-blue-500/10 text-blue-400';
                  
                  if (alert.type === 'stock') {
                    icon = <AlertCircle className="h-4 w-4" />;
                    iconBg = 'bg-brandorange-500/10 text-brandorange-500';
                  } else if (alert.type === 'purchase') {
                    icon = <ShoppingCart className="h-4 w-4" />;
                    iconBg = 'bg-green-500/10 text-green-400';
                  } else if (alert.type === 'sales') {
                    icon = <TrendingUp className="h-4 w-4" />;
                    iconBg = 'bg-purple-500/10 text-purple-400';
                  }

                  return (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-xl border flex items-start space-x-3 transition-colors ${
                        alert.urgent 
                          ? 'bg-brandorange-500/5 border-brandorange-500/20 hover:border-brandorange-500/30' 
                          : 'bg-darkblue-950/20 border-darkblue-850 hover:border-darkblue-800'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs sm:text-sm truncate">{alert.title}</h4>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-1">{alert.time}</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-darkblue-950 px-6 py-4 border-t border-darkblue-800 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="w-full bg-darkblue-900 hover:bg-darkblue-850 text-slate-300 font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider border border-darkblue-850 transition-colors"
            >
              Dismiss All Notifications
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
