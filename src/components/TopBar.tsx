import React from 'react';
import { Menu, Navigation, ShieldCheck, KeyRound, MapPin } from 'lucide-react';
import type { User } from '../types/index.ts';

interface TopBarProps {
  currentUser: User;
  activeTab: 'visits' | 'checkin' | 'rep-analytics' | 'admin-dashboard';
  gpsLocality: string | null;
  onOpenMobileMenu: () => void;
  onOpenAdminPinModal: () => void;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  activeTab,
  gpsLocality,
  onOpenMobileMenu,
  onOpenAdminPinModal,
  onOpenAuthModal,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const viewTitles = {
    visits: { title: 'Visits Record Log', sub: 'Verified field sales audit trail & client meetings' },
    checkin: { title: 'Field Check-in Form', sub: 'Mandatory GPS stamp and meeting outcome capture' },
    'rep-analytics': { title: 'Individual Field Rep Analytics', sub: 'Quota targets, revenue closed & win conversion rates' },
    'admin-dashboard': { title: 'Executive Productivity Dashboard', sub: 'Real-time GPS compliance, leaderboards & territory density' },
  };

  const currentView = viewTitles[activeTab];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Mobile Left: Hamburger Button & Brand */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
              <Navigation className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight">AI Track Live</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[120px]">{gpsLocality || 'Goregaon East'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Left: View Title & Subtitle */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentView.title}
            </h1>
            {activeTab === 'rep-analytics' || activeTab === 'admin-dashboard' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Admin Exclusive
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">{currentView.sub}</p>
        </div>

        {/* Right Section: Admin Verification Status & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Admin Verified</span>
            </span>
          ) : (
            <button
              onClick={onOpenAdminPinModal}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              title="Enter 6-digit PIN to verify as Administrator"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Verify as Admin</span>
            </button>
          )}

          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-left"
            title="Google Account"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
            />
            <span className="hidden lg:inline text-xs font-semibold text-slate-800 truncate max-w-[120px]">
              {currentUser.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
