import React, { useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Trophy,
  Users,
  Target,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Compass,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';
import type { VisitRecord, User as UserType } from '../types/index.ts';
import { calculateTeamProductivityMetrics, formatCurrencyINR } from '../utils/analytics.ts';
import { exportVisitsToExcel } from '../utils/exportExcel.ts';

interface AdminDashboardProps {
  currentUser: UserType;
  visits: VisitRecord[];
  users: UserType[];
  onOpenAdminPinModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  visits,
  users,
  onOpenAdminPinModal,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const metrics = useMemo(() => {
    return calculateTeamProductivityMetrics(visits, users);
  }, [visits, users]);

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
          Executive Productivity Dashboard Restricted
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
          Access to organization-wide sales revenue summaries, GPS compliance audits, and rep leaderboards requires verified administrator credentials.
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

  // Admin View
  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Executive Field Ops
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-300">Live Telemetry Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">Field Sales Productivity Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time GPS visit compliance, territory density in Mumbai hubs, and rep conversion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportVisitsToExcel(visits, 'Executive_Productivity_Report')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Executive Excel</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Field Visits
            </span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{metrics.totalVisits}</div>
          <div className="text-[10px] sm:text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{metrics.gpsComplianceRate}% GPS Verified</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Closed Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-3xl font-bold text-slate-900 mt-2 truncate">
            {formatCurrencyINR(metrics.totalWonValue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">From verified field contracts</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Conversion Rate
            </span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {metrics.averageConversionRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Average across field team</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Reps
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{metrics.activeRepsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Across 8 Mumbai territory hubs</div>
        </div>
      </div>

      {/* Daily Visit Trend Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Field Activity Velocity (Daily Trend)</h3>
            <p className="text-xs text-slate-500">Daily breakdown of total client check-ins vs signed deals</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-slate-900" />
              Total Check-ins
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              Deals Won
            </span>
          </div>
        </div>

        <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
          {metrics.dailyTrend.map((d) => {
            const maxVisits = Math.max(...metrics.dailyTrend.map((t) => t.visits), 5);
            const heightPercent = Math.max(15, Math.round((d.visits / maxVisits) * 100));
            const wonPercent = d.visits > 0 ? Math.round((d.wonDeals / d.visits) * 100) : 0;

            return (
              <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="text-[11px] font-mono font-semibold text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.visits} ({d.wonDeals} won)
                </div>
                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: `${heightPercent}%` }}>
                  <div
                    className="w-full bg-emerald-500 transition-all duration-300"
                    style={{ height: `${wonPercent}%` }}
                    title={`Deals won: ${d.wonDeals}`}
                  />
                  <div
                    className="w-full bg-slate-900 transition-all duration-300"
                    style={{ height: `${100 - wonPercent}%` }}
                    title={`Check-ins: ${d.visits}`}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-2">{d.displayDate}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Rep Productivity Leaderboard + Locality Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Rep Productivity Leaderboard */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Sales Representative Productivity Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Ranked by Closed Revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-2 px-3">Rep Name</th>
                  <th className="py-2 px-3 text-center">Visits</th>
                  <th className="py-2 px-3 text-center">Win Rate</th>
                  <th className="py-2 px-3 text-right">Revenue Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.topPerformers.map((p, index) => (
                  <tr key={p.repEmail} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span>{p.repName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-7">{p.repEmail}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {p.visits}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {p.conversionRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrencyINR(p.wonValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Locality Territory Density Heatmap */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Locality Territory Density &amp; Revenue</span>
            </h3>
            <span className="text-xs text-slate-400">Mumbai Metropolitan Area</span>
          </div>

          <div className="space-y-3">
            {metrics.localityDistribution.map((loc) => {
              const visitPct = Math.round((loc.count / metrics.totalVisits) * 100);
              const isGoregaon = loc.locality.toLowerCase().includes('goregaon');

              return (
                <div
                  key={loc.locality}
                  className={`p-3 rounded-lg border transition-all ${
                    isGoregaon
                      ? 'bg-indigo-50/50 border-indigo-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{loc.locality}</span>
                      {isGoregaon && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 rounded">
                          High Activity Hub
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{loc.count} visits</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {formatCurrencyINR(loc.wonValue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isGoregaon ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                      style={{ width: `${visitPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
