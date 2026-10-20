import * as XLSX from 'xlsx';
import type { VisitRecord, SalesRepMetrics } from '../types/index.ts';

/**
 * Export field visits and analytics to professional Excel (.xlsx) file
 */
export function exportVisitsToExcel(
  visits: VisitRecord[],
  filenamePrefix = 'AI_Track_Live_Field_Visits'
): void {
  // 1. Transform visits into structured tabular data
  const visitsSheetData = visits.map((v, index) => ({
    'Sr No.': index + 1,
    'Visit Serial ID': v.serialNo,
    'Date': new Date(v.timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }),
    'Time': new Date(v.timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    'Sales Representative': v.salesPersonName,
    'Rep Email': v.salesPersonEmail,
    'Client / Company': v.clientName,
    'Parent Enterprise': v.clientCompany || '-',
    'Contact Person': v.contactPerson,
    'Phone': v.contactPhone,
    'Locality': v.locality,
    'Sub-Locality / Landmark': v.subLocality || '-',
    'City': v.city,
    'GPS Coordinates': `${v.latitude.toFixed(5)}, ${v.longitude.toFixed(5)}`,
    'GPS Accuracy (m)': `±${Math.round(v.accuracyMeters)}m`,
    'GPS Verification': v.isGpsVerified ? 'VERIFIED GPS' : 'MANUAL',
    'Meeting Purpose': v.purpose,
    'Outcome': v.outcome,
    'Deal Value (INR)': v.dealValue || 0,
    'Duration (Mins)': v.meetingDurationMinutes || 30,
    'Admin Verification Status': v.adminStatus,
    'Admin Notes': v.adminNotes || '-',
    'Field Notes': v.notes,
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create visits worksheet
  const wsVisits = XLSX.utils.json_to_sheet(visitsSheetData);

  // Set column widths for readability
  wsVisits['!cols'] = [
    { wch: 8 },  // Sr No.
    { wch: 16 }, // Serial ID
    { wch: 14 }, // Date
    { wch: 12 }, // Time
    { wch: 22 }, // Sales Rep
    { wch: 24 }, // Rep Email
    { wch: 26 }, // Client
    { wch: 22 }, // Parent Enterprise
    { wch: 18 }, // Contact
    { wch: 16 }, // Phone
    { wch: 28 }, // Locality
    { wch: 26 }, // Sub-locality
    { wch: 14 }, // City
    { wch: 22 }, // Coordinates
    { wch: 14 }, // Accuracy
    { wch: 16 }, // GPS Verification
    { wch: 20 }, // Purpose
    { wch: 24 }, // Outcome
    { wch: 16 }, // Deal Value
    { wch: 14 }, // Duration
    { wch: 22 }, // Admin Status
    { wch: 25 }, // Admin Notes
    { wch: 45 }, // Field Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsVisits, 'Field Visits Log');

  // 2. Summary Sheet: Rep Performance
  const repMap = new Map<string, {
    name: string;
    email: string;
    visits: number;
    dealsWon: number;
    wonValue: number;
    localities: Set<string>;
  }>();

  for (const v of visits) {
    const key = v.salesPersonEmail || v.salesPersonName;
    if (!repMap.has(key)) {
      repMap.set(key, {
        name: v.salesPersonName,
        email: v.salesPersonEmail,
        visits: 0,
        dealsWon: 0,
        wonValue: 0,
        localities: new Set(),
      });
    }
    const item = repMap.get(key)!;
    item.visits += 1;
    item.localities.add(v.locality.split(',')[0].trim());
    if (v.outcome === 'Deal Won') {
      item.dealsWon += 1;
      item.wonValue += v.dealValue || 0;
    }
  }

  const performanceSummaryData = Array.from(repMap.values()).map((r, i) => ({
    'Rank': i + 1,
    'Sales Representative': r.name,
    'Email Address': r.email,
    'Total Field Visits': r.visits,
    'Deals Won': r.dealsWon,
    'Win Conversion Rate': r.visits > 0 ? `${Math.round((r.dealsWon / r.visits) * 100)}%` : '0%',
    'Total Revenue Closed (INR)': r.wonValue,
    'Territories Covered': Array.from(r.localities).join('; '),
  }));

  const wsSummary = XLSX.utils.json_to_sheet(performanceSummaryData);
  wsSummary['!cols'] = [
    { wch: 8 },
    { wch: 24 },
    { wch: 26 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 24 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rep Performance Summary');

  // Generate Excel file and trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export clean CSV fallback
 */
export function exportVisitsToCsv(visits: VisitRecord[], filenamePrefix = 'AI_Track_Live_Visits'): void {
  const headers = [
    'Serial No',
    'Date',
    'Time',
    'Sales Representative',
    'Client Name',
    'Contact Person',
    'Phone',
    'Locality',
    'Latitude',
    'Longitude',
    'Accuracy (m)',
    'Purpose',
    'Outcome',
    'Deal Value (INR)',
    'Admin Status',
    'Notes',
  ];

  const rows = visits.map((v) => [
    `"${v.serialNo}"`,
    `"${new Date(v.timestamp).toLocaleDateString()}"`,
    `"${new Date(v.timestamp).toLocaleTimeString()}"`,
    `"${v.salesPersonName}"`,
    `"${v.clientName.replace(/"/g, '""')}"`,
    `"${v.contactPerson.replace(/"/g, '""')}"`,
    `"${v.contactPhone}"`,
    `"${v.locality.replace(/"/g, '""')}"`,
    v.latitude,
    v.longitude,
    Math.round(v.accuracyMeters),
    `"${v.purpose}"`,
    `"${v.outcome}"`,
    v.dealValue || 0,
    `"${v.adminStatus}"`,
    `"${(v.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
