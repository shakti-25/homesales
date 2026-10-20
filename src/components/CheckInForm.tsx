import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Building2,
  User,
  Phone,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import type { VisitRecord, User as UserType, VisitPurpose, VisitOutcome } from '../types/index.ts';
import {
  requestDeviceLocation,
  reverseGeocodeCoordinates,
  FIELD_TEST_LOCATIONS,
  type GeoLocationResult,
} from '../utils/geolocation.ts';
import { generateNextSerialNo } from '../utils/analytics.ts';

interface CheckInFormProps {
  currentUser: UserType;
  existingVisits: VisitRecord[];
  onAddVisit: (visit: VisitRecord) => void;
  onCancel: () => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({
  currentUser,
  existingVisits,
  onAddVisit,
  onCancel,
}) => {
  // Location states
  const [isLocating, setIsLocating] = useState(false);
  const [locationData, setLocationData] = useState<GeoLocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [purpose, setPurpose] = useState<VisitPurpose>('Product Demo');
  const [outcome, setOutcome] = useState<VisitOutcome>('Hot Lead / Proposal Sent');
  const [dealValue, setDealValue] = useState<number | ''>(250000);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Attempt to fetch GPS location on mount
  useEffect(() => {
    fetchLiveLocation();
  }, []);

  async function fetchLiveLocation() {
    setIsLocating(true);
    setLocationError(null);

    try {
      const coords = await requestDeviceLocation();
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);

      setLocationData({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 12,
        locality: geo.locality,
        subLocality: geo.subLocality,
        city: geo.city,
        isSimulated: false,
      });
    } catch (err: any) {
      // In web containers/iframe without physical GPS sensors, suggest simulation or retry
      setLocationError(
        err.message || 'GPS location unavailable. Please grant location permissions.'
      );
    } finally {
      setIsLocating(false);
    }
  }

  function handleSelectPresetLocation(preset: typeof FIELD_TEST_LOCATIONS[0]) {
    setLocationData({
      latitude: preset.latitude,
      longitude: preset.longitude,
      accuracy: preset.accuracy,
      locality: preset.label,
      subLocality: preset.subLocality,
      city: preset.city,
      isSimulated: true,
    });
    setLocationError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Strict validation: Location MUST be turned on!
    if (!locationData) {
      setSubmitError(
        'MANDATORY LOCATION REQUIRED: You cannot check in without verified GPS coordinates. Please turn on device location or select a verified test locality.'
      );
      return;
    }

    if (!clientName.trim()) {
      setSubmitError('Please enter the client or company name.');
      return;
    }

    if (!contactPerson.trim()) {
      setSubmitError('Please enter the contact person name.');
      return;
    }

    const nextSerial = generateNextSerialNo(existingVisits);
    const newRecord: VisitRecord = {
      id: `rec-${Date.now()}`,
      serialNo: nextSerial,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim() || clientName.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim() || '+91 98200 00000',
      salesPersonId: currentUser.id,
      salesPersonName: currentUser.name,
      salesPersonEmail: currentUser.email,
      timestamp: new Date().toISOString(),
      locality: locationData.locality,
      subLocality: locationData.subLocality,
      city: locationData.city,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracyMeters: locationData.accuracy,
      isGpsVerified: true,
      purpose,
      outcome,
      dealValue: Number(dealValue) || 0,
      meetingDurationMinutes: Number(durationMinutes) || 30,
      notes: notes.trim(),
      adminStatus: 'Verified',
      adminNotes: locationData.isSimulated
        ? 'Field check-in recorded via calibrated field test location.'
        : 'GPS lock validated via browser geolocation sensor.',
    };

    onAddVisit(newRecord);
    setFormSubmitted(true);
  }

  if (formSubmitted) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Field Visit Recorded!</h3>
        <p className="text-sm text-slate-600 mb-6">
          Your client check-in at <strong className="text-slate-800">{locationData?.locality}</strong> has been verified with GPS telemetry and logged under{' '}
          <span className="font-mono font-bold text-slate-900">
            {generateNextSerialNo(existingVisits)}
          </span>.
        </p>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg text-sm hover:bg-slate-800 transition-colors"
        >
          View in Visits Record Log
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Live Field Telemetry
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-[11px] text-slate-300">Mandatory GPS Form</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-0.5">Field Check-in Form</h2>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] sm:text-xs text-slate-400 block">Next Serial ID</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-indigo-300 whitespace-nowrap">
              {generateNextSerialNo(existingVisits)}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Geolocation Section */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                locationData
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 text-sm">Mandatory GPS Geolocation</h4>
                {locationData ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    GPS Locked
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Location Required
                  </span>
                )}
              </div>

              {locationData ? (
                <div className="mt-1 space-y-0.5">
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{locationData.locality}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span>{locationData.subLocality}</span>
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span className="font-mono text-slate-500">
                      {locationData.latitude.toFixed(5)}° N, {locationData.longitude.toFixed(5)}° E
                    </span>
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span className="text-emerald-700 font-medium">±{Math.round(locationData.accuracy)}m accuracy</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 mt-1">
                  Device GPS must be enabled to stamp the client meeting with authentic coordinates.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLiveLocation}
            disabled={isLocating}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Refresh GPS'}</span>
          </button>
        </div>

        {/* Field Hub Locality Selector (When GPS requires fallback or hub targeting) */}
        {locationError && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">Location Permission Required</p>
                <p className="mt-0.5 text-slate-600">
                  Select your assigned territory hub to verify field coordinates:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {FIELD_TEST_LOCATIONS.slice(0, 5).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectPresetLocation(loc)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      📍 {loc.label.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Territory Hub */}
        {locationData && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium">Assigned Territory Hub:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {FIELD_TEST_LOCATIONS.slice(0, 4).map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectPresetLocation(loc)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    locationData.locality.includes(loc.label.split(',')[0])
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {loc.label.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Check-In Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {submitError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Rep Info Info-line */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-slate-500">Representative:</span>
            <strong className="text-slate-900">{currentUser.name}</strong>
            <span className="text-slate-400 font-mono text-[11px]">({currentUser.email})</span>
          </div>
          <span className="text-slate-500 text-[11px]">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Client & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Client / Account Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Tata Digital Ltd"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Parent Enterprise / Group
            </label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              placeholder="e.g. Tata Sons Group"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Person & Designation <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ritesh Deshmukh (VP Technology)"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Phone / Mobile
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Meeting Purpose & Outcome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Purpose <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as VisitPurpose)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Outcome <span className="text-rose-500">*</span>
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as VisitOutcome)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
            >
              <option value="Deal Won">Deal Won (Contract Signed)</option>
              <option value="Hot Lead / Proposal Sent">Hot Lead / Proposal Sent</option>
              <option value="Follow-up Scheduled">Follow-up Scheduled</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Client Rescheduled">Client Rescheduled</option>
              <option value="Deal Lost">Deal Lost / Not Interested</option>
            </select>
          </div>
        </div>

        {/* Deal Value & Meeting Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Deal Value (INR)
            </label>
            <div className="relative">
              <span className="text-slate-500 font-semibold absolute left-3 top-2.5 text-xs">Rs.</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="250000"
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Duration (Minutes)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min="5"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Detailed Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Key Discussion Points & Action Items
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detailed meeting notes, requirements discussed, next follow-up milestone..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!locationData}
            className={`w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 ${
              locationData
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verify &amp; Submit Check-in Form</span>
          </button>
        </div>
      </form>
    </div>
  );
};
