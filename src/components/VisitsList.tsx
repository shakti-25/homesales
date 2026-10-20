import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  Download,
  Filter,
  MapPin,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit3,
  Lock,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import type { VisitRecord, User } from '../types/index.ts';
import { filterVisits, formatCurrencyINR } from '../utils/analytics.ts';
import { exportVisitsToExcel, exportVisitsToCsv } from '../utils/exportExcel.ts';

interface VisitsListProps {
  visits: VisitRecord[];
  currentUser: User;
  onEditVisit: (visit: VisitRecord) => void;
  onNewVisitClick: () => void;
  onOpenAdminPinModal: (pendingVisit?: VisitRecord) => void;
}

export const VisitsList: React.FC<VisitsListProps> = ({
  visits,
  currentUser,
  onEditVisit,
  onNewVisitClick,
  onOpenAdminPinModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedOutcome, setSelectedOutcome] = useState('all');
  const [selectedRep, setSelectedRep] = useState('all');

  const isAdmin = currentUser.role === 'admin';

  // Extract unique localities & reps for filter options
  const uniqueLocalities = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => {
      const loc = v.locality.split(',')[0].trim();
      set.add(loc);
    });
    return Array.from(set).sort();
  }, [visits]);

  const uniqueReps = useMemo(() => {
    const map = new Map<string, string>();
    visits.forEach((v) => {
      map.set(v.salesPersonId || v.salesPersonEmail, v.salesPersonName);
    });
    return Array.from(map.entries());
  }, [visits]);

  // Apply filters and search
  const filteredVisits = useMemo(() => {
    return filterVisits(visits, searchTerm, {
      locality: selectedLocality,
      outcome: selectedOutcome,
      repId: selectedRep,
    });
  }, [visits, searchTerm, selectedLocality, selectedOutcome, selectedRep]);

  function handleEditClick(visit: VisitRecord) {
    if (isAdmin) {
      onEditVisit(visit);
    } else {
      onOpenAdminPinModal(visit);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Salesperson name, Client name, or Serial No (e.g. VN-2026-0001)..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons: Excel Export & Check-in Form */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              onClick={() => exportVisitsToExcel(filteredVisits)}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              title="Download Excel spreadsheet with full telemetry and rep metrics"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportVisitsToCsv(filteredVisits)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
              title="Download CSV file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            <button
              onClick={onNewVisitClick}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check-in Form</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          {/* Locality Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium shrink-0">Locality:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Localities ({uniqueLocalities.length})</option>
              {uniqueLocalities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium shrink-0">Outcome:</span>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Outcomes</option>
              <option value="Deal Won">Deal Won</option>
              <option value="Hot Lead / Proposal Sent">Hot Lead / Proposal Sent</option>
              <option value="Follow-up Scheduled">Follow-up Scheduled</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Deal Lost">Deal Lost</option>
            </select>
          </div>

          {/* Sales Rep Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium shrink-0">Representative:</span>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Representatives</option>
              {uniqueReps.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Showing <strong className="text-slate-900">{filteredVisits.length}</strong> of{' '}
          {visits.length} verified field visits
          {selectedLocality !== 'all' && (
            <span>
              {' '}in <strong className="text-indigo-600">{selectedLocality}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            100% GPS Verified
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            Edit Mode: <strong className={isAdmin ? 'text-emerald-700' : 'text-slate-500'}>
              {isAdmin ? 'Admin (Unlocked)' : 'View-Only (Admin Restricted)'}
            </strong>
          </span>
        </div>
      </div>

      {/* Mobile Card View (Visible on screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            <p className="font-semibold text-slate-800 text-sm">No matching visits found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search term.</p>
          </div>
        ) : (
          filteredVisits.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              {/* Card Header: Serial & Timestamp & Status */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{v.serialNo}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    GPS Verified ({v.latitude.toFixed(4)}°, {v.longitude.toFixed(4)}°)
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      v.adminStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.adminStatus === 'Verified'
                        ? 'bg-blue-100 text-blue-800'
                        : v.adminStatus === 'Flagged'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {v.adminStatus}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(v.timestamp).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date(v.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>

              {/* Client & Locality */}
              <div>
                <div className="font-bold text-slate-900 text-sm">{v.clientName}</div>
                <div className="text-xs text-slate-500">{v.contactPerson}</div>
                <div className="flex items-center gap-1 text-xs text-slate-700 font-medium mt-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{v.locality}</span>
                </div>
              </div>

              {/* Rep & Outcome */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Sales Rep
                  </span>
                  <span className="font-semibold text-slate-800">{v.salesPersonName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Outcome
                  </span>
                  <span
                    className={`font-semibold ${
                      v.outcome === 'Deal Won'
                        ? 'text-emerald-700'
                        : v.outcome === 'Hot Lead / Proposal Sent'
                        ? 'text-indigo-700'
                        : v.outcome === 'Deal Lost'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {v.outcome}
                  </span>
                </div>
              </div>

              {/* Deal Value & Edit Button */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Deal Value</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {v.dealValue ? formatCurrencyINR(v.dealValue) : 'Rs. 0'}
                  </span>
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => handleEditClick(v)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Record</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditClick(v)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Admin Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Visits Table (Visible on screens >= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Serial No</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Client / Account</th>
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4">Locality &amp; Telemetry</th>
                <th className="py-3 px-4">Purpose &amp; Outcome</th>
                <th className="py-3 px-4 text-right">Deal Value</th>
                <th className="py-3 px-4 text-center">Admin Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-slate-800 text-sm">No matching visits found</p>
                      <p className="text-xs text-slate-500">
                        Try clearing filters or search term to see all recorded client visits.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedLocality('all');
                          setSelectedOutcome('all');
                          setSelectedRep('all');
                        }}
                        className="px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md font-medium"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Serial ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{v.serialNo}</div>
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Verified GPS
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {new Date(v.timestamp).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(v.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </div>
                    </td>

                    {/* Client & Contact */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">{v.clientName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {v.contactPerson}
                      </div>
                    </td>

                    {/* Salesperson */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{v.salesPersonName}</div>
                      <div className="text-[11px] text-slate-400">{v.salesPersonEmail}</div>
                    </td>

                    {/* Locality & Coordinates */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{v.locality}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {v.latitude.toFixed(4)}°N, {v.longitude.toFixed(4)}°E (±{Math.round(v.accuracyMeters)}m)
                      </div>
                      {v.subLocality && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {v.subLocality}
                        </div>
                      )}
                    </td>

                    {/* Purpose & Outcome */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{v.purpose}</div>
                      <div
                        className={`text-[11px] font-semibold mt-0.5 inline-block ${
                          v.outcome === 'Deal Won'
                            ? 'text-emerald-700'
                            : v.outcome === 'Hot Lead / Proposal Sent'
                            ? 'text-indigo-700'
                            : v.outcome === 'Follow-up Scheduled'
                            ? 'text-amber-700'
                            : v.outcome === 'Deal Lost'
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {v.outcome}
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {v.dealValue ? formatCurrencyINR(v.dealValue) : 'Rs. 0'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {v.meetingDurationMinutes || 30} mins
                      </div>
                    </td>

                    {/* Admin Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          v.adminStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.adminStatus === 'Verified'
                            ? 'bg-blue-100 text-blue-800'
                            : v.adminStatus === 'Flagged'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.adminStatus}
                      </span>
                    </td>

                    {/* Actions: Edit button with RBAC enforcement */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAdmin ? (
                        <button
                          onClick={() => handleEditClick(v)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                          title="Edit this visit record (Admin privilege)"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-700" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick(v)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-md hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition-colors inline-flex items-center gap-1"
                          title="Edit restricted: Admin role required"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Admin Edit</span>
                        </button>
                      )}
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
