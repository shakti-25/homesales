export type UserRole = 'admin' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  department: string;
  phone?: string;
}

export type VisitPurpose = 
  | 'Product Demo'
  | 'Contract Negotiation'
  | 'Account Review'
  | 'Onboarding & Training'
  | 'Payment Collection'
  | 'Initial Pitch'
  | 'Service & Support';

export type VisitOutcome = 
  | 'Deal Won'
  | 'Hot Lead / Proposal Sent'
  | 'Follow-up Scheduled'
  | 'In Discussion'
  | 'Deal Lost'
  | 'Client Rescheduled';

export type AdminStatus = 
  | 'Verified'
  | 'Approved'
  | 'Flagged'
  | 'Requires Clarification';

export interface VisitRecord {
  id: string;
  serialNo: string; // e.g. "VN-2026-0042"
  clientName: string;
  clientCompany: string;
  contactPerson: string;
  contactPhone: string;
  salesPersonId: string;
  salesPersonName: string;
  salesPersonEmail: string;
  timestamp: string; // ISO string
  locality: string; // e.g. "Goregaon East, Mumbai"
  subLocality?: string; // e.g. "Nesco IT Park, Western Express Highway"
  city: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  isGpsVerified: boolean;
  purpose: VisitPurpose;
  outcome: VisitOutcome;
  dealValue: number; // in INR
  notes: string;
  meetingDurationMinutes: number;
  adminStatus: AdminStatus;
  adminNotes?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface SalesRepMetrics {
  repId: string;
  repName: string;
  repEmail: string;
  totalVisits: number;
  targetVisits: number;
  targetProgressPercent: number;
  dealsWonCount: number;
  totalWonValue: number;
  conversionRatePercent: number;
  avgDurationMinutes: number;
  topLocality: string;
  localityCounts: Record<string, number>;
  outcomeDistribution: Record<string, number>;
}

export interface TeamProductivityMetrics {
  totalVisits: number;
  activeRepsCount: number;
  totalWonValue: number;
  averageConversionRate: number;
  gpsComplianceRate: number;
  localityDistribution: { locality: string; count: number; wonValue: number }[];
  outcomeDistribution: { outcome: string; count: number }[];
  topPerformers: {
    repName: string;
    repEmail: string;
    visits: number;
    wonValue: number;
    conversionRate: number;
  }[];
  dailyTrend: { date: string; displayDate: string; visits: number; wonDeals: number }[];
}
