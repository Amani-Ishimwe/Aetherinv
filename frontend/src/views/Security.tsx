import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Lock, 
  Key, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const Security: React.FC = () => {
  const { user, updateUserRole } = useAuth();
  
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'Super Admin');
  
  
  const [is2faSetup, setIs2faSetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [is2faActive, setIs2faActive] = useState(false);

  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  
  
  const [showPasswords, setShowPasswords] = useState(false);

  
  const roles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Inventory Manager',
    'Sales Staff',
    'Warehouse Staff',
    'Accountant',
    'Viewer'
  ];

  
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome on Windows 11 (PC)', location: 'Kigali, Rwanda', active: true, time: 'Current Session' },
    { id: '2', device: 'Safari on iPhone 15 Pro', location: 'Musanze, Rwanda', active: false, time: '2 hours ago' },
    { id: '3', device: 'Firefox on macOS Sonoma', location: 'Gisenyi, Rwanda', active: false, time: '3 days ago' },
  ]);

  
  const securityLogs = [
    { id: 1, action: 'User login initiated', status: 'SUCCESS', ip: '197.243.12.9', date: 'June 04, 2026, 08:15 AM' },
    { id: 2, action: 'Role authorization switch', status: 'SUCCESS', ip: '197.243.12.9', date: 'June 04, 2026, 08:00 AM' },
    { id: 3, action: 'Password reset request', status: 'BLOCKED', ip: '41.210.154.2', date: 'June 03, 2026, 11:22 PM' },
    { id: 4, action: 'Access token refresh', status: 'SUCCESS', ip: '197.243.12.9', date: 'June 03, 2026, 08:30 AM' },
  ];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setSelectedRole(role);
    updateUserRole(role);
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handle2faVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '123456' || verificationCode.length === 6) {
      setIs2faActive(true);
      setIs2faSetup(false);
      setShowBackupCodes(true);
    } else {
      alert('Invalid code! Try 123456');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setResetError('Please fill in all password fields.');
    }
    if (newPassword.length < 6) {
      return setResetError('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setResetError('Confirm password does not match new password.');
    }

    
    setResetSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-200">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white">Security & Permissions</h2>
        <p className="text-slate-400 text-sm mt-1">Manage user session roles, credentials, and two-factor authentication.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-2 space-y-8">
          
          
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Session Role</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define your account level interface permission profile</p>
              </div>
            </div>

            <div className="bg-darkblue-950/40 border border-darkblue-800/60 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select User Role</label>
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full bg-darkblue-900 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2.5 px-4 text-slate-350 outline-none text-sm cursor-pointer appearance-none"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              
              <div className="text-xs text-slate-450 border-t border-darkblue-800/40 pt-3 leading-relaxed">
                <strong className="text-slate-300">Note:</strong> Switching roles will adjust your frontend client access right away:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong className="text-slate-350">Super Admin / Admin</strong>: Full access to all CRUD views and settings.</li>
                  <li><strong className="text-slate-350">Viewer</strong>: Allowed to navigate pages, but all creation/update buttons are disabled.</li>
                  <li><strong className="text-slate-350">Warehouse Staff</strong>: Restricts operations to Warehouses and Inventory sheets only.</li>
                </ul>
              </div>
            </div>
          </div>

          
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">Change your session password credentials</p>
              </div>
            </div>

            {resetError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-3 rounded-xl flex items-center space-x-2">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Password updated successfully! (Frontend Simulation Complete)</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none transition-all text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none transition-all text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none transition-all text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-darkblue-800/40 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs text-slate-450 hover:text-slate-200 flex items-center space-x-1 transition-colors"
                >
                  {showPasswords ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  <span>{showPasswords ? 'Hide' : 'Show'} Password Characters</span>
                </button>

                <button
                  type="submit"
                  className="bg-brandorange-500 hover:bg-brandorange-400 text-white font-semibold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shrink-0"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>

          
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Device Session Manager</h3>
                <p className="text-xs text-slate-400 mt-0.5">Active logged-in devices associated with your account credentials</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {sessions.map(s => (
                <div key={s.id} className="bg-darkblue-950/20 border border-darkblue-850 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2.5 bg-darkblue-800 rounded-xl text-slate-350">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white text-sm truncate">{s.device}</span>
                        {s.active && (
                          <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] text-green-400 font-bold uppercase tracking-wider animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xxs text-slate-500 mt-1 flex items-center space-x-2">
                        <span>{s.location}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>{s.time}</span>
                      </p>
                    </div>
                  </div>
                  {!s.active && (
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="px-3 py-1 bg-red-650/10 border border-red-650/20 hover:border-red-500 text-red-400 hover:text-red-300 text-xxs font-bold uppercase rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        
        <div className="space-y-8">
          
          
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
            <div className="flex items-center space-x-3 mb-5 shrink-0">
              <div className="p-2.5 bg-brandorange-500/10 border border-brandorange-500/20 rounded-xl text-brandorange-500">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Two-Factor Auth</h3>
                <p className="text-xs text-slate-400 mt-0.5">Secure your assets (2FA)</p>
              </div>
            </div>

            {is2faActive ? (
              <div className="flex-1 flex flex-col justify-center space-y-4 bg-darkblue-950/20 rounded-xl p-4 border border-green-500/15">
                <div className="flex items-center space-x-2 text-green-400 text-xs font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 animate-bounce" />
                  <span>2FA Security Enabled</span>
                </div>
                <p className="text-xxs text-slate-400 leading-relaxed">
                  Your identity is secured. Code verification will be prompted on next login attempt.
                </p>

                {showBackupCodes && (
                  <div className="bg-darkblue-950 border border-darkblue-800 p-3 rounded-lg text-xxs">
                    <p className="font-bold text-brandorange-500 mb-1.5 uppercase tracking-wider">Backup Recovery Codes</p>
                    <div className="grid grid-cols-2 gap-1 text-slate-350 font-mono">
                      <span>AETH-9081</span>
                      <span>AETH-3129</span>
                      <span>AETH-4560</span>
                      <span>AETH-1192</span>
                    </div>
                    <button 
                      onClick={() => setShowBackupCodes(false)}
                      className="text-xxs text-slate-500 hover:text-slate-350 underline mt-2 block"
                    >
                      Hide backup recovery keys
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIs2faActive(false)}
                  className="w-full text-center py-2 bg-red-650/10 border border-red-650/20 hover:border-red-500 text-red-400 text-xxs font-bold uppercase rounded-xl transition-colors"
                >
                  Disable Two-Factor Auth
                </button>
              </div>
            ) : is2faSetup ? (
              <form onSubmit={handle2faVerify} className="space-y-4 bg-darkblue-950/30 border border-darkblue-800/80 rounded-xl p-4 flex-1">
                <div className="flex items-center justify-center p-3 bg-white rounded-lg w-28 h-28 mx-auto">
                  
                  <div className="w-24 h-24 bg-darkblue-950 grid grid-cols-6 gap-0.5 p-1 rounded">
                    {[...Array(36)].map((_, i) => (
                      <span key={i} className={`h-full w-full rounded-[1px] ${
                        i % 3 === 0 || i % 4 === 0 || i < 6 || i > 30 ? 'bg-white' : 'bg-transparent'
                      }`} />
                    ))}
                  </div>
                </div>
                <p className="text-xxs text-slate-450 text-center leading-relaxed">
                  Scan code with Google Authenticator or Microsoft Authenticator app and enter verification key.
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit key (e.g. 123456)"
                    className="w-full text-center bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 rounded-xl py-2 px-3 text-slate-200 outline-none text-xs"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIs2faSetup(false)}
                      className="w-1/2 text-center py-2 border border-darkblue-800 text-slate-400 text-xxs font-bold uppercase rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 text-center py-2 bg-brandorange-500 text-white text-xxs font-bold uppercase rounded-xl"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col justify-center space-y-3 bg-darkblue-950/15 rounded-xl p-4 border border-dashed border-darkblue-800/60">
                <Key className="h-8 w-8 text-slate-650 mx-auto" />
                <p className="text-xxs text-slate-400 text-center leading-relaxed">
                  Two-factor authentication adds an extra layer of system protection to prevent unauthorized warehouse adjustments.
                </p>
                <button
                  onClick={() => setIs2faSetup(true)}
                  className="w-full bg-brandorange-500 hover:bg-brandorange-400 text-white py-2 text-xxs font-bold uppercase rounded-xl transition-all"
                >
                  Configure 2FA Token
                </button>
              </div>
            )}
          </div>

          
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
            <div className="mb-4 shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-brandorange-500" />
                <span>Security Events Audit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time log of security access records</p>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 text-[11px]">
              {securityLogs.map(log => (
                <div key={log.id} className="bg-darkblue-950/30 border border-darkblue-850/60 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[9px] mt-1">
                    <span>IP: {log.ip}</span>
                    <span>{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
