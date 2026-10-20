import React from 'react';
import {
  Navigation,
  FileSpreadsheet,
  PlusCircle,
  Compass,
  BarChart3,
  Lock,
  ShieldCheck,
  User as UserIcon,
  X,
  MapPin,
  KeyRound,
  LogOut,
} from 'lucide-react';
import type { User } from '../types/index.ts';

interface SidebarProps {
  currentUser: User;
  activeTab: 'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard';
  setActiveTab: (tab: 'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard') => void;
  gpsLocality: string | null;
  visitsCount: number;
  onOpenAuthModal: () => void;
  onOpenAdminPinModal: () => void;
  onLockAdmin: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  gpsLocality,
  visitsCount,
  onOpenAuthModal,
  onOpenAdminPinModal,
  onLockAdmin,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const isAdmin = currentUser.role === 'admin';

  function handleTabClick(tab: 'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard') {
    if ((tab === 'rep-analytics' || tab === 'admin-dashboard') && !isAdmin) {
      onOpenAdminPinModal();
      return;
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 select-none">
      {/* Top Section: Brand & Telemetry */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Navigation className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base tracking-tight">AI Track Live</div>
              <div className="text-[11px] text-slate-500">Field Operations &amp; GPS</div>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS Telemetry Status */}
        <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              GPS Geolocation
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
              ACTIVE
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 truncate">
            {gpsLocality || 'Goregaon East, Mumbai'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
            <span>Coordinates stamped on visits</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Navigation Menu Items */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Operations */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Field Operations
          </div>
          <nav className="space-y-1">
            {/* Visits Record */}
            <button
              onClick={() => handleTabClick('visits')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'visits'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet
                  className={`w-4 h-4 ${activeTab === 'visits' ? 'text-indigo-300' : 'text-slate-500'}`}
                />
                <span>Visits Record</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'visits'
                    ? 'bg-slate-800 text-indigo-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {visitsCount}
              </span>
            </button>

            {/* Check-in Form */}
            <button
              onClick={() => handleTabClick('checkin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'checkin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle
                  className={`w-4 h-4 ${activeTab === 'checkin' ? 'text-emerald-400' : 'text-emerald-600'}`}
                />
                <span>Check-in Form</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                GPS
              </span>
            </button>
          </nav>
        </div>

        {/* Analytics (Admin Restricted) */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Executive Analytics
            </span>
            {!isAdmin && (
              <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                Admin PIN
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {/* Rep Performance */}
            <button
              onClick={() => handleTabClick('rep-analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'rep-analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass
                  className={`w-4 h-4 ${activeTab === 'rep-analytics' ? 'text-indigo-400' : 'text-slate-500'}`}
                />
                <span>Rep Performance</span>
              </div>
              {isAdmin ? (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-700 font-bold px-1.5 rounded uppercase">
                  Admin
                </span>
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Productivity Dashboard */}
            <button
              onClick={() => handleTabClick('admin-dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'admin-dashboard'
                  ? 'bg-indigo-950 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3
                  className={`w-4 h-4 ${activeTab === 'admin-dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}
                />
                <span>Productivity Dashboard</span>
              </div>
              {isAdmin ? (
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-bold px-1.5 rounded uppercase">
                  Admin
                </span>
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section: User Profile & Admin Verification */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="truncate">{currentUser.name}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAdmin ? 'Admin' : 'Rep'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate font-mono">
              {currentUser.email}
            </div>
          </div>
        </div>

        {/* Action: Verify as Admin or Lock Admin */}
        {isAdmin ? (
          <button
            onClick={onLockAdmin}
            className="w-full py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            title="Lock administrative permissions"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Lock Admin Mode</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminPinModal}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            title="Enter 6-digit security PIN to unlock admin privileges"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Verify as Admin (Enter PIN)</span>
          </button>
        )}

        {/* Sign In / Switch Account with Gmail */}
        <button
          onClick={onOpenAuthModal}
          className="w-full py-1.5 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Sign In with Gmail</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar: Fixed at full height */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-out menu when mobileMenuOpen is true) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
