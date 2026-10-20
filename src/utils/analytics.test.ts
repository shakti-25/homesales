import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterVisits,
  generateNextSerialNo,
  calculateSalesRepMetrics,
  calculateTeamProductivityMetrics,
} from './analytics.ts';
import type { VisitRecord } from '../types/index.ts';

const mockVisits: VisitRecord[] = [
  {
    id: '1',
    serialNo: 'VN-2026-0001',
    clientName: 'Reliance Retail',
    clientCompany: 'Reliance Industries',
    contactPerson: 'Sunil Mehta',
    contactPhone: '+91 98200 12345',
    salesPersonId: 'rep-1',
    salesPersonName: 'Rahul Sharma',
    salesPersonEmail: 'rahul.s@gmail.com',
    timestamp: '2026-10-18T10:30:00.000Z',
    locality: 'Goregaon East, Mumbai',
    city: 'Mumbai',
    latitude: 19.1663,
    longitude: 72.8526,
    accuracyMeters: 8,
    isGpsVerified: true,
    purpose: 'Product Demo',
    outcome: 'Deal Won',
    dealValue: 350000,
    notes: 'Demo went great. Contract signed.',
    meetingDurationMinutes: 45,
    adminStatus: 'Verified',
  },
  {
    id: '2',
    serialNo: 'VN-2026-0002',
    clientName: 'Tata Consultancy Services',
    clientCompany: 'Tata Group',
    contactPerson: 'Ananya Roy',
    contactPhone: '+91 98200 54321',
    salesPersonId: 'rep-2',
    salesPersonName: 'Priya Patel',
    salesPersonEmail: 'priya.p@gmail.com',
    timestamp: '2026-10-19T14:15:00.000Z',
    locality: 'Bandra Kurla Complex (BKC), Mumbai',
    city: 'Mumbai',
    latitude: 19.0664,
    longitude: 72.8677,
    accuracyMeters: 10,
    isGpsVerified: true,
    purpose: 'Contract Negotiation',
    outcome: 'In Discussion',
    dealValue: 750000,
    notes: 'Procurement team reviewing pricing.',
    meetingDurationMinutes: 60,
    adminStatus: 'Approved',
  },
  {
    id: '3',
    serialNo: 'VN-2026-0003',
    clientName: 'Godrej Properties',
    clientCompany: 'Godrej Group',
    contactPerson: 'Vikram Joshi',
    contactPhone: '+91 98190 99887',
    salesPersonId: 'rep-1',
    salesPersonName: 'Rahul Sharma',
    salesPersonEmail: 'rahul.s@gmail.com',
    timestamp: '2026-10-20T11:00:00.000Z',
    locality: 'Goregaon East, Mumbai',
    city: 'Mumbai',
    latitude: 19.1663,
    longitude: 72.8526,
    accuracyMeters: 14,
    isGpsVerified: true,
    purpose: 'Initial Pitch',
    outcome: 'Follow-up Scheduled',
    dealValue: 200000,
    notes: 'Follow-up on Friday with IT director.',
    meetingDurationMinutes: 30,
    adminStatus: 'Verified',
  },
];

test('generateNextSerialNo generates incrementing sequence with current year', () => {
  const currentYear = new Date().getFullYear();
  const nextSerial = generateNextSerialNo(mockVisits);
  assert.equal(nextSerial, `VN-${currentYear}-0004`);

  const emptySerial = generateNextSerialNo([]);
  assert.equal(emptySerial, `VN-${currentYear}-0001`);
});

test('filterVisits searches by salesperson name', () => {
  const filtered = filterVisits(mockVisits, 'Rahul');
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].salesPersonName, 'Rahul Sharma');
});

test('filterVisits searches by client name', () => {
  const filtered = filterVisits(mockVisits, 'Tata');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].clientName, 'Tata Consultancy Services');
});

test('filterVisits searches by serial number', () => {
  const filtered = filterVisits(mockVisits, '0002');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].serialNo, 'VN-2026-0002');
});

test('filterVisits filters by locality', () => {
  const filtered = filterVisits(mockVisits, '', { locality: 'Goregaon East' });
  assert.equal(filtered.length, 2);
});

test('calculateSalesRepMetrics calculates accurate win rate and values', () => {
  const metrics = calculateSalesRepMetrics(mockVisits, 'rep-1', 20);
  assert.equal(metrics.totalVisits, 2);
  assert.equal(metrics.dealsWonCount, 1);
  assert.equal(metrics.totalWonValue, 350000);
  assert.equal(metrics.conversionRatePercent, 50); // 1 out of 2 = 50%
  assert.equal(metrics.topLocality, 'Goregaon East');
});

test('calculateTeamProductivityMetrics calculates executive totals', () => {
  const teamMetrics = calculateTeamProductivityMetrics(mockVisits);
  assert.equal(teamMetrics.totalVisits, 3);
  assert.equal(teamMetrics.totalWonValue, 350000);
  assert.equal(teamMetrics.gpsComplianceRate, 100);
  assert.equal(teamMetrics.topPerformers.length, 2);
});
