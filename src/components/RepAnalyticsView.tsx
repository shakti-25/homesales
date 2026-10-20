import React, { useState, useMemo } from 'react';
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  MapPin,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  DollarSign,
  ChevronRight,
  Search,
  Lock,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import type { VisitRecord, User as UserType } from '../types/index.ts';
import { calculateSalesRepMetrics, formatCurrencyINR } from '../utils/analytics.ts';
import { exportVisitsToExcel } from '../utils/exportExcel.ts';

interface RepAnalyticsViewProps {
  visits: VisitRecord[];
  users: UserType[];
  currentUser: UserType;
  onOpenAdminPinModal: () => void;
}

export const RepAnalyticsView: React.FC<RepAnalyticsViewProps> = ({
  visits,
  users,
  currentUser,
  onOpenAdminPinModal,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // If user is not admin, show secure access-restriction shield
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-8 sm:my-12 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-800 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>
        <div className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
          Administrator Privilege Required
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Individual Field Rep Analytics Restricted
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
          Access to individual sales rep performance metrics, quota tracking, and meeting analytics is restricted to authorized administrators.
        </p>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left mb-6 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Signed In As:</span>
            <strong className="text-slate-800">{currentUser.email}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Role:</span>
            <span className="font-semibold text-slate-700">Field Sales Representative</span>
          </div>
        </div>

        <button
          onClick={onOpenAdminPinModal}
          className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2 mx-auto"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verify as Administrator (Enter 6-Digit PIN)</span>
        </button>
      </div>
    );
  }

  // Admin View: User Search & Dropdown State
  const [repSearchQuery, setRepSearchQuery] = useState('');
  const [selectedRepId, setSelectedRepId] = useState<string>(users[1]?.id || users[0].id);
  const [repVisitsSearch, setRepVisitsSearch] = useState('');

  // Filter available reps by search query
  const filteredUsers = useMemo(() => {
    if (!repSearchQuery.trim()) return users;
    const q = repSearchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }, [users, repSearchQuery]);

  // Selected user resolution
  const selectedUser = users.find((u) => u.id === selectedRepId) || filteredUsers[0] || users[0];

  // Calculate metrics for selected rep
  const metrics = useMemo(() => {
    return calculateSalesRepMetrics(visits, selectedUser.id || selectedUser.email, 25);
  }, [visits, selectedUser]);

  // Visits filtered for this rep
  const repVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchRep =
        v.salesPersonId === selectedUser.id || v.salesPersonEmail === selectedUser.email;
      if (!matchRep) return false;
      if (!repVisitsSearch.trim()) return true;
      const q = repVisitsSearch.toLowerCase();
      return (
        v.serialNo.toLowerCase().includes(q) ||
        v.clientName.toLowerCase().includes(q) ||
        v.locality.toLowerCase().includes(q)
      );
    });
  }, [visits, selectedUser, repVisitsSearch]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Controls: Search and Dropdown Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Admin Privilege
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Representative Telemetry</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Individual Field Rep Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Use search and dropdown below to inspect performance, visit compliance, and revenue by rep.
            </p>
          </div>
          <button
            onClick={() =>
              exportVisitsToExcel(repVisits, `${selectedUser.name.replace(/\s+/g, '_')}_Field_Report`)
            }
            className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Rep Report (.xlsx)</span>
          </button>
        </div>

        {/* Search & Dropdown Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          {/* Search Rep by Name or Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search Sales Representative</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={repSearchQuery}
                onChange={(e) => setRepSearchQuery(e.target.value)}
                placeholder="Type name (e.g. Rahul, Priya) or email..."
                className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
              {repSearchQuery && (
                <button
                  onClick={() => setRepSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Dropdown Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Rep Dropdown</span>
            </label>
            <select
              value={selectedRepId}
              onChange={(e) => setSelectedRepId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-medium text-slate-900"
            >
              {filteredUsers.map((u) => {
                const count = visits.filter(
                  (v) => v.salesPersonId === u.id || v.salesPersonEmail === u.email
                ).length;
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'admin' ? 'Admin' : 'Rep'} · {count} visits) - {u.email}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick-Select Rep Badges / Chips */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium py-1">Quick Select:</span>
          {filteredUsers.map((u) => {
            const isSelected = u.id === selectedUser.id;
            const count = visits.filter(
              (v) => v.salesPersonId === u.id || v.salesPersonEmail === u.email
            ).length;

            return (
              <button
                key={u.id}
                onClick={() => setSelectedRepId(u.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <img
                  src={u.avatarUrl}
                  alt={u.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span>{u.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Rep Profile & Target Completion Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={selectedUser.avatarUrl}
              alt={selectedUser.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-indigo-600/30 shadow-xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedUser.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedUser.role === 'admin' ? 'Field Director (Admin)' : 'Field Sales Rep'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedUser.email}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
                <span>{selectedUser.department}</span>
                <span className="text-slate-300">·</span>
                <span>{selectedUser.phone}</span>
              </div>
            </div>
          </div>

          {/* Monthly Target Bar */}
          <div className="w-full lg:w-80 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                Monthly Visit Target
              </span>
              <span className="font-bold text-slate-900">
                {metrics.totalVisits} / {metrics.targetVisits} visits ({metrics.targetProgressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.targetProgressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
              <span>Pace: {metrics.targetProgressPercent >= 60 ? 'On track' : 'In progress'}</span>
              <span>Target: 25 check-ins</span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards (Responsive 2x2 on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Total Client Visits
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {metrics.totalVisits}
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-700 font-medium mt-1">
              100% GPS Verified
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Closed Revenue
            </span>
            <div className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrencyINR(metrics.totalWonValue)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
              {metrics.dealsWonCount} deals won
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Conversion Win Rate
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
              {metrics.conversionRatePercent}%
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">Pitch to signed deal</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Top Field Locality
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 truncate mt-1">
              {metrics.topLocality}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">Avg: {metrics.avgDurationMinutes}m</div>
          </div>
        </div>
      </div>

      {/* Locality & Outcome Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Territory Coverage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Territory &amp; Locality Distribution</span>
          </h4>
          <div className="space-y-2.5">
            {Object.keys(metrics.localityCounts).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No visits recorded yet.</p>
            ) : (
              Object.entries(metrics.localityCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([loc, count]) => {
                  const pct = Math.round((count / metrics.totalVisits) * 100);
                  return (
                    <div key={loc} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate">{loc}</span>
                        <span className="text-slate-500 font-mono shrink-0 ml-2">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-800 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Meeting Outcomes */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Meeting Outcomes Breakdown</span>
          </h4>
          <div className="space-y-2.5">
            {Object.keys(metrics.outcomeDistribution).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No outcome data yet.</p>
            ) : (
              Object.entries(metrics.outcomeDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([outcome, count]) => {
                  const pct = Math.round((count / metrics.totalVisits) * 100);
                  return (
                    <div key={outcome} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate">{outcome}</span>
                        <span className="text-slate-500 font-mono shrink-0 ml-2">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            outcome === 'Deal Won'
                              ? 'bg-emerald-500'
                              : outcome === 'Hot Lead / Proposal Sent'
                              ? 'bg-indigo-500'
                              : outcome === 'Deal Lost'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Visits Conducted by this Rep */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
            Visits Conducted by {selectedUser.name} ({repVisits.length})
          </h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={repVisitsSearch}
              onChange={(e) => setRepVisitsSearch(e.target.value)}
              placeholder="Filter serial no, client..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Responsive Mobile Cards & Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Serial ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Locality</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3 text-right">Value (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No matching visits found for {selectedUser.name}
                  </td>
                </tr>
              ) : (
                repVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {v.serialNo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(v.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {v.clientName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{v.locality}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{v.purpose}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          v.outcome === 'Deal Won'
                            ? 'text-emerald-700'
                            : v.outcome === 'Deal Lost'
                            ? 'text-rose-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {v.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                      {v.dealValue ? formatCurrencyINR(v.dealValue) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
