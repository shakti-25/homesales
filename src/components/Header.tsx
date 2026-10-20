import React, { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Navigation,
  BarChart3,
  FileSpreadsheet,
  PlusCircle,
  Lock,
  Compass,
} from 'lucide-react';
import type { User } from '../types/index.ts';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  activeTab: 'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard';
  setActiveTab: (tab: 'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard') => void;
  gpsLocality: string | null;
  onOpenAuthModal: () => void;
  onQuickRoleToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  activeTab,
  setActiveTab,
  gpsLocality,
  onOpenAuthModal,
  onQuickRoleToggle,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & GPS Status */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight whitespace-nowrap">
                    AI Track Live
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Field Ops v2.4
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-medium text-slate-700">GPS:</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {gpsLocality || 'Goregaon East, Mumbai'}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 border-l border-slate-200 pl-4 lg:pl-6">
              <button
                onClick={() => setActiveTab('visits')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'visits'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Visits Record</span>
              </button>

              {/* Renamed to Check-in Form */}
              <button
                onClick={() => setActiveTab('checkin')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'checkin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-500" />
                <span>Check-in Form</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded uppercase tracking-wider">
                  GPS
                </span>
              </button>

              {/* Rep Performance - Admin Only */}
              <button
                onClick={() => setActiveTab('rep-analytics')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'rep-analytics'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isAdmin ? 'Individual Field Rep Analytics' : 'Admin Only: Rep Performance'}
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Rep Performance</span>
                {isAdmin ? (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-700 font-bold px-1 rounded uppercase">
                    Admin
                  </span>
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Productivity Dashboard - Admin Only */}
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isAdmin ? 'Executive Productivity Dashboard' : 'Admin Only Dashboard'}
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Productivity Dashboard</span>
                {isAdmin ? (
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-bold px-1 rounded uppercase">
                    Admin
                  </span>
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </nav>
          </div>

          {/* Right: Quick Role Switcher & Gmail Account Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Role Tester Toggle (Visible on all screen sizes for seamless test verification) */}
            <button
              onClick={onQuickRoleToggle}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                isAdmin
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
              }`}
              title="Click to toggle between Admin and Field Sales Rep view to test permission boundaries"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Role: {isAdmin ? 'Admin' : 'Sales Rep'}</span>
              <span className="sm:hidden">{isAdmin ? 'Admin' : 'Rep'}</span>
              <span className="text-[10px] underline ml-0.5 font-bold">Toggle</span>
            </button>

            {/* Google / Gmail Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 pl-1.5 sm:pl-2 pr-2 sm:pr-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-left"
                aria-expanded={showUserDropdown}
                aria-label="User profile and Gmail account switcher"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
                />
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    {isAdmin && (
                      <span className="text-[10px] bg-slate-900 text-white font-bold px-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {/* Account Switcher Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Current Gmail Account
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{currentUser.name}</div>
                    <div className="text-xs text-slate-600 font-mono">{currentUser.email}</div>
                    <div className="mt-1 text-xs text-indigo-700 font-medium">
                      Role: {isAdmin ? 'Administrator (Full Access)' : 'Sales Rep (View & Form Only)'}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Account
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSelectUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-slate-100/80 font-medium' : ''
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                            <span className="truncate">{u.name}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role === 'admin' ? 'Admin' : 'Rep'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-100 mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal();
                      }}
                      className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md text-left flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Login with another Gmail ID</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Scrollable, touch-friendly, cleanly labeled) */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'visits'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Visits Log</span>
          </button>

          {/* Mobile Check-in Form */}
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'checkin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Check-in Form</span>
          </button>

          {/* Mobile Rep Performance (Admin only) */}
          <button
            onClick={() => setActiveTab('rep-analytics')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'rep-analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rep Performance</span>
            {!isAdmin && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </button>

          {/* Mobile Productivity Dashboard (Admin only) */}
          <button
            onClick={() => setActiveTab('admin-dashboard')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'admin-dashboard'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard</span>
            {!isAdmin && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
