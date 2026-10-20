import type { VisitRecord, SalesRepMetrics, TeamProductivityMetrics, User } from '../types/index.ts';

/**
 * Filter visits with high precision matching:
 * - Search by salesperson name or email
 * - Search by client name, client company, contact person
 * - Search by serial number (exact or partial, e.g. "0042", "VN-2026-0042")
 * - Filter by locality
 * - Filter by outcome
 * - Filter by date range
 */
export function filterVisits(
  visits: VisitRecord[],
  searchTerm: string,
  options?: {
    locality?: string;
    outcome?: string;
    repId?: string;
    startDate?: string;
    endDate?: string;
  }
): VisitRecord[] {
  const query = searchTerm.trim().toLowerCase();

  return visits.filter((v) => {
    // 1. Text Search across Salesperson, Client, and Serial Number
    if (query) {
      const matchSerial = v.serialNo.toLowerCase().includes(query);
      const matchClient =
        v.clientName.toLowerCase().includes(query) ||
        v.clientCompany.toLowerCase().includes(query) ||
        v.contactPerson.toLowerCase().includes(query);
      const matchRep =
        v.salesPersonName.toLowerCase().includes(query) ||
        v.salesPersonEmail.toLowerCase().includes(query);
      const matchLocality = v.locality.toLowerCase().includes(query);

      if (!matchSerial && !matchClient && !matchRep && !matchLocality) {
        return false;
      }
    }

    // 2. Locality filter
    if (options?.locality && options.locality !== 'all') {
      if (!v.locality.toLowerCase().includes(options.locality.toLowerCase())) {
        return false;
      }
    }

    // 3. Outcome filter
    if (options?.outcome && options.outcome !== 'all') {
      if (v.outcome !== options.outcome) {
        return false;
      }
    }

    // 4. Sales Rep filter
    if (options?.repId && options.repId !== 'all') {
      if (v.salesPersonId !== options.repId && v.salesPersonEmail !== options.repId) {
        return false;
      }
    }

    // 5. Date filter
    if (options?.startDate) {
      if (new Date(v.timestamp) < new Date(options.startDate)) {
        return false;
      }
    }
    if (options?.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(v.timestamp) > end) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate next sequential clean serial number (e.g. "VN-2026-0045")
 */
export function generateNextSerialNo(existingVisits: VisitRecord[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;

  for (const v of existingVisits) {
    if (v.serialNo && v.serialNo.startsWith(`VN-${currentYear}-`)) {
      const numPart = parseInt(v.serialNo.replace(`VN-${currentYear}-`, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `VN-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Calculate per-salesperson individual performance metrics
 */
export function calculateSalesRepMetrics(
  visits: VisitRecord[],
  repIdOrEmail: string,
  targetVisits = 30
): SalesRepMetrics {
  const repVisits = visits.filter(
    (v) => v.salesPersonId === repIdOrEmail || v.salesPersonEmail === repIdOrEmail
  );

  const repName = repVisits[0]?.salesPersonName || 'Field Representative';
  const repEmail = repVisits[0]?.salesPersonEmail || repIdOrEmail;
  const totalVisits = repVisits.length;

  let dealsWonCount = 0;
  let totalWonValue = 0;
  let totalDuration = 0;
  const localityCounts: Record<string, number> = {};
  const outcomeDistribution: Record<string, number> = {};

  for (const v of repVisits) {
    // outcomes
    outcomeDistribution[v.outcome] = (outcomeDistribution[v.outcome] || 0) + 1;

    if (v.outcome === 'Deal Won') {
      dealsWonCount += 1;
      totalWonValue += v.dealValue || 0;
    }

    // localities
    const loc = v.locality.split(',')[0].trim();
    localityCounts[loc] = (localityCounts[loc] || 0) + 1;

    totalDuration += v.meetingDurationMinutes || 30;
  }

  const conversionRatePercent = totalVisits > 0 ? Math.round((dealsWonCount / totalVisits) * 100) : 0;
  const targetProgressPercent = Math.min(100, Math.round((totalVisits / targetVisits) * 100));
  const avgDurationMinutes = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

  // find top locality
  let topLocality = 'N/A';
  let maxLocCount = 0;
  for (const [loc, count] of Object.entries(localityCounts)) {
    if (count > maxLocCount) {
      maxLocCount = count;
      topLocality = loc;
    }
  }

  return {
    repId: repIdOrEmail,
    repName,
    repEmail,
    totalVisits,
    targetVisits,
    targetProgressPercent,
    dealsWonCount,
    totalWonValue,
    conversionRatePercent,
    avgDurationMinutes,
    topLocality,
    localityCounts,
    outcomeDistribution,
  };
}

/**
 * Calculate team-wide productivity metrics for executive admin dashboard
 */
export function calculateTeamProductivityMetrics(
  visits: VisitRecord[],
  users?: User[]
): TeamProductivityMetrics {
  const totalVisits = visits.length;
  let totalWonValue = 0;
  let totalWonDeals = 0;
  let verifiedGpsCount = 0;

  const localityMap: Record<string, { count: number; wonValue: number }> = {};
  const outcomeMap: Record<string, number> = {};
  const repSummaryMap: Record<string, { name: string; email: string; visits: number; wonValue: number; wonCount: number }> = {};
  const dailyDateMap: Record<string, { visits: number; wonDeals: number }> = {};

  for (const v of visits) {
    if (v.isGpsVerified) {
      verifiedGpsCount += 1;
    }

    // Outcome & Value
    outcomeMap[v.outcome] = (outcomeMap[v.outcome] || 0) + 1;
    if (v.outcome === 'Deal Won') {
      totalWonDeals += 1;
      totalWonValue += v.dealValue || 0;
    }

    // Locality aggregation
    const cleanLoc = v.locality.split(',')[0].trim();
    if (!localityMap[cleanLoc]) {
      localityMap[cleanLoc] = { count: 0, wonValue: 0 };
    }
    localityMap[cleanLoc].count += 1;
    if (v.outcome === 'Deal Won') {
      localityMap[cleanLoc].wonValue += v.dealValue || 0;
    }

    // Performer aggregation
    const repKey = v.salesPersonEmail || v.salesPersonName;
    if (!repSummaryMap[repKey]) {
      repSummaryMap[repKey] = {
        name: v.salesPersonName,
        email: v.salesPersonEmail,
        visits: 0,
        wonValue: 0,
        wonCount: 0,
      };
    }
    repSummaryMap[repKey].visits += 1;
    if (v.outcome === 'Deal Won') {
      repSummaryMap[repKey].wonCount += 1;
      repSummaryMap[repKey].wonValue += v.dealValue || 0;
    }

    // Daily Trend
    const dateObj = new Date(v.timestamp);
    const dateKey = !isNaN(dateObj.getTime())
      ? dateObj.toISOString().split('T')[0]
      : '2026-10-15';
    if (!dailyDateMap[dateKey]) {
      dailyDateMap[dateKey] = { visits: 0, wonDeals: 0 };
    }
    dailyDateMap[dateKey].visits += 1;
    if (v.outcome === 'Deal Won') {
      dailyDateMap[dateKey].wonDeals += 1;
    }
  }

  const activeRepsCount = Object.keys(repSummaryMap).length;
  const averageConversionRate = totalVisits > 0 ? Math.round((totalWonDeals / totalVisits) * 100) : 0;
  const gpsComplianceRate = totalVisits > 0 ? Math.round((verifiedGpsCount / totalVisits) * 100) : 100;

  const localityDistribution = Object.entries(localityMap)
    .map(([locality, data]) => ({
      locality,
      count: data.count,
      wonValue: data.wonValue,
    }))
    .sort((a, b) => b.count - a.count);

  const outcomeDistribution = Object.entries(outcomeMap)
    .map(([outcome, count]) => ({ outcome, count }))
    .sort((a, b) => b.count - a.count);

  const topPerformers = Object.values(repSummaryMap)
    .map((r) => ({
      repName: r.name,
      repEmail: r.email,
      visits: r.visits,
      wonValue: r.wonValue,
      conversionRate: r.visits > 0 ? Math.round((r.wonCount / r.visits) * 100) : 0,
    }))
    .sort((a, b) => b.wonValue - a.wonValue || b.visits - a.visits);

  const dailyTrend = Object.entries(dailyDateMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, d]) => {
      const parsed = new Date(date);
      const displayDate = !isNaN(parsed.getTime())
        ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date;
      return {
        date,
        displayDate,
        visits: d.visits,
        wonDeals: d.wonDeals,
      };
    });

  return {
    totalVisits,
    activeRepsCount,
    totalWonValue,
    averageConversionRate,
    gpsComplianceRate,
    localityDistribution,
    outcomeDistribution,
    topPerformers,
    dailyTrend,
  };
}

/**
 * Format Indian Rupee currency standard: e.g. Rs. 4,50,000
 */
export function formatCurrencyINR(amount: number): string {
  if (!amount || amount === 0) return 'Rs. 0';
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}
