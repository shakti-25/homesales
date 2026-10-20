import React, { useState } from 'react';
import { X, Mail, User as UserIcon, KeyRound, ShieldCheck } from 'lucide-react';
import type { User, UserRole } from '../types/index.ts';
import { verifyAdminPin } from '../utils/auth.ts';

interface GoogleAuthModalProps {
  currentUser: User;
  onLogin: (user: User) => void;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  currentUser,
  onLogin,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountRole, setAccountRole] = useState<UserRole>('sales_rep');
  const [adminPin, setAdminPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdminRoleSelected =
    accountRole === 'admin' || email.trim().toLowerCase() === 'thevarshakti02@gmail.com';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address.');
      return;
    }

    const needsAdmin = accountRole === 'admin' || emailTrim === 'thevarshakti02@gmail.com';

    if (needsAdmin) {
      if (!adminPin.trim()) {
        setErrorMessage('6-Digit Security PIN is required to verify as Administrator.');
        return;
      }
      if (!verifyAdminPin(adminPin)) {
        setErrorMessage('Invalid 6-digit PIN. Please enter the correct PIN (250205) to verify as Administrator.');
        return;
      }
    }

    const role: UserRole = needsAdmin ? 'admin' : 'sales_rep';
    const name = displayName.trim() || emailTrim.split('@')[0].replace('.', ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formattedName,
      email: emailTrim,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
      department: role === 'admin' ? 'Field Operations & Strategy' : 'Field Sales Representative',
    };

    onLogin(newUser);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gmail Sign In</h3>
              <p className="text-xs text-slate-300">AI Track Live Enterprise Portal</p>
            </div>
          </div>
        </div>

        {/* Current User Session Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Currently signed in:</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
            {currentUser.email}
          </span>
        </div>

        {/* Form Body - Exactly matching image_646762e0.png */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gmail Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Varun Gupta"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Role
            </label>
            <select
              value={accountRole}
              onChange={(e) => setAccountRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white text-slate-800"
            >
              <option value="sales_rep">Field Sales Representative (View &amp; Check-In)</option>
              <option value="admin">Administrator (Requires 6-Digit PIN)</option>
            </select>
          </div>

          {/* 6-Digit PIN Input when Administrator is selected */}
          {isAdminRoleSelected && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Verification PIN (6 Digits)</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter 6-digit PIN"
                className="w-full px-3 py-2 text-sm font-mono tracking-widest bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
              <p className="text-[11px] text-amber-800">
                Enter PIN <strong>250205</strong> to verify administrator privileges.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sign In with Gmail</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
