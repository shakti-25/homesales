import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  User,
  Phone,
  Briefcase,
} from 'lucide-react';
import type { VisitRecord, VisitPurpose, VisitOutcome, AdminStatus } from '../types/index.ts';

interface EditVisitModalProps {
  visit: VisitRecord;
  onSave: (updated: VisitRecord) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  adminName: string;
}

export const EditVisitModal: React.FC<EditVisitModalProps> = ({
  visit,
  onSave,
  onDelete,
  onClose,
  adminName,
}) => {
  const [clientName, setClientName] = useState(visit.clientName);
  const [contactPerson, setContactPerson] = useState(visit.contactPerson);
  const [contactPhone, setContactPhone] = useState(visit.contactPhone);
  const [purpose, setPurpose] = useState<VisitPurpose>(visit.purpose);
  const [outcome, setOutcome] = useState<VisitOutcome>(visit.outcome);
  const [dealValue, setDealValue] = useState<number>(visit.dealValue);
  const [meetingDuration, setMeetingDuration] = useState<number>(visit.meetingDurationMinutes);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>(visit.adminStatus);
  const [adminNotes, setAdminNotes] = useState<string>(visit.adminNotes || '');
  const [fieldNotes, setFieldNotes] = useState<string>(visit.notes);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated: VisitRecord = {
      ...visit,
      clientName: clientName.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      purpose,
      outcome,
      dealValue: Number(dealValue) || 0,
      meetingDurationMinutes: Number(meetingDuration) || 30,
      adminStatus,
      adminNotes: adminNotes.trim(),
      notes: fieldNotes.trim(),
      lastEditedBy: `${adminName} (Admin)`,
      lastEditedAt: new Date().toISOString(),
    };
    onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Admin Exclusive Action
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-xs text-slate-300">{visit.serialNo}</span>
              </div>
              <h3 className="text-base font-bold">Edit Verified Visit Record</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only Telemetry Info Strip */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-900">{visit.locality}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-500">
              {visit.latitude.toFixed(4)}°N, {visit.longitude.toFixed(4)}°E (±{Math.round(visit.accuracyMeters)}m)
            </span>
          </div>
          <div className="text-slate-500">
            Logged by: <strong className="text-slate-800">{visit.salesPersonName}</strong>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Client / Company
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as VisitPurpose)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
              >
                <option value="Product Demo">Product Demo</option>
                <option value="Contract Negotiation">Contract Negotiation</option>
                <option value="Initial Pitch">Initial Pitch</option>
                <option value="Account Review">Account Review</option>
                <option value="Onboarding & Training">Onboarding & Training</option>
                <option value="Payment Collection">Payment Collection</option>
                <option value="Service & Support">Service & Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as VisitOutcome)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
              >
                <option value="Deal Won">Deal Won</option>
                <option value="Hot Lead / Proposal Sent">Hot Lead / Proposal Sent</option>
                <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Client Rescheduled">Client Rescheduled</option>
                <option value="Deal Lost">Deal Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Deal Value (INR)
              </label>
              <div className="relative">
                <span className="text-slate-500 font-semibold absolute left-3 top-2 text-xs">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Audit Status
              </label>
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value as AdminStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
              >
                <option value="Verified">Verified</option>
                <option value="Approved">Approved</option>
                <option value="Flagged">Flagged</option>
                <option value="Requires Clarification">Requires Clarification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Admin Audit Notes
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Verified contract document; GPS stamp reconciled with gate log."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Field Meeting Notes
            </label>
            <textarea
              rows={2}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {visit.lastEditedBy && (
            <div className="text-[11px] text-slate-500 italic">
              Last modified by {visit.lastEditedBy} on {new Date(visit.lastEditedAt || '').toLocaleString()}
            </div>
          )}

          {/* Delete confirmation alert */}
          {showConfirmDelete ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
              <div className="text-xs text-rose-800">
                Are you sure you want to permanently delete record {visit.serialNo}?
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(visit.id)}
                  className="px-2.5 py-1 text-xs text-white bg-rose-600 rounded font-medium hover:bg-rose-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Visit Record</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
